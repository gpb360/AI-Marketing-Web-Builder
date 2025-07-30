"""
CRM schemas for API request/response validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

from app.models.crm import ContactStatus, ContactSource, EmailCampaignStatus


class CRMContactBase(BaseModel):
    """Base CRM contact schema."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    source: ContactSource = ContactSource.WEBSITE
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    email_opted_in: bool = True
    sms_opted_in: bool = False


class CRMContactCreate(CRMContactBase):
    """CRM contact creation schema."""
    custom_fields: Dict[str, Any] = Field(default_factory=dict)
    marketing_preferences: Dict[str, Any] = Field(default_factory=dict)


class CRMContactUpdate(BaseModel):
    """CRM contact update schema."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    status: Optional[ContactStatus] = None
    source: Optional[ContactSource] = None
    lead_score: Optional[int] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    email_opted_in: Optional[bool] = None
    sms_opted_in: Optional[bool] = None
    marketing_preferences: Optional[Dict[str, Any]] = None


class CRMContactInDB(CRMContactBase):
    """CRM contact schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: ContactStatus
    lead_score: int
    custom_fields: Dict[str, Any]
    last_contacted: Optional[datetime]
    last_activity: Optional[datetime]
    total_interactions: int
    marketing_preferences: Dict[str, Any]
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class CRMContact(CRMContactInDB):
    """CRM contact schema for API responses."""
    full_name: str
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class CRMContactList(BaseModel):
    """CRM contact list response schema."""
    contacts: List[CRMContact]
    total: int
    page: int
    size: int
    pages: int


class CRMActivityBase(BaseModel):
    """Base CRM activity schema."""
    activity_type: str = Field(..., min_length=1, max_length=100)
    subject: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    activity_date: datetime = Field(default_factory=datetime.utcnow)
    duration: Optional[int] = None  # in minutes
    outcome: Optional[str] = None


class CRMActivityCreate(CRMActivityBase):
    """CRM activity creation schema."""
    contact_id: int
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CRMActivityUpdate(BaseModel):
    """CRM activity update schema."""
    activity_type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    activity_date: Optional[datetime] = None
    duration: Optional[int] = None
    outcome: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CRMActivityInDB(CRMActivityBase):
    """CRM activity schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    contact_id: int
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None


class CRMActivity(CRMActivityInDB):
    """CRM activity schema for API responses."""
    pass


class EmailCampaignBase(BaseModel):
    """Base email campaign schema."""
    name: str = Field(..., min_length=1, max_length=200)
    subject: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    from_email: EmailStr
    from_name: str = Field(..., min_length=1, max_length=200)
    reply_to: Optional[EmailStr] = None


class EmailCampaignCreate(EmailCampaignBase):
    """Email campaign creation schema."""
    scheduled_at: Optional[datetime] = None
    contact_filters: Dict[str, Any] = Field(default_factory=dict)


class EmailCampaignUpdate(BaseModel):
    """Email campaign update schema."""
    name: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    status: Optional[EmailCampaignStatus] = None
    from_email: Optional[EmailStr] = None
    from_name: Optional[str] = None
    reply_to: Optional[EmailStr] = None
    scheduled_at: Optional[datetime] = None
    contact_filters: Optional[Dict[str, Any]] = None


class EmailCampaignInDB(EmailCampaignBase):
    """Email campaign schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: EmailCampaignStatus
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    contact_filters: Dict[str, Any]
    recipient_count: int
    delivered_count: int
    opened_count: int
    clicked_count: int
    bounced_count: int
    unsubscribed_count: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class EmailCampaign(EmailCampaignInDB):
    """Email campaign schema for API responses."""
    pass


class CRMStats(BaseModel):
    """CRM statistics schema."""
    total_contacts: int
    new_contacts_this_month: int
    qualified_leads: int
    conversion_rate: float
    avg_lead_score: float
    active_campaigns: int