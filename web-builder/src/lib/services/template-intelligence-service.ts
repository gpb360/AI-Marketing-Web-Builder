/**
 * Template Intelligence Scoring Service
 * 
 * Part of Story 3.7: Context-Aware Template Recommendations
 * Provides AI-powered template analysis, business context matching, and intelligent scoring
 */

import {
  BusinessAnalysisRequest,
  BusinessAnalysisResult,
  TemplateRecommendation,
  TemplateIntelligenceScore,
  ScoringCriteria,
  BusinessIndustry,
  BusinessType,
  DesignStyle,
  BrandTone,
  TemplateRecommendationResponse,
  BusinessAnalysisResponse
} from '@/types/context-aware-templates';
import { 
  sampleTemplates, 
  getTemplatesForIndustry, 
  getTemplatesForBusinessType, 
  getTemplatesByDesignStyle 
} from '@/data/templates/enhanced-templates';

/**
 * Template Intelligence Scoring Engine
 * Local service for AI-powered template recommendations and business context analysis
 */
export class TemplateIntelligenceService {
  private defaultScoringCriteria: ScoringCriteria = {
    industry_weight: 0.25,
    audience_weight: 0.20,
    design_weight: 0.15,
    performance_weight: 0.20,
    conversion_weight: 0.15,
    customization_weight: 0.05
  };

  /**
   * Analyze business context and extract insights for template matching
   */
  async analyzeBusinessContext(request: BusinessAnalysisRequest): Promise<BusinessAnalysisResponse> {
    try {
      // Simulate realistic processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      const analysis = this.performBusinessAnalysis(request);
      
      return {
        analysis,
        recommendations_count: this.getCandidateTemplates(analysis).length,
        processing_time_ms: Math.random() * 1000 + 500,
        suggestions: this.generateBusinessSuggestions(analysis)
      };
    } catch (error) {
      console.error('Business context analysis failed:', error);
      throw new Error('Failed to analyze business context');
    }
  }

  /**
   * Get AI-powered template recommendations based on business context
   */
  async getTemplateRecommendations(
    businessContext: BusinessAnalysisResult,
    maxRecommendations: number = 3,
    customCriteria?: Partial<ScoringCriteria>
  ): Promise<TemplateRecommendationResponse> {
    const startTime = Date.now();
    const criteria = { ...this.defaultScoringCriteria, ...customCriteria };

    // Get candidate templates based on business context
    const candidateTemplates = this.getCandidateTemplates(businessContext);
    
    // Score and rank templates
    const scoredTemplates = await Promise.all(
      candidateTemplates.map(template => this.scoreTemplate(template, businessContext, criteria))
    );

    // Sort by confidence and take top recommendations
    const recommendations = scoredTemplates
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, maxRecommendations);

    const processingTime = Date.now() - startTime;

