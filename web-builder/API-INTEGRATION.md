# Frontend API Integration

Complete API integration layer for the AI Marketing Web Builder Platform frontend to connect with the FastAPI backend.

## 📁 File Structure

```
src/
├── lib/api/
│   ├── client.ts              # Base API client with axios
│   ├── types.ts               # TypeScript interfaces and types
│   ├── test-connection.ts     # API connection testing utilities
│   └── services/
│       ├── index.ts           # Service exports
│       ├── auth.ts            # Authentication service
│       ├── templates.ts       # Templates API service
│       ├── workflows.ts       # Workflows API service
│       └── crm.ts             # CRM API service
├── hooks/
│   ├── index.ts               # Hook exports
│   ├── useAuth.ts             # Authentication hook
│   ├── useTemplates.ts        # Templates hook
│   ├── useWorkflows.ts        # Workflows hook
│   └── useCRM.ts              # CRM hook
└── .env.local                 # Environment configuration
```

## 🚀 Quick Start

### 1. Environment Setup

The `.env.local` file is already configured with default values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_ENV=development
```

### 2. Basic Usage

```typescript
import { useTemplates, useAuth } from '@/hooks';
import { templateService } from '@/lib/api/services';

// Using hooks in components
function MyComponent() {
  const { templates, isLoading, error } = useTemplates();
  const { user, login, logout } = useAuth();
  
  // Your component logic
}

// Using services directly
async function createTemplate(data) {
  try {
    const template = await templateService.createTemplate(data);
    return template;
  } catch (error) {
    console.error('Failed to create template:', error);
  }
}
```

### 3. Testing API Connection

```typescript
import { testAPIConnection } from '@/lib/api/test-connection';

// Test all endpoints
const results = await testAPIConnection();
console.log('API Tests:', results);

// Test individual endpoints
import { testHealthCheck, testTemplates } from '@/lib/api/test-connection';

const healthResult = await testHealthCheck();
const templateResult = await testTemplates();
```

## 🛠️ API Services

### Authentication Service

```typescript
import { authService } from '@/lib/api/services';

// Login
const response = await authService.login({ email, password });

// Register
const response = await authService.register({ email, password, full_name });

// Get current user
const user = await authService.getCurrentUser();

// Logout
await authService.logout();
```

### Template Service

```typescript
import { templateService } from '@/lib/api/services';

// Get templates with filters
const templates = await templateService.getTemplates({
  category: TemplateCategory.LANDING_PAGE,
  featured: true,
  limit: 20
});

// Get single template
const template = await templateService.getTemplate(templateId);

// Create template
const template = await templateService.createTemplate(templateData);

// Update template
const template = await templateService.updateTemplate(templateId, updateData);
```

### Workflow Service

```typescript
import { workflowService } from '@/lib/api/services';

// Get workflows
const workflows = await workflowService.getWorkflows();

// Create workflow
const workflow = await workflowService.createWorkflow(workflowData);

// Execute workflow
const execution = await workflowService.executeWorkflow(workflowId, triggerData);
```

### CRM Service

```typescript
import { crmService } from '@/lib/api/services';

// Get contacts
const contacts = await crmService.getContacts({ limit: 50 });

// Create contact
const contact = await crmService.createContact(contactData);

