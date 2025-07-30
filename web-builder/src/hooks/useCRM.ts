/**
 * CRM Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { crmService } from '@/lib/api/services';
import type { 
  Contact, 
  ContactCreate, 
  ContactUpdate, 
  ContactFilters,
  EmailCampaign,
  EmailCampaignCreate,
  EmailCampaignUpdate,
  PaginatedResponse,
  LoadingState 
} from '@/lib/api/types';

// ============ CONTACTS HOOK ============

interface UseContactsReturn extends LoadingState {
  contacts: Contact[];
  totalContacts: number;
  currentPage: number;
  totalPages: number;
  refreshContacts: () => Promise<void>;
  loadMore: () => Promise<void>;
  createContact: (contactData: ContactCreate) => Promise<Contact>;
  updateContact: (contactId: number, contactData: ContactUpdate) => Promise<Contact>;
  deleteContact: (contactId: number) => Promise<void>;
  bulkDeleteContacts: (contactIds: number[]) => Promise<void>;
  addContactTags: (contactId: number, tags: string[]) => Promise<Contact>;
  removeContactTags: (contactId: number, tags: string[]) => Promise<Contact>;
}

interface UseContactsOptions {
  filters?: ContactFilters;
  autoLoad?: boolean;
  pageSize?: number;
}

export function useContacts(options: UseContactsOptions = {}): UseContactsReturn {
  const {
    filters = {},
    autoLoad = true,
    pageSize = 20
  } = options;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(async (
    page: number = 1, 
    append: boolean = false
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await crmService.getContacts({
        ...filters,
        skip: (page - 1) * pageSize,
        limit: pageSize
      });

      if (append) {
        setContacts(prev => [...prev, ...response.items]);
      } else {
        setContacts(response.items);
      }

      setTotalContacts(response.total);
      setCurrentPage(page);
      setTotalPages(response.pages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load contacts';
      setError(errorMessage);
      console.error('Load contacts error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  const refreshContacts = useCallback((): Promise<void> => {
    return loadContacts(1, false);
  }, [loadContacts]);

  const loadMore = useCallback((): Promise<void> => {
    if (currentPage < totalPages) {
      return loadContacts(currentPage + 1, true);
    }
    return Promise.resolve();
  }, [loadContacts, currentPage, totalPages]);

  const createContact = useCallback(async (contactData: ContactCreate): Promise<Contact> => {
    try {
      setIsLoading(true);
      setError(null);

      const newContact = await crmService.createContact(contactData);
      
      // Add to the beginning of the list
      setContacts(prev => [newContact, ...prev]);
      setTotalContacts(prev => prev + 1);

      return newContact;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create contact';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (
    contactId: number, 
    contactData: ContactUpdate
  ): Promise<Contact> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedContact = await crmService.updateContact(contactId, contactData);
      
      // Update in the list
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? updatedContact : contact
      ));

      return updatedContact;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update contact';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (contactId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await crmService.deleteContact(contactId);
      
      // Remove from the list
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      setTotalContacts(prev => prev - 1);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete contact';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkDeleteContacts = useCallback(async (contactIds: number[]): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await crmService.bulkDeleteContacts(contactIds);
      
      // Remove from the list
      setContacts(prev => prev.filter(contact => !contactIds.includes(contact.id)));
      setTotalContacts(prev => prev - contactIds.length);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete contacts';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addContactTags = useCallback(async (
    contactId: number, 
    tags: string[]
  ): Promise<Contact> => {
    try {
      setError(null);

      const updatedContact = await crmService.addContactTags(contactId, tags);
      
      // Update in the list
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? updatedContact : contact
      ));

      return updatedContact;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add tags to contact';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const removeContactTags = useCallback(async (
    contactId: number, 
    tags: string[]
  ): Promise<Contact> => {
    try {
      setError(null);

      const updatedContact = await crmService.removeContactTags(contactId, tags);
      
      // Update in the list
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? updatedContact : contact
      ));

      return updatedContact;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove tags from contact';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Load contacts on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      loadContacts();
    }
  }, [autoLoad, loadContacts]);

  // Reload when filters change
  useEffect(() => {
    if (autoLoad) {
      loadContacts(1, false);
    }
  }, [filters, autoLoad, loadContacts]);

  return {
    contacts,
    totalContacts,
    currentPage,
    totalPages,
    isLoading,
    error,
    refreshContacts,
    loadMore,
    createContact,
    updateContact,
    deleteContact,
    bulkDeleteContacts,
    addContactTags,
    removeContactTags
  };
}

// ============ SINGLE CONTACT HOOK ============

export function useContact(contactId: number | null) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContact = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const contactData = await crmService.getContact(id);
      setContact(contactData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load contact';
      setError(errorMessage);
      console.error('Load contact error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contactId) {
      loadContact(contactId);
    } else {
      setContact(null);
    }
  }, [contactId, loadContact]);

  return {
    contact,
    isLoading,
    error,
    refreshContact: () => contactId ? loadContact(contactId) : Promise.resolve()
  };
}

// ============ EMAIL CAMPAIGNS HOOK ============

interface UseEmailCampaignsReturn extends LoadingState {
  campaigns: EmailCampaign[];
  totalCampaigns: number;
  currentPage: number;
  totalPages: number;
  refreshCampaigns: () => Promise<void>;
  loadMore: () => Promise<void>;
  createCampaign: (campaignData: EmailCampaignCreate) => Promise<EmailCampaign>;
  updateCampaign: (campaignId: number, campaignData: EmailCampaignUpdate) => Promise<EmailCampaign>;
  deleteCampaign: (campaignId: number) => Promise<void>;
  sendCampaign: (campaignId: number) => Promise<{ message: string; recipient_count: number }>;
  testCampaign: (campaignId: number, testEmail: string) => Promise<{ message: string }>;
}

interface UseEmailCampaignsOptions {
  filters?: {
    status?: string;
  };
  autoLoad?: boolean;
  pageSize?: number;
}

export function useEmailCampaigns(options: UseEmailCampaignsOptions = {}): UseEmailCampaignsReturn {
  const {
    filters = {},
    autoLoad = true,
    pageSize = 20
  } = options;

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async (
    page: number = 1, 
    append: boolean = false
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await crmService.getEmailCampaigns({
        ...filters,
        skip: (page - 1) * pageSize,
        limit: pageSize
      });

      if (append) {
        setCampaigns(prev => [...prev, ...response.items]);
      } else {
        setCampaigns(response.items);
      }

      setTotalCampaigns(response.total);
      setCurrentPage(page);
      setTotalPages(response.pages);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load email campaigns';
      setError(errorMessage);
      console.error('Load campaigns error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  const refreshCampaigns = useCallback((): Promise<void> => {
    return loadCampaigns(1, false);
  }, [loadCampaigns]);

  const loadMore = useCallback((): Promise<void> => {
    if (currentPage < totalPages) {
      return loadCampaigns(currentPage + 1, true);
    }
    return Promise.resolve();
  }, [loadCampaigns, currentPage, totalPages]);

  const createCampaign = useCallback(async (campaignData: EmailCampaignCreate): Promise<EmailCampaign> => {
    try {
      setIsLoading(true);
      setError(null);

      const newCampaign = await crmService.createEmailCampaign(campaignData);
      
      // Add to the beginning of the list
      setCampaigns(prev => [newCampaign, ...prev]);
      setTotalCampaigns(prev => prev + 1);

      return newCampaign;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create email campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (
    campaignId: number, 
    campaignData: EmailCampaignUpdate
  ): Promise<EmailCampaign> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedCampaign = await crmService.updateEmailCampaign(campaignId, campaignData);
      
      // Update in the list
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? updatedCampaign : campaign
      ));

      return updatedCampaign;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update email campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCampaign = useCallback(async (campaignId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await crmService.deleteEmailCampaign(campaignId);
      
      // Remove from the list
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      setTotalCampaigns(prev => prev - 1);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete email campaign';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendCampaign = useCallback(async (campaignId: number) => {
    try {
      setError(null);

      const result = await crmService.sendEmailCampaign(campaignId);
      
      // Update campaign status
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: 'sent' as const, sent_at: new Date().toISOString() }
          : campaign
      ));

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send email campaign';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const testCampaign = useCallback(async (campaignId: number, testEmail: string) => {
    try {
      setError(null);

      const result = await crmService.testEmailCampaign(campaignId, testEmail);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to test email campaign';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Load campaigns on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      loadCampaigns();
    }
  }, [autoLoad, loadCampaigns]);

  // Reload when filters change
  useEffect(() => {
    if (autoLoad) {
      loadCampaigns(1, false);
    }
  }, [filters, autoLoad, loadCampaigns]);

  return {
    campaigns,
    totalCampaigns,
    currentPage,
    totalPages,
    isLoading,
    error,
    refreshCampaigns,
    loadMore,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    testCampaign
  };
}

// ============ CRM ANALYTICS HOOK ============

export function useCRMAnalytics() {
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const overviewData = await crmService.getCRMOverview();
      setOverview(overviewData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load CRM analytics';
      setError(errorMessage);
      console.error('Load CRM analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    overview,
    isLoading,
    error,
    refresh: loadAnalytics
  };
}