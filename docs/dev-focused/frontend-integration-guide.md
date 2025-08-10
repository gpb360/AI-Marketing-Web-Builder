# Frontend Integration Guide - Magic Connector Sprint

## 🎯 Sprint Objective
Connect existing frontend components to backend APIs, replacing mock data with real AI-powered Magic Connector integration.

## 🚨 Critical Integration Points

### 1. WorkflowConnector Component Integration
**File**: `/web-builder/src/components/builder/WorkflowConnector.tsx`

**Current State**: Using mock data (lines 15-52)
```typescript
// REPLACE THIS MOCK DATA:
const availableWorkflows = [
  { id: 'lead-capture', name: 'Lead Capture', ... }
];
```

**Integration Required**:
```typescript
// ADD THIS API INTEGRATION:
import { apiClient } from '@/lib/api/client';

const { data: availableWorkflows } = await apiClient.get(
  `/magic-connector/templates/${componentType}`
);
```

### 2. Component Analysis Integration
**Backend Endpoint**: `/api/v1/magic-connector/analyze-component`

**Frontend Integration**:
```typescript
const analysisResult = await apiClient.post('/magic-connector/analyze-component', {
  component_type: componentType,
  component_data: componentProperties,
  business_context: userBusinessContext
});
```

### 3. API Client Configuration
**File**: `/web-builder/src/lib/api/client.ts`

**Current Setup**: ✅ Professional-grade API client ready
- Base URL: `http://localhost:8000/api/v1/`
- JWT authentication configured
- Retry logic and error handling implemented
- Network error recovery included

## 🔧 Implementation Steps

### Step 1: Backend API Connection (2 hours)
1. **Verify backend is running**: `cd backend && uvicorn app.main:app --reload --port 8000`
2. **Test API endpoints**: Visit `http://localhost:8000/docs` to verify Magic Connector endpoints
3. **Replace mock data** in WorkflowConnector.tsx with real API calls

### Step 2: Component Analysis Integration (3 hours)
1. **Add component analysis trigger** when user selects/places components
2. **Implement loading states** during AI analysis
3. **Handle AI analysis responses** and display workflow suggestions
4. **Add error handling** for AI service failures

### Step 3: Workflow Creation Flow (3 hours)
1. **Connect workflow creation** from AI suggestions to backend
2. **Implement workflow activation** via API calls
3. **Test end-to-end Magic Moment** journey (template → component → workflow → live site)

## 🧪 Testing Checklist

### Integration Testing
- [ ] WorkflowConnector loads real workflows from backend
- [ ] Component analysis calls return AI suggestions
- [ ] Workflow creation completes successfully
- [ ] Error states display properly when backend unavailable
- [ ] Loading states show during API calls

### Magic Moment Journey Testing
- [ ] Template selection works
- [ ] Component placement triggers analysis
- [ ] AI suggestions appear within 5 seconds
- [ ] Workflow connection completes within 30 seconds
- [ ] End-to-end journey completes in <30 minutes

## 🚨 Rollback Plan

**If API integration fails**:
1. **Revert to mock data**: Restore original mock workflow array
2. **Feature toggle**: Add feature flag to switch between mock/real data
3. **Graceful degradation**: Component continues working with mock data

## 📊 Success Criteria

**Technical Success**:
- All API integrations working without errors
- No regression in existing component functionality
- Proper error handling and loading states implemented

**Business Success**:
- Magic Moment journey completes in <30 minutes
- AI workflow suggestions appear within 5 seconds
- Workflow creation success rate >90%

## 🔗 Key Files to Modify

**Primary Files**:
- `/web-builder/src/components/builder/WorkflowConnector.tsx` (main integration)
- `/web-builder/src/lib/api/services/workflows.ts` (API service layer)

**Supporting Files**:
- `/web-builder/src/hooks/useWorkflows.ts` (React hooks)
- `/web-builder/src/components/builder/ComponentTypeHandler.tsx` (component analysis trigger)

**Testing Files**:
- `/web-builder/src/components/__tests__/WorkflowConnector.test.tsx`

---

**Estimated Timeline**: 8 hours (1 day)  
**Dependencies**: Backend Magic Connector service running on port 8000  
**Risk Level**: Low (building on existing professional infrastructure)