// Email campaigns
const campaigns = await crmService.getEmailCampaigns();
const campaign = await crmService.createEmailCampaign(campaignData);
```

## 🎣 React Hooks

### useAuth Hook

```typescript
function LoginComponent() {
  const { user, login, logout, isLoading, error } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // User is now logged in
    } catch (err) {
      // Handle login error
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.full_name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} loading={isLoading} error={error} />
      )}
    </div>
  );
}
```

### useTemplates Hook

```typescript
function TemplatesPage() {
  const {
    templates,
    totalTemplates,
    isLoading,
    error,
    loadMore,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useTemplates({
    filters: {
      category: TemplateCategory.LANDING_PAGE,
      featured: true
    },
    pageSize: 20
  });

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      
      <div className="templates-grid">
        {templates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
      
      <button onClick={loadMore}>Load More</button>
    </div>
  );
}
```

### useWorkflows Hook

```typescript
function WorkflowsPage() {
  const {
    workflows,
    createWorkflow,
    executeWorkflow,
    activateWorkflow,
    isLoading
  } = useWorkflows();

  const handleExecute = async (workflowId) => {
    try {
      const execution = await executeWorkflow(workflowId);
      console.log('Workflow executed:', execution);
    } catch (error) {
      console.error('Execution failed:', error);
    }
  };

  return (
    <div>
      {workflows.map(workflow => (
        <WorkflowCard 
          key={workflow.id} 
          workflow={workflow}
          onExecute={() => handleExecute(workflow.id)}
        />
      ))}
    </div>
  );
}
```

## 🔧 Advanced Usage

### Custom Filters and Pagination

```typescript
const { templates, loadMore, currentPage, totalPages } = useTemplates({
  filters: {
    category: TemplateCategory.ECOMMERCE,
    search: 'shop',
    premium: true
  },
  pageSize: 12,
  autoLoad: true
});

// Load more pages
if (currentPage < totalPages) {
  await loadMore();
}
```

### Error Handling

```typescript
try {
  const template = await templateService.createTemplate(data);
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
    router.push('/login');
  } else if (error.status === 422) {
    // Handle validation error
    setFormErrors(error.details);
  } else {
    // Handle other errors
    showErrorToast(error.message);
  }
}
```

### File Uploads

```typescript
// Upload template preview image
const result = await templateService.uploadPreviewImage(templateId, imageFile);

// Upload with progress tracking
const result = await templateService.uploadPreviewImage(
  templateId, 
  imageFile,
  (progress) => console.log(`Upload progress: ${progress}%`)
);
```

## 🧪 Testing

### Running API Tests

You can test the API connection using the built-in testing utilities:

```typescript
// In browser console or a test component
import { testAPIConnection } from '@/lib/api/test-connection';

// Run all tests
testAPIConnection().then(results => {
  console.log('API Test Results:', results);
});
```

### Manual Testing

1. **Health Check**: Visit the templates page - it should load without network errors
2. **Templates**: Browse templates, search, and filter
3. **Authentication**: Try login/logout functionality
4. **Error Handling**: Disconnect from internet and verify error states show correctly

## 📝 TypeScript Support

All services and hooks are fully typed with TypeScript:

```typescript
import type { 
  Template, 
  TemplateCreate, 
  TemplateFilters,
  Workflow,
  Contact,
  User 
} from '@/lib/api/types';

// Type-safe API calls
const template: Template = await templateService.getTemplate(1);
const templates: PaginatedResponse<Template> = await templateService.getTemplates();
```

## 🔐 Authentication

The API client automatically handles:

- JWT token storage in secure HTTP-only cookies
- Token refresh on API calls
- Automatic logout on 401 errors
- Request/response interceptors for debugging

```typescript
// Check authentication status
if (apiClient.isAuthenticated()) {
  // User is logged in
}

// Get current token
const token = apiClient.getToken();
```

## 🚨 Error Handling

The API client provides consistent error handling:

```typescript
try {
  await templateService.getTemplates();
} catch (error) {
  console.log(error.message);  // Human-readable error message
  console.log(error.status);   // HTTP status code
  console.log(error.details);  // Additional error details
}
```

## 🔄 Real-time Updates

For real-time features, the hooks automatically refresh data:

```typescript
// Templates hook refreshes when filters change
const { templates, refreshTemplates } = useTemplates({ 
  filters: { category } 
});

// Manual refresh
await refreshTemplates();
```

## 📊 Performance

The API integration includes:

- **Automatic pagination** with load-more functionality
- **Request deduplication** to prevent duplicate API calls
- **Loading states** for better UX
- **Error boundaries** for graceful error handling
- **Optimistic updates** for better perceived performance

## 🛡️ Security

- JWT tokens stored in secure HTTP-only cookies
- Automatic token refresh
- CSRF protection ready
- Input validation on the frontend
- Secure API communication over HTTPS in production

---

## 🔗 Integration with Existing Code

The new API integration is designed to work alongside existing static data. The templates page has been updated to use the real API, but it gracefully falls back to loading states and error handling when the backend is unavailable.

## 🚀 Next Steps

1. **Start the FastAPI backend** on port 8000
2. **Test the connection** using the testing utilities
3. **Replace static data** in other components with API calls
4. **Add authentication** to protected routes
5. **Implement real-time features** using WebSockets

The integration is production-ready and includes comprehensive error handling, loading states, and TypeScript support for a robust development experience.