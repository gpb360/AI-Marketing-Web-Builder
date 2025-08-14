/**
 * API Retry and Fallback Utilities
 * 
 * Comprehensive error handling with retry logic and fallback templates
 * Part of Story 1.3: Frontend Context-Aware Template Integration (AC: 7)
 */

import { 
  Template, 
  TemplateRecommendation, 
  BusinessAnalysisResult,
  AnalysisValidation 
} from '@/lib/types/business-context';

// =============================================================================
// Retry Configuration
// =============================================================================

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
  timeout: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'SERVER_ERROR',
    'RATE_LIMITED',
    'TEMPORARY_UNAVAILABLE'
  ],
  timeout: 30000 // 30 seconds
};

// =============================================================================
// Error Classification
// =============================================================================

export class APIError extends Error {
  public readonly statusCode?: number;
  public readonly errorCode?: string;
  public readonly retryable: boolean;
  public readonly timestamp: number;

  constructor(
    message: string, 
    statusCode?: number, 
    errorCode?: string,
    retryable = false
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.retryable = retryable;
    this.timestamp = Date.now();
  }
}

export const classifyError = (error: any): APIError => {
  // Network errors
  if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
    return new APIError('Request timeout', 408, 'TIMEOUT', true);
  }
  
  if (error.name === 'NetworkError' || !navigator.onLine) {
    return new APIError('Network error', 0, 'NETWORK_ERROR', true);
  }
  
  // HTTP status codes
  if (error.statusCode || error.status) {
    const status = error.statusCode || error.status;
    
    if (status >= 500) {
      return new APIError('Server error', status, 'SERVER_ERROR', true);
    }
    
    if (status === 429) {
      return new APIError('Rate limited', status, 'RATE_LIMITED', true);
    }
    
    if (status === 503) {
      return new APIError('Service unavailable', status, 'TEMPORARY_UNAVAILABLE', true);
    }
    
    if (status >= 400) {
      return new APIError('Client error', status, 'CLIENT_ERROR', false);
    }
  }
  
  // Generic error
  return new APIError(error.message || 'Unknown error', undefined, 'UNKNOWN_ERROR', false);
};

// =============================================================================
// Retry Logic with Exponential Backoff
// =============================================================================

export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const calculateBackoff = (
  attempt: number, 
  config: RetryConfig
): number => {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter
  return Math.min(jitteredDelay, config.maxDelay);
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: APIError;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error);
      
      // Don't retry if error is not retryable or if this is the last attempt
      if (!lastError.retryable || attempt === finalConfig.maxAttempts) {
        throw lastError;
      }
      
      // Wait before retrying
      const backoffDelay = calculateBackoff(attempt, finalConfig);
      await delay(backoffDelay);
      
      console.warn(`API request failed (attempt ${attempt}/${finalConfig.maxAttempts}), retrying in ${backoffDelay}ms:`, lastError.message);
    }
  }
  
  throw lastError!;
}

// =============================================================================
// Fallback Data Providers
// =============================================================================

