/**
 * CRM API Service
 */

import apiClient from '../client';
import type { 
  Contact, 
  ContactCreate, 
  ContactUpdate, 
  ContactFilters,
  EmailCampaign,
  EmailCampaignCreate,
  EmailCampaignUpdate,
  PaginatedResponse
} from '../types';

export class CRMService {
  // ============ CONTACTS ============

  /**
   * Get all contacts with optional filters
   */
  async getContacts(filters?: ContactFilters): Promise<PaginatedResponse<Contact>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.tags) params.append('tags', filters.tags.join(','));
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      return await apiClient.get<PaginatedResponse<Contact>>(`/crm/contacts?${params.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contact by ID
   */
  async getContact(contactId: number): Promise<Contact> {
    try {
      return await apiClient.get<Contact>(`/crm/contacts/${contactId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new contact
   */
  async createContact(contactData: ContactCreate): Promise<Contact> {
    try {
      return await apiClient.post<Contact>('/crm/contacts', contactData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing contact
   */
  async updateContact(contactId: number, contactData: ContactUpdate): Promise<Contact> {
    try {
      return await apiClient.put<Contact>(`/crm/contacts/${contactId}`, contactData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(contactId: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/crm/contacts/${contactId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk delete contacts
   */
  async bulkDeleteContacts(contactIds: number[]): Promise<{ message: string; deleted_count: number }> {
    try {
      return await apiClient.post('/crm/contacts/bulk-delete', { contact_ids: contactIds });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search contacts
   */
  async searchContacts(query: string, filters?: Omit<ContactFilters, 'search'>): Promise<Contact[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tags) params.append('tags', filters.tags.join(','));
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<PaginatedResponse<Contact>>(`/crm/contacts?${params.toString()}`);
      return response.items;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add tags to contact
   */
  async addContactTags(contactId: number, tags: string[]): Promise<Contact> {
    try {
      return await apiClient.post<Contact>(`/crm/contacts/${contactId}/tags`, { tags });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove tags from contact
   */
  async removeContactTags(contactId: number, tags: string[]): Promise<Contact> {
    try {
      return await apiClient.delete(`/crm/contacts/${contactId}/tags`, { tags });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update contact lead score
   */
  async updateLeadScore(contactId: number, score: number): Promise<Contact> {
    try {
      return await apiClient.patch<Contact>(`/crm/contacts/${contactId}/score`, { lead_score: score });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contact activity history
   */
  async getContactActivity(contactId: number): Promise<Array<{
    id: number;
    type: string;
    description: string;
    data: any;
    created_at: string;
  }>> {
    try {
      return await apiClient.get(`/crm/contacts/${contactId}/activity`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import contacts from CSV
   */
  async importContacts(csvFile: File): Promise<{
    imported_count: number;
    failed_count: number;
    errors: string[];
  }> {
    try {
      return await apiClient.uploadFile('/crm/contacts/import', csvFile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export contacts to CSV
   */
  async exportContacts(filters?: ContactFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tags) params.append('tags', filters.tags.join(','));
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.client.get(`/crm/contacts/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============ EMAIL CAMPAIGNS ============

  /**
   * Get all email campaigns
   */
  async getEmailCampaigns(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<EmailCampaign>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.skip) searchParams.append('skip', params.skip.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);

      return await apiClient.get<PaginatedResponse<EmailCampaign>>(`/crm/campaigns?${searchParams.toString()}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get email campaign by ID
   */
  async getEmailCampaign(campaignId: number): Promise<EmailCampaign> {
    try {
      return await apiClient.get<EmailCampaign>(`/crm/campaigns/${campaignId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new email campaign
   */
  async createEmailCampaign(campaignData: EmailCampaignCreate): Promise<EmailCampaign> {
    try {
      return await apiClient.post<EmailCampaign>('/crm/campaigns', campaignData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update email campaign
   */
  async updateEmailCampaign(campaignId: number, campaignData: EmailCampaignUpdate): Promise<EmailCampaign> {
    try {
      return await apiClient.put<EmailCampaign>(`/crm/campaigns/${campaignId}`, campaignData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete email campaign
   */
  async deleteEmailCampaign(campaignId: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/crm/campaigns/${campaignId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send email campaign
   */
  async sendEmailCampaign(campaignId: number): Promise<{
    message: string;
    recipient_count: number;
    scheduled_at?: string;
  }> {
    try {
      return await apiClient.post(`/crm/campaigns/${campaignId}/send`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Test email campaign (send to test email)
   */
  async testEmailCampaign(campaignId: number, testEmail: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(`/crm/campaigns/${campaignId}/test`, { test_email: testEmail });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: number): Promise<{
    sent_count: number;
    delivered_count: number;
    open_count: number;
    click_count: number;
    bounce_count: number;
    unsubscribe_count: number;
    open_rate: number;
    click_rate: number;
    bounce_rate: number;
  }> {
    try {
      return await apiClient.get(`/crm/campaigns/${campaignId}/analytics`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get campaign recipients
   */
  async getCampaignRecipients(campaignId: number): Promise<Array<{
    contact_id: number;
    email: string;
    status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
    sent_at: string;
    opened_at?: string;
    clicked_at?: string;
  }>> {
    try {
      return await apiClient.get(`/crm/campaigns/${campaignId}/recipients`);
    } catch (error) {
      throw error;
    }
  }

  // ============ ANALYTICS & REPORTS ============

  /**
   * Get CRM overview analytics
   */
  async getCRMOverview(): Promise<{
    total_contacts: number;
    active_contacts: number;
    total_campaigns: number;
    active_campaigns: number;
    avg_open_rate: number;
    avg_click_rate: number;
    total_revenue: number;
    growth_rate: number;
  }> {
    try {
      return await apiClient.get('/crm/analytics/overview');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contact sources analytics
   */
  async getContactSources(): Promise<Array<{
    source: string;
    count: number;
    percentage: number;
  }>> {
    try {
      return await apiClient.get('/crm/analytics/sources');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get lead scoring analytics
   */
  async getLeadScoringAnalytics(): Promise<{
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    avg_score: number;
    score_distribution: Array<{
      range: string;
      count: number;
    }>;
  }> {
    try {
      return await apiClient.get('/crm/analytics/lead-scoring');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get email performance over time
   */
  async getEmailPerformance(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    open_rate: number;
    click_rate: number;
  }>> {
    try {
      return await apiClient.get(`/crm/analytics/email-performance?timeframe=${timeframe}`);
    } catch (error) {
      throw error;
    }
  }

  // ============ AUTOMATION & TAGS ============

  /**
   * Get all available tags
   */
  async getAllTags(): Promise<Array<{
    tag: string;
    count: number;
  }>> {
    try {
      return await apiClient.get('/crm/tags');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new tag
   */
  async createTag(tagName: string): Promise<{ message: string }> {
    try {
      return await apiClient.post('/crm/tags', { name: tagName });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete tag
   */
  async deleteTag(tagName: string): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/crm/tags/${encodeURIComponent(tagName)}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contact segments
   */
  async getContactSegments(): Promise<Array<{
    id: number;
    name: string;
    description: string;
    criteria: any;
    contact_count: number;
    created_at: string;
  }>> {
    try {
      return await apiClient.get('/crm/segments');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create contact segment
   */
  async createContactSegment(segmentData: {
    name: string;
    description?: string;
    criteria: any;
  }): Promise<{
    id: number;
    name: string;
    description: string;
    criteria: any;
    contact_count: number;
    created_at: string;
  }> {
    try {
      return await apiClient.post('/crm/segments', segmentData);
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const crmService = new CRMService();

// Export for use in components and hooks
export default crmService;