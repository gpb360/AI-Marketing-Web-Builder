import React from 'react';
import { cn } from '@/lib/utils';

interface FormProps {
  id?: string;
  styles?: React.CSSProperties;
  className?: string;
  props?: {
    title?: string;
    description?: string;
    fields?: Array<{
      name: string;
      type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio';
      label: string;
      placeholder?: string;
      required?: boolean;
      options?: string[];
    }>;
    submitText?: string;
    successMessage?: string;
    layout?: 'vertical' | 'horizontal' | 'grid';
    columns?: number;
    fullWidth?: boolean;
  };
}

export const Form: React.FC<FormProps> = ({ 
  styles, 
  className,
  props = {}
}) => {
  const {
    title = 'Get in Touch',
    description = 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
    fields = [
      { name: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: true },
      { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
      { name: 'message', type: 'textarea', label: 'Message', placeholder: 'Your message...', required: true }
    ],
    submitText = 'Send Message',
    successMessage = 'Thank you! Your message has been sent.',
    layout = 'vertical',
    columns = 1,
    fullWidth = false
  } = props;

  const formStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    maxWidth: '600px',
    margin: '0 auto',
    ...styles,
  };

  const renderField = (field: any) => {
    const baseInputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}{field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              className={baseInputClass}
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}{field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              className={baseInputClass}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.name} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name={field.name}
                required={field.required}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          </div>
        );
      
      default:
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}{field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              className={baseInputClass}
            />
          </div>
        );
    }
  };

  const gridClass = layout === 'grid' 
    ? `grid grid-cols-1 md:grid-cols-${columns} gap-4` 
    : layout === 'horizontal' 
    ? 'flex flex-col md:flex-row gap-4' 
    : 'space-y-4';

  return (
    <div style={formStyles} className={cn('form-section py-16', className)}>
      <div className="max-w-2xl mx-auto px-4">
        {title && (
          <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
        )}
        {description && (
          <p className="text-center text-gray-600 mb-8">{description}</p>
        )}
        
        <form className="space-y-6">
          <div className={gridClass}>
            {fields.map(renderField)}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {submitText}
          </button>
        </form>
      </div>
    </div>
  );
};