# Testing & QA Guide - Magic Connector Sprint

## 🎯 Testing Objectives
Ensure Magic Connector integration delivers reliable, high-quality user experience with <30 minute Magic Moment journey and >90% success rate.

## 🧪 Testing Strategy Overview

### Testing Pyramid
- **70% Unit Tests**: Individual component and service testing
- **20% Integration Tests**: API integration and cross-service testing  
- **10% E2E Tests**: Complete user journey validation

### Quality Gates
- **All tests pass** before merge to main
- **Performance targets met** (<5s AI analysis, <30min Magic Moment)
- **Error rates <5%** for successful operations
- **Accessibility compliance** maintained (WCAG 2.1 AA)

## 🔍 Unit Testing Strategy

### Frontend Component Tests
**Test File**: `/web-builder/src/components/__tests__/WorkflowConnector.test.tsx`

**Critical Test Cases**:
```typescript
describe('WorkflowConnector Integration', () => {
  test('loads workflow templates from API', async () => {
    mockApiClient.get.mockResolvedValue(mockWorkflowData);
    
    render(<WorkflowConnector componentType="contact-form" />);
    
    await waitFor(() => {
      expect(screen.getByText('Lead Capture')).toBeInTheDocument();
    });
    
    expect(mockApiClient.get).toHaveBeenCalledWith(
      '/magic-connector/templates/contact-form'
    );
  });

  test('handles API failure gracefully', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Network error'));
    
    render(<WorkflowConnector componentType="contact-form" />);
    
    // Should fall back to mock data or show error state
    await waitFor(() => {
      expect(screen.getByText('Connection error')).toBeInTheDocument();
    });
  });

  test('creates workflow successfully', async () => {
    mockApiClient.post.mockResolvedValue({ 
      success: true, 
      workflow_id: 'wf_123',
      message: 'Workflow connected successfully'
    });
    
    render(<WorkflowConnector componentType="contact-form" />);
    
    fireEvent.click(screen.getByText('Connect'));
    
    await waitFor(() => {
      expect(screen.getByText('Workflow connected!')).toBeInTheDocument();
    });
  });
});
```

### Backend Service Tests
**Test File**: `/backend/tests/test_magic_connector_service.py`

**Critical Test Cases**:
```python
class TestMagicConnectorService:
    async def test_analyze_component_success(self):
        """Test successful AI component analysis"""
        service = MagicConnectorService(mock_db)
        
        component = Component(
            type="contact-form",
            properties={"fields": ["name", "email"]}
        )
        
        result = await service.analyze_component_for_workflows(
            component=component,
            user=mock_user,
            site_context=mock_context
        )
        
        assert "workflow_suggestions" in result
        assert len(result["workflow_suggestions"]) > 0
        assert result["estimated_setup_time"] == "< 30 seconds"

    async def test_create_workflow_from_suggestion(self):
        """Test workflow creation from AI suggestion"""
        service = MagicConnectorService(mock_db)
        
        result = await service.create_workflow_from_suggestion(
            suggestion=mock_suggestion,
            user=mock_user,
            custom_config={}
        )
        
        assert result["success"] is True
        assert "workflow_id" in result
        assert "activation_url" in result
```

## 🔗 Integration Testing Strategy

### API Integration Tests
**Test File**: `/backend/tests/test_magic_connector_integration.py`

**Critical Integration Points**:
```python
class TestMagicConnectorIntegration:
    async def test_full_component_analysis_flow(self):
        """Test complete component analysis flow"""
        # Test frontend → backend → AI service → response
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/magic-connector/analyze-component",
                json={
                    "component_type": "contact-form",
                    "component_data": {"fields": ["name", "email"]},
                    "business_context": {"industry": "saas"}
                },
                headers={"Authorization": f"Bearer {auth_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "workflow_suggestions" in data
        assert len(data["workflow_suggestions"]) > 0

    async def test_workflow_creation_integration(self):
        """Test end-to-end workflow creation"""
        # Test suggestion → workflow creation → activation
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/magic-connector/create-workflow-from-suggestion",
                json={
                    "suggestion": mock_workflow_suggestion,
                    "custom_config": {"email": "test@example.com"}
                },
                headers={"Authorization": f"Bearer {auth_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "workflow_id" in data
```

### Database Integration Tests
```python
class TestDatabaseIntegration:
    async def test_component_workflow_connection_storage(self):
        """Test component-workflow relationship storage"""
        # Create component
        component = Component(type="contact-form", owner_id=user.id)
        await db.commit()
        
        # Create workflow connection
        connection = ComponentWorkflowConnection(
            component_id=component.id,
            workflow_id="wf_123",
            status="active"
        )
        await db.commit()
        
        # Verify relationship
        stored_connection = await db.get(ComponentWorkflowConnection, connection.id)
        assert stored_connection.component_id == component.id
        assert stored_connection.status == "active"
```

## 🌍 End-to-End Testing Strategy

### Magic Moment Journey Test
**Test File**: `/web-builder/tests/e2e/magic-moment.spec.ts`