export const fallbackTemplates: Template[] = [
  {
    id: 'fallback-modern-business',
    name: 'Modern Business Template',
    category: 'business',
    thumbnail: '/api/placeholder/400/300',
    preview_url: '/templates/modern-business',
    description: 'A clean, professional template perfect for modern businesses',
    features: ['Responsive Design', 'Contact Forms', 'SEO Optimized'],
    industries: ['technology', 'consulting', 'professional-services'],
    business_types: ['b2b', 'b2c']
  },
  {
    id: 'fallback-creative-portfolio',
    name: 'Creative Portfolio',
    category: 'portfolio',
    thumbnail: '/api/placeholder/400/300',
    preview_url: '/templates/creative-portfolio',
    description: 'Showcase your creative work with this stunning portfolio template',
    features: ['Image Gallery', 'Project Showcase', 'Contact Integration'],
    industries: ['creative', 'marketing', 'entertainment'],
    business_types: ['portfolio', 'b2c']
  },
  {
    id: 'fallback-saas-landing',
    name: 'SaaS Landing Page',
    category: 'landing',
    thumbnail: '/api/placeholder/400/300',
    preview_url: '/templates/saas-landing',
    description: 'Convert visitors with this high-converting SaaS landing page',
    features: ['Feature Showcase', 'Pricing Tables', 'Trial Signup'],
    industries: ['technology', 'software'],
    business_types: ['b2b', 'b2c']
  },
  {
    id: 'fallback-healthcare',
    name: 'Healthcare Professional',
    category: 'healthcare',
    thumbnail: '/api/placeholder/400/300',
    preview_url: '/templates/healthcare',
    description: 'Build trust with patients using this professional healthcare template',
    features: ['Appointment Booking', 'Service Listings', 'Patient Portal'],
    industries: ['healthcare', 'wellness'],
    business_types: ['b2c', 'professional-services']
  },
  {
    id: 'fallback-ecommerce',
    name: 'E-commerce Store',
    category: 'ecommerce',
    thumbnail: '/api/placeholder/400/300',
    preview_url: '/templates/ecommerce',
    description: 'Start selling online with this feature-rich e-commerce template',
    features: ['Product Catalog', 'Shopping Cart', 'Payment Integration'],
    industries: ['retail', 'fashion', 'electronics'],
    business_types: ['b2c', 'marketplace']
  }
];

export const getFallbackTemplateRecommendations = (
  businessContext?: BusinessAnalysisResult
): TemplateRecommendation[] => {
  if (!businessContext) {
    // Return top 3 general templates
    return fallbackTemplates.slice(0, 3).map(template => ({
      template,
      confidenceScore: 0.7,
      reasoning: {
        industryAlignment: 'General purpose template suitable for most industries',
        audienceFit: 'Designed for broad audience appeal',
        featureBenefits: template.features || [],
        designRationale: 'Clean, professional design that works for most business types'
      },
      personalizationSuggestions: [
        {
          type: 'color',
          title: 'Brand Color Integration',
          description: 'Customize colors to match your brand',
          preview: 'Color scheme preview',
          impact: 'Improved brand consistency',
          implementation_effort: 'low'
        }
      ],
      businessGoalAlignment: [
        {
          goal: 'Professional online presence',
          alignment: 85,
          description: 'Template provides professional appearance'
        }
      ],
      industryRelevance: 0.7,
      targetAudienceFit: 0.7,
      pros: ['Professional design', 'Easy to customize', 'Mobile responsive'],
      cons: ['Generic appearance', 'Limited unique features'],
      setupComplexity: 'low',
      customizationEffort: 5
    }));
  }

  // Filter templates based on business context
  const industry = businessContext.industry_classification.primary;
  const businessType = businessContext.business_type;
  
  const relevantTemplates = fallbackTemplates.filter(template => 
    template.industries?.includes(industry) || 
    template.business_types?.includes(businessType)
  );
  
  // If no relevant templates found, return top 3 general ones
  const templatesToRecommend = relevantTemplates.length > 0 
    ? relevantTemplates.slice(0, 3)
    : fallbackTemplates.slice(0, 3);
  
  return templatesToRecommend.map(template => {
    const isIndustryMatch = template.industries?.includes(industry) || false;
    const isBusinessTypeMatch = template.business_types?.includes(businessType) || false;
    
    const confidenceScore = isIndustryMatch && isBusinessTypeMatch ? 0.9 :
                           isIndustryMatch || isBusinessTypeMatch ? 0.8 : 0.7;
    
    return {
      template,
      confidenceScore,
      reasoning: {
        industryAlignment: isIndustryMatch 
          ? `Specifically designed for ${industry} industry`
          : 'Adaptable design suitable for your industry',
        audienceFit: isBusinessTypeMatch
          ? `Optimized for ${businessType} business model`
          : 'Flexible layout that works for your business type',
        featureBenefits: template.features || [],
        designRationale: 'Professional design with industry best practices'
      },
      personalizationSuggestions: [
        {
          type: 'color',
          title: 'Industry-Specific Colors',
          description: `Customize colors for ${industry} industry`,
          preview: 'Tailored color scheme',
          impact: 'Better industry alignment',
          implementation_effort: 'low'
        },
        {
          type: 'content',
          title: 'Industry Terminology',
          description: `Add ${industry}-specific language and terms`,
          preview: 'Industry-focused content',
          impact: 'Improved audience connection',
          implementation_effort: 'medium'
        }
      ],
      businessGoalAlignment: businessContext.content_requirements.slice(0, 2).map(goal => ({
        goal,
        alignment: 80,
        description: `Template supports ${goal} objectives`
      })),
      industryRelevance: isIndustryMatch ? 0.9 : 0.6,
      targetAudienceFit: isBusinessTypeMatch ? 0.9 : 0.7,
      pros: [
        'Professional design',
        'Industry-appropriate features',
        'Mobile responsive',
        'SEO optimized'
      ],
      cons: [
        'May require customization',
        'Limited to fallback features'
      ],
      setupComplexity: 'low',
      customizationEffort: isIndustryMatch ? 3 : 6
    };
  });
};

