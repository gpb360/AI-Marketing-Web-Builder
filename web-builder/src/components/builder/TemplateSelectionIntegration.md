# Template Selection Interface Integration Guide

This guide explains how to integrate the new Enhanced Template Selection Interface into the existing AI Marketing Web Builder.

## Components Overview

### 1. TemplateSelectionInterface
**File**: `src/components/builder/TemplateSelectionInterface.tsx`

The main template selection component with enhanced features:
- **Professional template browser** with grid/list views
- **Advanced filtering** and search capabilities  
- **Live preview** with device-responsive preview
- **One-click template application** with loading states
- **Favorites management** with local storage persistence
- **Recently used templates** tracking
- **Enhanced animations** and micro-interactions

### 2. TemplateSelectionPanel
**File**: `src/components/builder/TemplateSelectionPanel.tsx`

A slide-out panel wrapper for the template selection interface:
- **Full-screen overlay** experience
- **Confirmation dialogs** for replacing existing work
- **Integration with builder state** for better UX
- **Responsive design** for all screen sizes

### 3. useTemplateSelection Hook
**File**: `src/hooks/useTemplateSelection.ts`

Custom hook for template selection state management:
- **Centralized state management** for template operations
- **LocalStorage persistence** for favorites and recent templates
- **Advanced filtering logic** with memoized performance
- **Analytics and metrics** for template usage
- **Error handling** and loading states

### 4. TemplateSelectionTest
**File**: `src/components/builder/TemplateSelectionTest.tsx`

Comprehensive testing component for development and QA:
- **Interactive test suite** for all template operations
- **Real-time analytics** display
- **State visualization** for debugging
- **Action testing** with visual feedback

## Integration Steps

### Step 1: Basic Integration

Add the template selection interface to your builder toolbar:

```tsx
import TemplateSelectionPanel from '@/components/builder/TemplateSelectionPanel';

const BuilderToolbar = () => {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="builder-toolbar">
      {/* Existing toolbar items */}
      
      <button 
        onClick={() => setShowTemplates(true)}
        className="toolbar-button"
      >
        <Sparkles className="w-4 h-4" />
        Templates
      </button>

      <TemplateSelectionPanel
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
      />
    </div>
  );
};
```

### Step 2: Advanced Integration

Use the hook for custom template management:

```tsx
import { useTemplateSelection } from '@/hooks/useTemplateSelection';

const CustomTemplateManager = () => {
  const { state, actions, analytics } = useTemplateSelection();

  return (
    <div className="template-manager">
      {/* Custom UI using hook data */}
      <div className="template-stats">
        <div>Total: {analytics.totalTemplates}</div>
        <div>Favorites: {analytics.favoriteCount}</div>
        <div>Recent: {analytics.recentCount}</div>
      </div>

      {/* Custom template grid */}
      <div className="template-grid">
        {actions.getFilteredTemplates().map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            isFavorited={actions.isTemplateFavorited(template.id)}
            onApply={() => actions.applyTemplate(template.id)}
            onToggleFavorite={() => actions.toggleFavorite(template.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Step 3: Standalone Interface

Use the interface component directly:

```tsx
import TemplateSelectionInterface from '@/components/builder/TemplateSelectionInterface';

const TemplatesPage = () => {
  const handleTemplateApply = (templateId: string) => {
    // Custom application logic
    console.log('Applying template:', templateId);
  };

  return (
    <div className="templates-page">
      <TemplateSelectionInterface
        onTemplateApply={handleTemplateApply}
        showCategories={true}
        showPreview={true}
        maxTemplates={50} // Limit for performance
      />
    </div>
  );
};
```

## Key Features

### Enhanced Search & Filtering
- **Multi-field search**: Name, description, tags, and features
- **Category filtering**: SaaS, E-commerce, Blog, Portfolio, Corporate
- **Smart sorting**: Popular, newest, rating, alphabetical
- **Quick filters**: Premium, modern, trending templates

### Professional Preview System
- **Live template rendering** using TemplateSystem component
- **Device-responsive preview**: Desktop, tablet, mobile views
- **Full-screen preview modal** with smooth animations
- **Interactive preview**: Users can see exactly how templates will look

### One-Click Application
- **Instant template loading** with progress feedback
- **Smart conflict detection**: Warns before replacing existing work
- **Smooth transitions**: Loading states and success animations
- **Error recovery**: Graceful handling of application failures

### User Experience Enhancements
- **Favorites system**: Save templates for later use
- **Recently used**: Quick access to previously applied templates
- **Smart recommendations**: Based on usage patterns
- **Keyboard shortcuts**: For power users

### Performance Optimizations
- **Lazy image loading**: Templates load efficiently
- **Memoized filtering**: Fast search and sort operations
- **Virtual scrolling**: Handle large template libraries
- **Component caching**: Reduce re-renders

## Customization Options

### Theme Customization
```tsx
<TemplateSelectionInterface
  className="custom-template-selector"
  // Add custom styles via CSS classes
