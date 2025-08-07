"""CRM models for contact and email management."""

from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.types import JSON, ARRAY
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel, UUIDMixin, TimestampMixin


class ContactStatus(str, enum.Enum):
    """Contact status options."""
    ACTIVE = "active"
    UNSUBSCRIBED = "unsubscribed"
    BOUNCED = "bounced"
    SPAM = "spam"
    ARCHIVED = "archived"


class ActivityType(str, enum.Enum):
    """Contact activity types."""
    FORM_SUBMISSION = "form_submission"
    EMAIL_OPENED = "email_opened"
    EMAIL_CLICKED = "email_clicked"
    PAGE_VIEW = "page_view"
    DOWNLOAD = "download"
    PURCHASE = "purchase"
    WORKFLOW_TRIGGER = "workflow_trigger"
    CUSTOM_EVENT = "custom_event"


class CampaignStatus(str, enum.Enum):
    """Email campaign status."""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENDING = "sending"
    SENT = "sent"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class CampaignType(str, enum.Enum):
    """Email campaign types."""
    BROADCAST = "broadcast"
    DRIP = "drip"
    AUTOMATED = "automated"
    A_B_TEST = "a_b_test"


class EmailStatus(str, enum.Enum):
    """Individual email send status."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    OPENED = "opened"
    CLICKED = "clicked"
    BOUNCED = "bounced"
    UNSUBSCRIBED = "unsubscribed"
    SPAM = "spam"


class Contact(BaseModel, UUIDMixin, TimestampMixin):
    """CRM contact record."""
    
    __tablename__ = "contacts"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Contact information
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(50))
    company = Column(String(255))
    job_title = Column(String(255))
    
    # Source tracking
    source_component = Column(String(100))  # Component that captured this contact
    source_workflow = Column(String(36))  # Workflow that created this contact
    source_url = Column(String(500))  # URL where contact was captured
    source_campaign = Column(String(255))  # UTM campaign
    
    # Contact management
    status = Column(SQLEnum(ContactStatus), default=ContactStatus.ACTIVE)
    tags = Column(JSON, default=list)  # JSON array for SQLite compatibility
    custom_fields = Column(JSON, default=dict)
    
    # Scoring and segmentation
    lead_score = Column(Integer, default=0)
    lifecycle_stage = Column(String(50), default="subscriber")  # subscriber, lead, opportunity, customer
    
    # Engagement tracking
    email_opens = Column(Integer, default=0)
    email_clicks = Column(Integer, default=0)
    last_email_opened = Column(DateTime)
    last_activity = Column(DateTime)
    
    # Preferences
    email_subscribed = Column(Boolean, default=True)
    sms_subscribed = Column(Boolean, default=False)
    marketing_subscribed = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="contacts")
    activities = relationship("ContactActivity", back_populates="contact", cascade="all, delete-orphan")
    email_sends = relationship("EmailSend", back_populates="contact", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Contact(email='{self.email}', status='{self.status}')>"
    
    @property
    def full_name(self) -> str:
        """Get contact's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or self.email
    
    @property
    def display_name(self) -> str:
        """Get display name for UI."""
        return self.full_name or self.email
    
    @property
    def is_engaged(self) -> bool:
        """Check if contact is engaged (opened emails recently)."""
        if not self.last_email_opened:
            return False
        # Consider engaged if opened email in last 30 days
        from datetime import datetime, timedelta
        return self.last_email_opened > datetime.utcnow() - timedelta(days=30)


class ContactActivity(BaseModel, UUIDMixin, TimestampMixin):
    """Contact activity tracking."""
    
    __tablename__ = "contact_activities"
    
    contact_id = Column(String(36), ForeignKey("contacts.id"), nullable=False)
    
    # Activity details
    type = Column(SQLEnum(ActivityType), nullable=False)
    description = Column(String(500))
    data = Column(JSON, default=dict)  # Activity-specific data
    
    # Source tracking
    source = Column(String(255))  # component_id, workflow_id, campaign_id, etc.
    source_type = Column(String(50))  # component, workflow, campaign, manual
    
    # Metadata
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(Text)
    referrer = Column(String(500))
    
    # Relationships
    contact = relationship("Contact", back_populates="activities")
    
    def __repr__(self) -> str:
        return f"<ContactActivity(type='{self.type}', contact_id='{self.contact_id}')>"