// =============================================================================
// Graceful Degradation Utilities
// =============================================================================

export const createFallbackBusinessAnalysis = (
  partialData: Partial<any>
): BusinessAnalysisResult => {
  return {
    industry_classification: {
      primary: partialData.industry || 'other',
      secondary: [],
      confidence: 0.5
    },
    target_audience: {
      demographics: partialData.target_audience ? [partialData.target_audience] : ['general'],
      psychographics: ['professional'],
      confidence: 0.5
    },
    business_type: partialData.business_type || 'b2b',
    content_requirements: partialData.business_goals || ['professional presence'],
    design_preferences: {
      modern: 0.8,
      professional: 0.9,
      minimal: 0.7
    },
    brand_personality: {
      traits: ['professional', 'trustworthy'],
      tone: 'professional',
      confidence: 0.6
    }
  };
};

export const validateAndRepairApiResponse = <T>(
  data: any,
  validator: (data: any) => boolean,
  fallbackProvider: () => T
): T => {
  try {
    if (validator(data)) {
      return data;
    }
  } catch (error) {
    console.warn('API response validation failed, using fallback:', error);
  }
  
  return fallbackProvider();
};

// =============================================================================
// Health Check and Circuit Breaker
// =============================================================================

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private failureThreshold = 5,
    private resetTimeout = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new APIError('Circuit breaker is open', 503, 'CIRCUIT_OPEN', false);
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// =============================================================================
// High-Level API Wrapper with Full Error Handling
// =============================================================================

export class ResilientAPIClient {
  private circuitBreaker = new CircuitBreaker();
  
  constructor(private config: Partial<RetryConfig> = {}) {}
  
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackProvider: () => T,
    validator?: (data: any) => boolean
  ): Promise<T> {
    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await withRetry(operation, this.config);
      });
      
      // Validate result if validator provided
      if (validator && !validator(result)) {
        console.warn('API response failed validation, using fallback');
        return fallbackProvider();
      }
      
      return result;
    } catch (error) {
      console.error('API operation failed, using fallback:', error);
      return fallbackProvider();
    }
  }
  
  getHealthStatus() {
    return this.circuitBreaker.getState();
  }
}

// =============================================================================
// Exports
// =============================================================================

export default {
  withRetry,
  classifyError,
  APIError,
  ResilientAPIClient,
  CircuitBreaker,
  getFallbackTemplateRecommendations,
  createFallbackBusinessAnalysis,
  validateAndRepairApiResponse,
  fallbackTemplates,
  defaultRetryConfig
};