    return {
      recommendations,
      total_count: candidateTemplates.length,
      analysis_meta: {
        processing_time_ms: processingTime,
        confidence_threshold: 0.6,
        algorithm_version: '1.2.0'
      }
    };
  }

  /**
   * Calculate template intelligence score for business context matching
   */
  calculateIntelligenceScore(
    templateId: string,
    businessContext: BusinessAnalysisResult,
    criteria?: ScoringCriteria
  ): TemplateIntelligenceScore {
    const template = sampleTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const scoringCriteria = criteria || this.defaultScoringCriteria;
    
    // Calculate category scores
    const categoryScores = {
      industry_alignment: this.calculateIndustryAlignment(template, businessContext),
      audience_fit: this.calculateAudienceFit(template, businessContext),
      design_quality: template.rating ? template.rating / 5.0 : 0.8,
      performance: template.performance_score || 0.8,
      conversion_potential: template.conversion_optimized ? 0.9 : 0.7,
      customization_ease: this.calculateCustomizationEase(template)
    };

    // Calculate weighted overall score
    const overall_score = Object.entries(categoryScores).reduce((score, [category, value]) => {
      const weight = scoringCriteria[category + '_weight' as keyof ScoringCriteria] || 0;
      return score + (value * weight);
    }, 0);

    return {
      overall_score: Math.min(overall_score, 1.0),
      category_scores: categoryScores,
      confidence_level: this.calculateConfidenceLevel(categoryScores),
      reasoning: this.generateScoreReasoning(template, businessContext, categoryScores),
      improvement_suggestions: this.generateImprovementSuggestions(template, categoryScores)
    };
  }

  /**
   * Get personalized template customization preview
   */
  getTemplatePersonalizationPreview(
    templateId: string,
    businessContext: BusinessAnalysisResult
  ) {
    const template = sampleTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return {
      hero_text: this.generatePersonalizedHeroText(businessContext),
      cta_buttons: this.generatePersonalizedCTAs(businessContext),
      color_scheme: this.generatePersonalizedColors(businessContext),
      content_sections: this.generatePersonalizedSections(template, businessContext)
    };
  }

  /**
   * Perform comprehensive business analysis
   */
  private performBusinessAnalysis(request: BusinessAnalysisRequest): BusinessAnalysisResult {
    // Industry classification with confidence scoring
    const industryClassification = this.classifyIndustry(request);
    
    // Target audience analysis
    const targetAudience = this.analyzeTargetAudience(request);
    
    // Business type determination
    const businessType = this.determineBusinessType(request);
    
    // Content requirements based on business goals
    const contentRequirements = this.generateContentRequirements(request.business_goals);
    
    // Design preferences from business description and style
    const designPreferences = this.analyzeDesignPreferences(request);
    
    // Brand personality extraction
    const brandPersonality = this.analyzeBrandPersonality(request);

    return {
      industry_classification: industryClassification,
      target_audience: targetAudience,
      business_type: businessType,
      content_requirements: contentRequirements,
      design_preferences: designPreferences,
      brand_personality: brandPersonality
    };
  }

  private classifyIndustry(request: BusinessAnalysisRequest) {
    // Use provided industry or infer from description
    const primary = request.industry || this.inferIndustryFromDescription(request.business_description);
    
    return {
      primary,
      secondary: this.getRelatedIndustries(primary),
      confidence: request.industry ? 0.95 : 0.75
    };
  }

  private inferIndustryFromDescription(description: string): BusinessIndustry {
    const keywords = description.toLowerCase();
    
    const industryPatterns: Array<[RegExp, BusinessIndustry]> = [
      [/\b(software|app|platform|saas|tech|digital|ai|ml)\b/g, 'technology'],
      [/\b(health|medical|clinic|hospital|healthcare|pharma)\b/g, 'healthcare'],
      [/\b(bank|finance|investment|insurance|fintech|payment)\b/g, 'finance'],
      [/\b(school|education|learn|course|university|academic)\b/g, 'education'],
      [/\b(store|shop|retail|ecommerce|sell|product)\b/g, 'retail'],
      [/\b(manufacture|factory|production|industrial)\b/g, 'manufacturing'],
      [/\b(property|real estate|construction|architect)\b/g, 'real-estate'],
      [/\b(restaurant|food|catering|hospitality|dining)\b/g, 'food-service'],
      [/\b(consulting|professional|legal|accounting|service)\b/g, 'professional-services'],
      [/\b(nonprofit|charity|foundation|social)\b/g, 'nonprofit'],
      [/\b(entertainment|media|gaming|content|creative)\b/g, 'entertainment'],
      [/\b(fitness|gym|health|wellness|sport)\b/g, 'fitness'],
      [/\b(automotive|car|vehicle|transportation)\b/g, 'automotive'],
      [/\b(beauty|cosmetic|skincare|makeup|salon)\b/g, 'beauty'],
      [/\b(travel|tourism|hotel|vacation|trip)\b/g, 'travel']
    ];

    for (const [pattern, industry] of industryPatterns) {
      if (pattern.test(keywords)) {
        return industry;
      }
    }
    
    return 'professional-services';
  }

  private getRelatedIndustries(primary: BusinessIndustry): string[] {
    const industryMap: Record<BusinessIndustry, string[]> = {
      'technology': ['software', 'digital services', 'automation', 'AI/ML'],
      'healthcare': ['medical', 'wellness', 'biotech', 'telemedicine'],
      'finance': ['fintech', 'investment', 'insurance', 'banking'],
      'education': ['e-learning', 'training', 'academic', 'certification'],
      'retail': ['e-commerce', 'consumer goods', 'fashion', 'marketplace'],
      'manufacturing': ['industrial', 'production', 'supply chain', 'logistics'],
      'real-estate': ['property', 'construction', 'architecture', 'development'],
      'food-service': ['restaurant', 'catering', 'hospitality', 'delivery'],
      'professional-services': ['consulting', 'legal', 'accounting', 'advisory'],
      'nonprofit': ['charity', 'social impact', 'community', 'fundraising'],
      'entertainment': ['media', 'gaming', 'content', 'streaming'],
      'fitness': ['health', 'wellness', 'sports', 'nutrition'],
      'automotive': ['transportation', 'mobility', 'logistics', 'fleet'],
      'beauty': ['cosmetics', 'personal care', 'fashion', 'wellness'],
      'travel': ['tourism', 'hospitality', 'leisure', 'booking'],
      'other': ['general', 'diverse', 'mixed', 'multi-industry']
    };
    
    return industryMap[primary] || ['general'];
  }

  private analyzeTargetAudience(request: BusinessAnalysisRequest) {
    const audienceText = request.target_audience.toLowerCase();
    
    // Extract demographics using pattern matching
    const demographics = [];
    const agePatterns = [
      [/\b(young|millennials?|gen[- ]?z)\b/g, '18-35 years'],
      [/\b(professional|business|corporate)\b/g, '25-50 years'],
      [/\b(senior|mature|experienced)\b/g, '45+ years'],
      [/\b(student|college|university)\b/g, '18-25 years']
    ];

    let ageFound = false;
    for (const [pattern, age] of agePatterns) {
      if (pattern.test(audienceText) && !ageFound) {
        demographics.push(age);
        ageFound = true;
        break;
      }
    }

    if (!ageFound) {
      demographics.push('25-45 years');
    }

    // Add professional categories
    if (audienceText.includes('professional') || audienceText.includes('business')) {
      demographics.push('professionals');
    }
    if (audienceText.includes('consumer') || audienceText.includes('customer')) {
      demographics.push('consumers');
    }

    // Extract psychographics
    const psychographics = [];
    const psychoPatterns = [
      [/\b(tech|digital|online|internet)\b/g, 'tech-savvy'],
      [/\b(efficient|productivity|optimize)\b/g, 'efficiency-focused'],
      [/\b(growth|scaling|expansion)\b/g, 'growth-oriented'],
      [/\b(innovative|early|adopter|cutting-edge)\b/g, 'early adopters'],
      [/\b(quality|premium|high-end)\b/g, 'quality-conscious'],
      [/\b(budget|affordable|cost|price)\b/g, 'price-sensitive']
    ];

    for (const [pattern, trait] of psychoPatterns) {
      if (pattern.test(audienceText)) {
        psychographics.push(trait);
      }
    }
    
    if (psychographics.length === 0) {
      psychographics.push('value-conscious', 'quality-focused');
    }

    return {
      demographics,
      psychographics,
      confidence: 0.85
    };
  }

  private determineBusinessType(request: BusinessAnalysisRequest): BusinessType {
    const goals = request.business_goals.join(' ').toLowerCase();
    const description = request.business_description.toLowerCase();
    
    // B2B indicators
    if (
      goals.includes('lead') || 
      description.includes('b2b') || 
      description.includes('business') ||
      description.includes('enterprise') ||
      description.includes('professional')
    ) {
      return 'b2b';
    }
    
    // B2C indicators
    if (
      goals.includes('sales') || 
      description.includes('consumer') || 
      description.includes('customer') ||
      description.includes('retail') ||
      description.includes('ecommerce')
    ) {
      return 'b2c';
    }
    
    // B2B2C indicators
    if (
      description.includes('platform') || 
      description.includes('marketplace') ||
      description.includes('network')
    ) {
      return 'b2b2c';
    }
    
    // Nonprofit indicators
    if (
      description.includes('nonprofit') || 
      description.includes('charity') ||
      description.includes('foundation') ||
      goals.includes('community')
    ) {
      return 'nonprofit';
    }
    
    return 'b2b'; // Default
  }

  private generateContentRequirements(goals: string[]): string[] {
    const requirements = new Set<string>();
    
    goals.forEach(goal => {
      const goalLower = goal.toLowerCase();
      
      if (goalLower.includes('lead')) {
        requirements.add('Lead capture forms');
        requirements.add('Contact information');
        requirements.add('Newsletter signup');
      }
      if (goalLower.includes('sales') || goalLower.includes('sell')) {
        requirements.add('Product showcase');
        requirements.add('Pricing information');
        requirements.add('Purchase flow');
        requirements.add('Payment integration');
      }
      if (goalLower.includes('brand') || goalLower.includes('awareness')) {
        requirements.add('Brand storytelling');
        requirements.add('Company values');
        requirements.add('Team information');
        requirements.add('About section');
      }
      if (goalLower.includes('education') || goalLower.includes('customer') || goalLower.includes('support')) {
        requirements.add('Educational content');
        requirements.add('FAQ section');
        requirements.add('Help documentation');
        requirements.add('Resource library');
      }
      if (goalLower.includes('community') || goalLower.includes('feedback')) {
        requirements.add('Community features');
        requirements.add('User feedback');
        requirements.add('Social integration');
        requirements.add('User-generated content');
      }
      if (goalLower.includes('portfolio') || goalLower.includes('showcase')) {
        requirements.add('Portfolio gallery');
        requirements.add('Case studies');
        requirements.add('Project showcase');
        requirements.add('Client testimonials');
      }
    });

    // Add common requirements
    requirements.add('Clear value proposition');
    requirements.add('Call-to-action buttons');
    requirements.add('Contact information');
    
    return Array.from(requirements);
  }

  private analyzeDesignPreferences(request: BusinessAnalysisRequest) {
    const style = request.preferred_style;
    const description = request.business_description.toLowerCase();
    
    const preferences: Record<string, number> = {
      modern: 0.7,
      minimal: 0.6,
      professional: 0.8,
      colorful: 0.4
    };

    // Adjust based on preferred style
    if (style) {
      preferences[style] = Math.min(preferences[style] + 0.3, 1.0);
      
      // Boost related styles
      if (style === 'modern') {
        preferences.minimal = Math.min(preferences.minimal + 0.1, 1.0);
      }
      if (style === 'minimal') {
        preferences.modern = Math.min(preferences.modern + 0.1, 1.0);
        preferences.professional = Math.min(preferences.professional + 0.1, 1.0);
      }
    }

    // Adjust based on industry and description patterns
    const adjustmentPatterns = [
      [/\b(tech|software|innovation|digital|ai|modern)\b/g, { modern: 0.2, minimal: 0.1 }],
      [/\b(corporate|enterprise|business|professional)\b/g, { professional: 0.2, minimal: 0.1 }],
      [/\b(creative|design|art|bold|vibrant)\b/g, { colorful: 0.3, modern: 0.1 }],
      [/\b(clean|simple|elegant|minimal)\b/g, { minimal: 0.2, modern: 0.1 }],
      [/\b(traditional|classic|established|formal)\b/g, { professional: 0.2 }]
    ];

    for (const [pattern, adjustments] of adjustmentPatterns) {
      if (pattern.test(description)) {
        Object.entries(adjustments).forEach(([key, boost]) => {
          preferences[key] = Math.min(preferences[key] + boost, 1.0);
        });
      }
    }

    return preferences;
  }

  private analyzeBrandPersonality(request: BusinessAnalysisRequest) {
    const description = request.business_description.toLowerCase();
    const goals = request.business_goals.join(' ').toLowerCase();
    
    const traits = [];
    let tone: BrandTone = 'professional';

    // Analyze description for personality traits using pattern matching
    const traitPatterns = [
      [/\b(innovative|cutting-edge|revolutionary|advanced)\b/g, 'innovative'],
      [/\b(trust|reliable|dependable|secure|safe)\b/g, 'trustworthy'],
      [/\b(efficient|fast|quick|streamlined|optimized)\b/g, 'efficient'],
      [/\b(friendly|approachable|welcoming|warm)\b/g, 'approachable'],
      [/\b(expert|authority|leader|specialist|experienced)\b/g, 'authoritative'],
      [/\b(creative|artistic|unique|original)\b/g, 'creative'],
      [/\b(passionate|dedicated|committed|driven)\b/g, 'passionate'],
      [/\b(transparent|honest|open|authentic)\b/g, 'transparent']
    ];

    for (const [pattern, trait] of traitPatterns) {
      if (pattern.test(description) && !traits.includes(trait)) {
        traits.push(trait);
      }
    }

    // Determine tone based on context
    if (description.includes('friendly') || description.includes('approachable') || goals.includes('community')) {
      tone = 'friendly';
    } else if (description.includes('expert') || description.includes('authority') || description.includes('leader')) {
      tone = 'authoritative';
    } else if (description.includes('sophisticated') || description.includes('premium') || description.includes('luxury')) {
      tone = 'sophisticated';
    } else if (description.includes('playful') || description.includes('fun') || description.includes('creative')) {
      tone = 'playful';
    } else if (description.includes('casual') || description.includes('relaxed') || description.includes('informal')) {
      tone = 'casual';
    }

    // Default traits if none found
    if (traits.length === 0) {
      traits.push('professional', 'reliable');
    }

    return {
      traits,
      tone,
      confidence: 0.75
    };
  }

  private getCandidateTemplates(businessContext: BusinessAnalysisResult) {
    const industry = businessContext.industry_classification.primary;
    const businessType = businessContext.business_type;
    
    // Get templates by industry and business type
    const industryTemplates = getTemplatesForIndustry(industry);
    const businessTypeTemplates = getTemplatesForBusinessType(businessType);
    
    // Combine and deduplicate
    const candidateIds = new Set([
      ...industryTemplates.map(t => t.id),
      ...businessTypeTemplates.map(t => t.id)
    ]);
    
    // If no specific matches, return popular and featured templates
    if (candidateIds.size === 0) {
      return sampleTemplates
        .filter(t => t.is_featured || (t.usage_count && t.usage_count > 5000))
        .slice(0, 8);
    }
    
    return sampleTemplates.filter(t => candidateIds.has(t.id));
  }

  private async scoreTemplate(
    template: typeof sampleTemplates[0],
    businessContext: BusinessAnalysisResult,
    criteria: ScoringCriteria
  ): Promise<TemplateRecommendation> {
    const intelligenceScore = this.calculateIntelligenceScore(template.id, businessContext, criteria);
    
    return {
      template_id: template.id,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        subcategory: template.subcategory,
        tags: template.tags || [],
        thumbnail: template.thumbnail,
        preview_url: template.preview_url,
        features: template.features || [],
        target_industries: template.target_industries || [],
        target_business_types: template.target_business_types || [],
        design_style: template.design_style || [],
        complexity_level: template.complexity_level || 'intermediate',
        setup_time_minutes: template.setup_time_minutes || 30,
        responsive: template.responsive || true,
        mobile_optimized: template.mobile_optimized || true,
        seo_optimized: template.seo_optimized || true,
        analytics_ready: template.analytics_ready || false,
        conversion_optimized: template.conversion_optimized || false,
        a11y_compliant: template.a11y_compliant || true,
        performance_score: template.performance_score || 0.8,
        last_updated: template.last_updated || new Date().toISOString(),
        version: template.version || '1.0.0'
      },
      confidence_score: intelligenceScore.overall_score,
      match_reasoning: {
        industry_alignment: `Specifically optimized for ${businessContext.industry_classification.primary} industry with proven track record`,
        audience_fit: `Designed for ${businessContext.target_audience.demographics.join(', ')} matching your target audience profile`,
        feature_benefits: this.generateFeatureBenefits(template, businessContext),
        design_rationale: `${template.name} aligns perfectly with your ${businessContext.brand_personality.tone} brand tone and ${Object.entries(businessContext.design_preferences).sort(([,a], [,b]) => b - a)[0][0]} aesthetic preferences`
      },
      customization_preview: this.getTemplatePersonalizationPreview(template.id, businessContext),
      pros: this.generateTemplatePros(template),
      cons: this.generateTemplateCons(template),
      estimated_conversion_rate: this.estimateConversionRate(template, businessContext),
      setup_complexity: this.mapComplexityLevel(template.difficulty),
      customization_effort: this.calculateCustomizationEffort(template)
    };
  }

  private generateFeatureBenefits(template: typeof sampleTemplates[0], businessContext: BusinessAnalysisResult): string[] {
    const benefits = ['High conversion rate optimization', 'Mobile-first responsive design'];
    
    if (template.seo_optimized) {
      benefits.push('SEO optimized for search visibility');
    }
    
    if (template.analytics_ready) {
      benefits.push('Built-in analytics tracking');
    }
    
    if (template.a11y_compliant) {
      benefits.push('Accessibility compliant design');
    }
    
    if (template.performance_score && template.performance_score > 0.85) {
      benefits.push('High performance optimized');
    }
    
    // Add industry-specific benefits
    const industry = businessContext.industry_classification.primary;
    if (template.target_industries?.includes(industry)) {
      benefits.push(`Industry-specific components for ${industry}`);
    }
    
    return benefits.slice(0, 5);
  }

  private generateTemplatePros(template: typeof sampleTemplates[0]): string[] {
    const pros = [];
    
    if (template.rating && template.rating >= 4.5) {
      pros.push(`Excellent user satisfaction (${template.rating.toFixed(1)}/5.0 rating)`);
    }
    
    if (template.usage_count && template.usage_count > 10000) {
      pros.push(`Proven with ${template.usage_count.toLocaleString()}+ implementations`);
    } else if (template.usage_count && template.usage_count > 1000) {
      pros.push(`Successfully used by ${template.usage_count.toLocaleString()}+ businesses`);
    }
    
    if (template.mobile_optimized) {
      pros.push('Mobile-optimized and responsive design');
    }
    
    if (template.setup_time_minutes && template.setup_time_minutes <= 30) {
      pros.push('Quick and easy setup process');
    }
    
    if (template.seo_optimized) {
      pros.push('SEO-ready structure for better search rankings');
    }
    
    if (template.conversion_optimized) {
      pros.push('Conversion-optimized layout and components');
    }
    
    return pros.slice(0, 5);
  }

  private generateTemplateCons(template: typeof sampleTemplates[0]): string[] {
    const cons = [];
    
    if (template.difficulty === 'advanced') {
      cons.push('May require technical expertise for full customization');
      cons.push('Longer setup time required for advanced features');
    }
    
    if (template.is_premium) {
      cons.push('Premium template - additional cost required');
    }
    
    if (!template.analytics_ready) {
      cons.push('Analytics integration requires additional setup');
    }
    
    if (!template.a11y_compliant) {
      cons.push('May require accessibility improvements');
    }
    
    if (template.performance_score && template.performance_score < 0.8) {
      cons.push('Performance optimization may be needed');
    }
    
    return cons.slice(0, 3);
  }

  private estimateConversionRate(template: typeof sampleTemplates[0], businessContext: BusinessAnalysisResult): number {
    let baseRate = 0.065; // 6.5% base conversion rate
    
    if (template.conversion_optimized) {
      baseRate += 0.02; // +2% for conversion optimization
    }
    
    if (template.rating && template.rating >= 4.5) {
      baseRate += 0.01; // +1% for high ratings
    }
    
    // Industry-specific adjustments
    const industry = businessContext.industry_classification.primary;
    const industryModifiers: Record<BusinessIndustry, number> = {
      'technology': 0.015,
      'finance': 0.01,
      'healthcare': 0.005,
      'education': 0.005,
      'retail': 0.02,
      'professional-services': 0.01,
      'other': 0
    };
    
    baseRate += industryModifiers[industry] || 0;
    
    // Business type adjustments
    if (businessContext.business_type === 'b2c') {
      baseRate += 0.01; // B2C typically converts better
    }
    
    return Math.min(baseRate, 0.15); // Cap at 15%
  }

  private mapComplexityLevel(difficulty?: string): 'low' | 'medium' | 'high' {
    switch (difficulty) {
      case 'beginner': return 'low';
      case 'intermediate': return 'medium';
      case 'advanced': return 'high';
      default: return 'medium';
    }
  }

  private calculateCustomizationEffort(template: typeof sampleTemplates[0]): number {
    let effort = 5; // Base effort score
    
    if (template.setup_time_minutes) {
      effort = Math.ceil(template.setup_time_minutes / 10);
    }
    
    if (template.difficulty === 'advanced') {
      effort += 2;
    } else if (template.difficulty === 'beginner') {
      effort -= 1;
    }
    
    return Math.max(1, Math.min(effort, 10));
  }

  private calculateIndustryAlignment(template: typeof sampleTemplates[0], businessContext: BusinessAnalysisResult): number {
    const targetIndustries = template.target_industries || [];
    const primaryIndustry = businessContext.industry_classification.primary;
    
    if (targetIndustries.includes(primaryIndustry)) {
      return 0.95;
    }
    
    // Check for related industries
    const secondaryIndustries = businessContext.industry_classification.secondary;
    const hasSecondaryMatch = secondaryIndustries.some(industry => 
      targetIndustries.includes(industry as BusinessIndustry)
    );
    
    if (hasSecondaryMatch) {
      return 0.75;
    }
    
    // Partial match for broad categories
    const broadMatches = ['professional-services', 'technology'];
    if (targetIndustries.some(industry => broadMatches.includes(industry))) {
      return 0.6;
    }
    
    return 0.5;
  }

  private calculateAudienceFit(template: typeof sampleTemplates[0], businessContext: BusinessAnalysisResult): number {
    const templateBusinessTypes = template.target_business_types || [];
    const businessType = businessContext.business_type;
    
    if (templateBusinessTypes.includes(businessType)) {
      return 0.9;
    }
    
    // Partial match logic
    if (businessType === 'b2b2c') {
      if (templateBusinessTypes.includes('b2b') || templateBusinessTypes.includes('b2c')) {
        return 0.7;
      }
    }
    
    // Generic templates work for any business type
    if (templateBusinessTypes.length === 0) {
      return 0.6;
    }
    
    return 0.5;
  }

  private calculateCustomizationEase(template: typeof sampleTemplates[0]): number {
    const difficulty = template.difficulty || 'intermediate';
    
    switch (difficulty) {
      case 'beginner': return 0.9;
      case 'intermediate': return 0.7;
      case 'advanced': return 0.5;
      default: return 0.7;
    }
  }

  private calculateConfidenceLevel(categoryScores: Record<string, number>): number {
    const scores = Object.values(categoryScores);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    
    // Lower variance = higher confidence
    const confidenceFromVariance = Math.max(0.5, 1 - (variance * 2));
    
    // Factor in the average score
    const confidenceFromAverage = average;
    
    // Weighted combination
    return (confidenceFromVariance * 0.3) + (confidenceFromAverage * 0.7);
  }

  private generateScoreReasoning(
    template: typeof sampleTemplates[0], 
    businessContext: BusinessAnalysisResult, 
    categoryScores: Record<string, number>
  ): string[] {
    const reasoning = [];
    
    if (categoryScores.industry_alignment > 0.8) {
      reasoning.push(`Excellent industry match for ${businessContext.industry_classification.primary} businesses`);
    } else if (categoryScores.industry_alignment > 0.6) {
      reasoning.push(`Good industry compatibility with ${businessContext.industry_classification.primary} sector`);
    }
    
    if (categoryScores.design_quality > 0.8 && template.rating) {
      reasoning.push(`High-quality design with ${template.rating.toFixed(1)}/5.0 user rating`);
    }
    
    if (categoryScores.performance > 0.8) {
      reasoning.push(`Optimized performance with ${(categoryScores.performance * 100).toFixed(0)}% performance score`);
    }
    
    if (categoryScores.conversion_potential > 0.8) {
      reasoning.push('Proven conversion optimization features and layout');
    }
    
    if (template.usage_count && template.usage_count > 5000) {
      reasoning.push(`Successfully implemented by ${template.usage_count.toLocaleString()}+ businesses`);
    }
    
    if (categoryScores.customization_ease > 0.8) {
      reasoning.push('Easy to customize and maintain');
    }
    
    return reasoning.slice(0, 4);
  }

  private generateImprovementSuggestions(
    template: typeof sampleTemplates[0], 
    categoryScores: Record<string, number>
  ): string[] {
    const suggestions = [];
    
    if (categoryScores.performance < 0.8) {
      suggestions.push('Optimize images and assets for faster loading times');
    }
    
    if (categoryScores.conversion_potential < 0.8) {
      suggestions.push('Add conversion optimization elements like testimonials and social proof');
    }
    
    if (categoryScores.customization_ease < 0.7) {
      suggestions.push('Simplify customization options for easier setup and maintenance');
    }
    
    if (!template.analytics_ready) {
      suggestions.push('Integrate analytics tracking for better performance insights');
    }
    
    if (!template.a11y_compliant) {
      suggestions.push('Improve accessibility compliance for broader reach');
    }
    
    if (categoryScores.industry_alignment < 0.7) {
      suggestions.push('Add more industry-specific customization options');
    }
    
    return suggestions.slice(0, 4);
  }

  private generatePersonalizedHeroText(businessContext: BusinessAnalysisResult): string {
    const industry = businessContext.industry_classification.primary;
    const businessType = businessContext.business_type;
    const tone = businessContext.brand_personality.tone;
    
    const industryTemplates: Record<BusinessIndustry, Record<BrandTone, string>> = {
      'technology': {
        'professional': 'Transform Your Business with Cutting-Edge Technology Solutions',
        'friendly': 'Bring Your Ideas to Life with Innovative Technology',
        'authoritative': 'Leading the Future of Technology Innovation',
        'playful': 'Make Technology Work Like Magic for Your Business',
        'sophisticated': 'Elegant Technology Solutions for Modern Enterprises',
        'casual': 'Tech That Just Works for Your Business'
      },
      'healthcare': {
        'professional': 'Delivering Excellence in Healthcare Solutions',
        'friendly': 'Caring Healthcare Solutions for Everyone',
        'authoritative': 'Advanced Healthcare Solutions You Can Trust',
        'playful': 'Healthcare Made Simple and Accessible',
        'sophisticated': 'Premium Healthcare Services and Solutions',
        'casual': 'Better Healthcare, Made Easy'
      },
      'finance': {
        'professional': 'Secure Financial Solutions for Modern Business',
        'friendly': 'Financial Services That Put You First',
        'authoritative': 'Trusted Financial Expertise Since [Year]',
        'playful': 'Make Your Money Work Smarter',
        'sophisticated': 'Exclusive Financial Solutions for Discerning Clients',
        'casual': 'Simple Finance Solutions That Work'
      },
      'education': {
        'professional': 'Empowering Learning Through Innovation',
        'friendly': 'Learning Made Fun and Effective',
        'authoritative': 'Expert Education Solutions for Success',
        'playful': 'Turn Learning into an Adventure',
        'sophisticated': 'Premium Educational Excellence',
        'casual': 'Learn Better, Learn Faster'
      },
      'retail': {
        'professional': 'Elevate Your Shopping Experience',
        'friendly': 'Discover Products You\'ll Love',
        'authoritative': 'The Ultimate Shopping Destination',
        'playful': 'Shopping Made Fun and Easy',
        'sophisticated': 'Curated Excellence for Discerning Tastes',
        'casual': 'Shop Smart, Shop Happy'
      }
    };
    
    const fallbackTemplates: Record<BrandTone, string> = {
      'professional': 'Transform Your Business Today',
      'friendly': 'Solutions That Make a Difference',
      'authoritative': 'Industry-Leading Solutions',
      'playful': 'Make Success Fun and Easy',
      'sophisticated': 'Premium Solutions for Excellence',
      'casual': 'Simple Solutions That Work'
    };
    
    return industryTemplates[industry]?.[tone] || fallbackTemplates[tone] || fallbackTemplates.professional;
  }

  private generatePersonalizedCTAs(businessContext: BusinessAnalysisResult): string[] {
    const businessType = businessContext.business_type;
    const goals = businessContext.content_requirements;
    const tone = businessContext.brand_personality.tone;
    
    const ctas = [];
    
    // Goal-based CTAs
    if (goals.includes('Lead capture forms')) {
      const leadCTAs = {
        'professional': ['Request Consultation', 'Get Expert Analysis'],
        'friendly': ['Let\'s Chat', 'Get Free Help'],
        'authoritative': ['Schedule Assessment', 'Claim Your Analysis'],
        'playful': ['Let\'s Get Started', 'Try It Free'],
        'sophisticated': ['Request Private Consultation', 'Explore Solutions'],
        'casual': ['Get Started', 'Learn More']
      };
      ctas.push(...(leadCTAs[tone] || leadCTAs.professional));
    }
    
    if (goals.includes('Purchase flow') || goals.includes('Product showcase')) {
      const salesCTAs = {
        'professional': ['View Solutions', 'Request Quote'],
        'friendly': ['Shop Now', 'Find Your Perfect Match'],
        'authoritative': ['Browse Premium Collection', 'Get Pricing'],
        'playful': ['Start Shopping', 'Discover Deals'],
        'sophisticated': ['Explore Collection', 'Request Access'],
        'casual': ['Shop Now', 'Check It Out']
      };
      ctas.push(...(salesCTAs[tone] || salesCTAs.professional));
    }
    
    // Business type specific CTAs
    if (businessType === 'b2b') {
      ctas.push('Schedule Demo', 'Contact Sales');
    } else if (businessType === 'b2c') {
      ctas.push('Start Today', 'Join Now');
    }
    
    // Default CTAs if none found
    if (ctas.length === 0) {
      ctas.push('Get Started', 'Learn More', 'Contact Us');
    }
    
    return [...new Set(ctas)].slice(0, 3);
  }

  private generatePersonalizedColors(businessContext: BusinessAnalysisResult): string[] {
    const industry = businessContext.industry_classification.primary;
    const tone = businessContext.brand_personality.tone;
    const designPrefs = businessContext.design_preferences;
    
    // Industry-based color schemes
    const industryColors: Record<BusinessIndustry, string[]> = {
      'technology': ['#0066CC', '#4285F4', '#1E40AF'],
      'healthcare': ['#059669', '#10B981', '#34D399'],
      'finance': ['#1E40AF', '#2563EB', '#3B82F6'],
      'education': ['#F59E0B', '#FBBF24', '#FCD34D'],
      'retail': ['#EC4899', '#F472B6', '#FB7185'],
      'professional-services': ['#4F46E5', '#6366F1', '#8B5CF6'],
      'other': ['#4F46E5', '#6366F1', '#8B5CF6']
    };
    
    // Tone-based adjustments
    const toneAdjustments: Record<BrandTone, string[]> = {
      'professional': ['#1E40AF', '#4F46E5', '#059669'],
      'friendly': ['#10B981', '#F59E0B', '#EC4899'],
      'authoritative': ['#1E3A8A', '#374151', '#059669'],
      'playful': ['#EC4899', '#F59E0B', '#8B5CF6'],
      'sophisticated': ['#374151', '#4F46E5', '#6B7280'],
      'casual': ['#10B981', '#3B82F6', '#F472B6']
    };
    
    let colors = industryColors[industry] || industryColors.other;
    
    // Apply tone adjustment
    if (designPrefs.professional > 0.8) {
      colors = toneAdjustments.professional;
    } else if (designPrefs.colorful > 0.7) {
      colors = toneAdjustments.playful;
    } else {
      colors = toneAdjustments[tone] || colors;
    }
    
    return colors;
  }

  private generatePersonalizedSections(
    template: typeof sampleTemplates[0], 
    businessContext: BusinessAnalysisResult
  ) {
    const industry = businessContext.industry_classification.primary;
    const sections = [
      {
        id: 'hero-1',
        type: 'hero',
        title: 'Hero Section',
        content: this.generatePersonalizedHeroText(businessContext),
        customized: true,
        ai_generated: true
      }
    ];
    
    // Add industry-specific sections
    if (businessContext.content_requirements.includes('Product showcase')) {
      sections.push({
        id: 'products-1',
        type: 'products',
        title: 'Product Showcase',
        content: `Featured products and services tailored for ${industry} businesses`,
        customized: true,
        ai_generated: true
      });
    }
    
    if (businessContext.content_requirements.includes('Lead capture forms')) {
      sections.push({
        id: 'contact-1',
        type: 'contact',
        title: 'Contact Section',
        content: `Get in touch with our ${industry} experts`,
        customized: true,
        ai_generated: true
      });
    }
    
    return sections;
  }

  private generateBusinessSuggestions(analysis: BusinessAnalysisResult): string[] {
    const suggestions = [];
    
    if (analysis.industry_classification.confidence < 0.8) {
      suggestions.push('Consider providing more specific industry details for better template matching');
    }
    
    if (analysis.content_requirements.length < 3) {
      suggestions.push('Adding more business goals will help us recommend more suitable templates');
    }
    
    if (analysis.target_audience.confidence < 0.8) {
      suggestions.push('Provide more detailed target audience information for personalized recommendations');
    }
    
    if (analysis.brand_personality.confidence < 0.8) {
      suggestions.push('Consider describing your brand personality for better design alignment');
    }
    
    suggestions.push('Review your brand colors and design preferences for optimal customization');
    
    return suggestions;
  }
}

// Export singleton instance
export const templateIntelligenceService = new TemplateIntelligenceService();

// Export class for custom instances
export { TemplateIntelligenceService };