class EmailCampaign(BaseModel, UUIDMixin, TimestampMixin):
    """Email campaign definition."""
    
    __tablename__ = "email_campaigns"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    workflow_id = Column(String(36), ForeignKey("workflows.id"))  # Optional workflow trigger
    
    # Campaign details
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    preview_text = Column(String(255))
    
    # Content
    content_html = Column(Text, nullable=False)
    content_text = Column(Text)  # Plain text version
    
    # Campaign settings
    type = Column(SQLEnum(CampaignType), default=CampaignType.BROADCAST)
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.DRAFT)
    
    # Scheduling
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    
    # Targeting
    target_tags = Column(JSON, default=list)  # Target contacts with these tags, JSON array for SQLite
    target_segments = Column(JSON, default=dict)  # Advanced segmentation rules
    
    # A/B Testing
    is_ab_test = Column(Boolean, default=False)
    ab_test_config = Column(JSON, default=dict)  # A/B test configuration
    
    # Statistics
    recipients_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    opens_count = Column(Integer, default=0)
    clicks_count = Column(Integer, default=0)
    unsubscribes_count = Column(Integer, default=0)
    bounces_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="email_campaigns")
    workflow = relationship("Workflow")
    sends = relationship("EmailSend", back_populates="campaign", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<EmailCampaign(name='{self.name}', status='{self.status}')>"
    
    @property
    def open_rate(self) -> float:
        """Calculate email open rate."""
        if self.delivered_count == 0:
            return 0.0
        return (self.opens_count / self.delivered_count) * 100
    
    @property
    def click_rate(self) -> float:
        """Calculate email click rate."""
        if self.delivered_count == 0:
            return 0.0
        return (self.clicks_count / self.delivered_count) * 100
    
    @property
    def click_to_open_rate(self) -> float:
        """Calculate click-to-open rate."""
        if self.opens_count == 0:
            return 0.0
        return (self.clicks_count / self.opens_count) * 100


class EmailSend(BaseModel, UUIDMixin, TimestampMixin):
    """Individual email send record."""
    
    __tablename__ = "email_sends"
    
    campaign_id = Column(String(36), ForeignKey("email_campaigns.id"), nullable=False)
    contact_id = Column(String(36), ForeignKey("contacts.id"), nullable=False)
    
    # Send details
    status = Column(SQLEnum(EmailStatus), default=EmailStatus.PENDING)
    
    # Timing
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    opened_at = Column(DateTime)
    clicked_at = Column(DateTime)
    
    # Tracking
    opens_count = Column(Integer, default=0)
    clicks_count = Column(Integer, default=0)
    unique_opens = Column(Integer, default=0)
    unique_clicks = Column(Integer, default=0)
    
    # Error handling
    error_message = Column(Text)
    bounce_type = Column(String(50))  # hard, soft, complaint
    
    # Provider tracking
    provider_message_id = Column(String(255))  # SendGrid message ID
    provider_event_data = Column(JSON, default=dict)  # Provider webhook data
    
    # Relationships
    campaign = relationship("EmailCampaign", back_populates="sends")
    contact = relationship("Contact", back_populates="email_sends")
    
    def __repr__(self) -> str:
        return f"<EmailSend(campaign_id='{self.campaign_id}', status='{self.status}')>"
    
    @property
    def is_delivered(self) -> bool:
        """Check if email was delivered."""
        return self.status in [EmailStatus.DELIVERED, EmailStatus.OPENED, EmailStatus.CLICKED]
    
    @property
    def is_engaged(self) -> bool:
        """Check if recipient engaged with email."""
        return self.status in [EmailStatus.OPENED, EmailStatus.CLICKED]