**Complete User Journey**:
```typescript
test('Magic Moment: Template to Live Site < 30 minutes', async ({ page }) => {
  const startTime = Date.now();
  
  // Step 1: Template Selection
  await page.goto('/templates');
  await page.click('[data-testid="premium-saas-template"]');
  await page.click('[data-testid="use-template"]');
  
  // Step 2: Component Placement
  await page.waitForSelector('[data-testid="builder-canvas"]');
  await page.dragAndDrop(
    '[data-testid="contact-form-component"]',
    '[data-testid="drop-zone"]'
  );
  
  // Step 3: AI Analysis (should complete in <5 seconds)
  await page.waitForSelector('[data-testid="workflow-suggestions"]', { 
    timeout: 5000 
  });
  
  // Step 4: Workflow Connection
  await page.click('[data-testid="connect-lead-capture-workflow"]');
  await page.waitForSelector('[data-testid="workflow-connected"]', {
    timeout: 10000
  });
  
  // Step 5: Site Publishing
  await page.click('[data-testid="publish-site"]');
  await page.waitForSelector('[data-testid="site-published"]', {
    timeout: 30000
  });
  
  // Verify Magic Moment timing
  const totalTime = Date.now() - startTime;
  expect(totalTime).toBeLessThan(30 * 60 * 1000); // 30 minutes
  
  // Test workflow functionality
  const siteUrl = await page.textContent('[data-testid="site-url"]');
  await page.goto(siteUrl);
  
  // Submit test form to verify workflow
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[type="submit"]');
  
  // Verify workflow triggered (check backend logs or database)
  // This would require additional verification logic
});
```

### Cross-Browser Testing
**Browsers to Test**:
- Chrome 90+ (primary)
- Firefox 88+ (secondary)
- Safari 14+ (mobile primary)
- Edge 90+ (enterprise)

**Testing Matrix**:
```typescript
// Test configuration for multiple browsers
const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  test.describe(`Magic Connector on ${browserName}`, () => {
    test('component analysis works correctly', async ({ page }) => {
      // Test AI analysis across browsers
    });
    
    test('workflow creation completes successfully', async ({ page }) => {
      // Test workflow creation across browsers
    });
  });
});
```

## ⚡ Performance Testing

### Response Time Verification
```typescript
test('AI component analysis completes within 5 seconds', async ({ page }) => {
  await page.goto('/builder');
  
  const startTime = Date.now();
  
  // Place component to trigger analysis
  await page.dragAndDrop(
    '[data-testid="contact-form"]',
    '[data-testid="canvas"]'
  );
  
  // Wait for AI suggestions
  await page.waitForSelector('[data-testid="ai-suggestions"]');
  
  const responseTime = Date.now() - startTime;
  expect(responseTime).toBeLessThan(5000); // 5 seconds
});
```

### Load Testing
```python
# Basic load test for Magic Connector endpoints
import asyncio
import aiohttp
import time

async def test_concurrent_component_analysis():
    """Test multiple concurrent AI analysis requests"""
    concurrent_requests = 10
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        start_time = time.time()
        
        for i in range(concurrent_requests):
            task = session.post(
                'http://localhost:8000/api/v1/magic-connector/analyze-component',
                json={
                    "component_type": "contact-form",
                    "component_data": {"fields": ["name", "email"]}
                },
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks)
        end_time = time.time()
        
        # Verify all requests succeeded
        for response in responses:
            assert response.status == 200
        
        # Verify performance under load
        avg_response_time = (end_time - start_time) / concurrent_requests
        assert avg_response_time < 10.0  # 10 seconds max under load
```

## 🚨 Error Handling Testing

### Network Failure Scenarios
```typescript
test('handles backend unavailable gracefully', async ({ page }) => {
  // Block all requests to backend
  await page.route('**/api/**', route => route.abort());
  
  await page.goto('/builder');
  await page.dragAndDrop('[data-testid="contact-form"]', '[data-testid="canvas"]');
  
  // Should show error state or fall back to mock data
  await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
  
  // Component should still be functional
  await expect(page.locator('[data-testid="workflow-connector"]')).toBeVisible();
});
```

### AI Service Failure Testing
```python
async def test_ai_service_timeout_handling():
    """Test AI service timeout handling"""
    # Mock AI service to simulate timeout
    with patch('app.services.ai_service.AIService.analyze_component') as mock_ai:
        mock_ai.side_effect = asyncio.TimeoutError("AI service timeout")
        
        service = MagicConnectorService(db)
        
        result = await service.analyze_component_for_workflows(
            component=mock_component,
            user=mock_user
        )
        
        # Should return fallback suggestions
        assert "workflow_suggestions" in result
        assert result["analysis"]["confidence"] == "low"  # Fallback indicator
```

## 📊 Success Criteria Validation

### Automated Quality Gates
```yaml
# GitHub Actions quality gates
quality_gates:
  unit_test_coverage: ">80%"
  integration_test_pass_rate: "100%"
  e2e_test_pass_rate: ">95%"
  performance_requirements:
    ai_analysis_time: "<5 seconds"
    magic_moment_time: "<30 minutes"
    workflow_success_rate: ">90%"
  accessibility_compliance: "WCAG 2.1 AA"
```

### Manual QA Checklist
- [ ] Magic Moment journey completes successfully in multiple browsers
- [ ] AI component analysis provides relevant workflow suggestions
- [ ] Workflow creation and activation works end-to-end
- [ ] Error states display helpful messages to users
- [ ] Loading states provide clear feedback during operations
- [ ] Fallback behavior works when services unavailable
- [ ] Performance targets met under normal and load conditions
- [ ] Accessibility requirements maintained throughout integration

## 🔄 Testing Timeline

### Sprint Testing Schedule
**Day 1**: Unit tests for API integration
**Day 2**: Integration tests for Magic Connector flow  
**Day 3**: E2E tests for Magic Moment journey
**Day 4**: Performance testing and QA validation
**Day 5**: Bug fixes and final validation

### Continuous Testing
- **On every commit**: Unit tests and linting
- **On PR creation**: Integration tests and basic E2E tests
- **Before deployment**: Full test suite including performance tests
- **Post-deployment**: Smoke tests and monitoring validation

---

**Testing Coverage Target**: >80% overall, 100% for critical Magic Connector paths  
**Performance Targets**: <5s AI analysis, <30min Magic Moment, >90% success rate  
**Quality Gate**: All tests pass + performance targets met before production deployment