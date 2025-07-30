"""
CRM models for contact and lead management.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, ForeignKey, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from datetime import datetime

from app.models.base import Base, TimestampMixin


class ContactStatus(str, enum.Enum):
    """Contact status enumeration."""
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"
    NURTURING = "nurturing"


class ContactSource(str, enum.Enum):
    """Contact source enumeration."""
    WEBSITE = "website"
    SOCIAL_MEDIA = "social_media"
    EMAIL_CAMPAIGN = "email_campaign"
    REFERRAL = "referral"
    ADVERTISING = "advertising"
    EVENT = "event"
    COLD_OUTREACH = "cold_outreach"
    ORGANIC_SEARCH = "organic_search"
    PAID_SEARCH = "paid_search"
    OTHER = "other"


class EmailCampaignStatus(str, enum.Enum):
    """Email campaign status."""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENDING = "sending"
    SENT = "sent"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class CRMContact(Base, TimestampMixin):
    """CRM contact/lead model."""
    
    __tablename__ = "crm_contacts"
    
    # Basic contact information
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Company information
    company: Mapped[Optional[str]] = mapped_column(String(200))
    job_title: Mapped[Optional[str]] = mapped_column(String(200))
    website: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Address information
    address: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    postal_code: Mapped[Optional[str]] = mapped_column(String(20))
    country: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Lead information
    status: Mapped[ContactStatus] = mapped_column(Enum(ContactStatus), default=ContactStatus.NEW)
    source: Mapped[ContactSource] = mapped_column(Enum(ContactSource), default=ContactSource.WEBSITE)
    lead_score: Mapped[int] = mapped_column(Integer, default=0)
    
    # Additional data
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)
    custom_fields: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Engagement tracking
    last_contacted: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_activity: Mapped[Optional[datetime]] = mapped_column(DateTime)
    total_interactions: Mapped[int] = mapped_column(Integer, default=0)
    
    # Marketing preferences
    email_opted_in: Mapped[bool] = mapped_column(Boolean, default=True)
    sms_opted_in: Mapped[bool] = mapped_column(Boolean, default=False)
    marketing_preferences: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Relationships
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner: Mapped["User"] = relationship("User", back_populates="crm_contacts")
    activities: Mapped[List["CRMActivity"]] = relationship("CRMActivity", back_populates="contact")
    
    @property
    def full_name(self) -> str:
        """Get contact's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self) -> str:
        return f"<CRMContact(id={self.id}, name='{self.full_name}', email='{self.email}')>"


class CRMActivity(Base, TimestampMixin):
    """CRM activity/interaction tracking."""
    
    __tablename__ = "crm_activities"
    
    contact_id: Mapped[int] = mapped_column(ForeignKey("crm_contacts.id"), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(100), nullable=False)  # email, call, meeting, note
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Activity details
    activity_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    duration: Mapped[Optional[int]] = mapped_column(Integer)  # in minutes
    outcome: Mapped[Optional[str]] = mapped_column(String(200))
    
    # Additional data
    metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Relationships
    contact: Mapped["CRMContact"] = relationship("CRMContact", back_populates="activities")
    
    def __repr__(self) -> str:
        return f"<CRMActivity(id={self.id}, type='{self.activity_type}', contact_id={self.contact_id})>"


class EmailCampaign(Base, TimestampMixin):
    """Email marketing campaign model."""
    
    __tablename__ = "email_campaigns"
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[EmailCampaignStatus] = mapped_column(
        Enum(EmailCampaignStatus), 
        default=EmailCampaignStatus.DRAFT
    )
    
    # Campaign settings
    from_email: Mapped[str] = mapped_column(String(255), nullable=False)
    from_name: Mapped[str] = mapped_column(String(200), nullable=False)
    reply_to: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Scheduling
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Targeting
    contact_filters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    recipient_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Analytics
    delivered_count: Mapped[int] = mapped_column(Integer, default=0)
    opened_count: Mapped[int] = mapped_column(Integer, default=0)
    clicked_count: Mapped[int] = mapped_column(Integer, default=0)
    bounced_count: Mapped[int] = mapped_column(Integer, default=0)
    unsubscribed_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Campaign relationships
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    def __repr__(self) -> str:
        return f"<EmailCampaign(id={self.id}, name='{self.name}', status='{self.status}')>"