/>
```

### Feature Toggles
```tsx
<TemplateSelectionInterface
  showCategories={false}     // Hide category tabs
  showPreview={false}        // Disable preview modal
  maxTemplates={20}          // Limit templates shown
  onTemplateApply={customHandler} // Custom application logic
/>
```

### Hook Configuration
```tsx
const { state, actions } = useTemplateSelection();

// Programmatic control
actions.setSearchTerm('modern');
actions.setCategory('landing');
actions.setSortBy('newest');
```

## Testing & Development

### Use the Test Component
```tsx
import TemplateSelectionTest from '@/components/builder/TemplateSelectionTest';

// In your development routes
<Route path="/test/templates" component={TemplateSelectionTest} />
```

The test component provides:
- **Real-time state monitoring**
- **Interactive test actions**
- **Performance metrics**
- **Error debugging tools**

### Key Test Scenarios
1. **Template Application**: Verify templates apply correctly to canvas
2. **Search Functionality**: Test search across different fields
3. **Filter Combinations**: Multiple filters working together
4. **Favorites Persistence**: LocalStorage save/load functionality
5. **Preview System**: Template previews render correctly
6. **Performance**: Large template libraries load smoothly

## Migration from Existing TemplateLibrary

### Gradual Migration
```tsx
// Phase 1: Side-by-side comparison
const useNewTemplateInterface = useFeatureFlag('new-template-interface');

return useNewTemplateInterface ? (
  <TemplateSelectionInterface onTemplateApply={handleApply} />
) : (
  <TemplateLibrary className="legacy-template-library" />
);
```

### Data Migration
The new system is compatible with existing template data structure. No migration needed for:
- Template definitions (`src/data/templates.ts`)
- Builder store integration
- Existing template engine

## API Integration

### Future Enhancements
The interface is designed to work with:
- **Template marketplace APIs**
- **User-generated templates**
- **Team template sharing**
- **Template analytics tracking**

```tsx
// Example API integration
const { templates, loading } = useTemplatesAPI({
  category: state.selectedCategory,
  search: state.searchTerm,
  sort: state.sortBy
});
```

## Best Practices

### Performance
- Use `maxTemplates` prop for large libraries
- Implement virtual scrolling for 100+ templates
- Lazy load template previews
- Cache frequently accessed templates

### User Experience
- Always show loading states during template application
- Provide clear feedback for user actions
- Use confirmation dialogs for destructive actions
- Implement keyboard navigation for accessibility

### Development
- Use the test component during development
- Monitor analytics for usage patterns
- Implement error boundaries for robustness
- Add telemetry for performance monitoring

## Support & Troubleshooting

### Common Issues

**Templates not loading**: Check template data structure in `src/data/templates.ts`
**Preview not working**: Verify TemplateSystem component integration
**Favorites not persisting**: Check localStorage availability
**Search not working**: Verify template metadata includes searchable fields

### Debug Mode
```tsx
<TemplateSelectionInterface
  onTemplateApply={(id) => {
    console.log('Applying template:', id);
    // Your logic here
  }}
/>
```

The enhanced Template Selection Interface provides a professional, user-friendly experience for template browsing and application, significantly improving upon the existing template library with modern UX patterns and advanced functionality.