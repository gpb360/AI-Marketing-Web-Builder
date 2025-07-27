"""Site and component models for the web builder."""

from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship
import enum

from ..core.database import Base
from .base import UUIDMixin, TimestampMixin


class SiteStatus(str, enum.Enum):
    """Site status options."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ComponentType(str, enum.Enum):
    """Component type options."""
    HERO = "hero"
    CONTACT_FORM = "contact_form"
    NEWSLETTER_SIGNUP = "newsletter_signup"
    PRICING_TABLE = "pricing_table"
    TESTIMONIALS = "testimonials"
    FAQ = "faq"
    CTA_BUTTON = "cta_button"
    IMAGE_GALLERY = "image_gallery"
    TEXT_BLOCK = "text_block"
    VIDEO_EMBED = "video_embed"
    CUSTOM = "custom"


class TemplateCategory(str, enum.Enum):
    """Template category options."""
    SAAS = "saas"
    ECOMMERCE = "ecommerce"
    PROFESSIONAL_SERVICES = "professional_services"
    PORTFOLIO = "portfolio"
    BLOG = "blog"
    LANDING_PAGE = "landing_page"
    CORPORATE = "corporate"
    CREATIVE = "creative"


class Site(Base, UUIDMixin, TimestampMixin):
    """User's website/site."""
    
    __tablename__ = "sites"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"))
    
    # Basic site info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Domain and publishing
    subdomain = Column(String(100), unique=True, index=True)  # user.aiwebbuilder.com
    custom_domain = Column(String(255), unique=True, index=True)  # user's custom domain
    
    # Site status
    status = Column(SQLEnum(SiteStatus), default=SiteStatus.DRAFT)
    published_at = Column(DateTime)
    
    # Site configuration
    settings = Column(JSON, default=dict)  # Site-wide settings
    theme_config = Column(JSON, default=dict)  # Theme customizations
    
    # SEO and metadata
    meta_title = Column(String(255))
    meta_description = Column(Text)
    favicon_url = Column(String(500))
    
    # Analytics
    total_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    conversion_rate = Column(Integer, default=0)  # Stored as percentage * 100
    
    # Relationships
    owner = relationship("User", back_populates="sites")
    template = relationship("Template", back_populates="sites")
    components = relationship("Component", back_populates="site", cascade="all, delete-orphan")
    workflows = relationship("Workflow", back_populates="site", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Site(name='{self.name}', subdomain='{self.subdomain}')>"
    
    @property
    def url(self) -> str:
        """Get the primary URL for the site."""
        if self.custom_domain:
            return f"https://{self.custom_domain}"
        return f"https://{self.subdomain}.aiwebbuilder.com"
    
    @property
    def is_published(self) -> bool:
        """Check if site is published."""
        return self.status == SiteStatus.PUBLISHED


class Component(Base, UUIDMixin, TimestampMixin):
    """Smart component instance on a site."""
    
    __tablename__ = "components"
    
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    
    # Component identification
    component_id = Column(String(100), nullable=False)  # Unique within site
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(ComponentType), nullable=False)
    
    # Component configuration
    config = Column(JSON, nullable=False)  # Component-specific settings
    styles = Column(JSON, default=dict)  # Custom styling
    
    # Layout and positioning
    position = Column(JSON, default=dict)  # Position data for drag-and-drop
    order_index = Column(Integer, default=0)  # Order within page/section
    
    # Workflow integration
    workflows_connected = Column(JSON, default=list)  # Connected workflow IDs
    
    # Analytics
    views = Column(Integer, default=0)
    interactions = Column(Integer, default=0)  # Clicks, form submissions, etc.
    conversions = Column(Integer, default=0)
    
    # Relationships
    site = relationship("Site", back_populates="components")
    
    def __repr__(self) -> str:
        return f"<Component(name='{self.name}', type='{self.type}')>"
    
    @property
    def conversion_rate(self) -> float:
        """Calculate component conversion rate."""
        if self.interactions == 0:
            return 0.0
        return (self.conversions / self.interactions) * 100
    
    @property
    def has_workflows(self) -> bool:
        """Check if component has connected workflows."""
        return len(self.workflows_connected) > 0


class Template(Base, UUIDMixin, TimestampMixin):
    """Site template definition."""
    
    __tablename__ = "templates"
    
    # Template metadata
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(SQLEnum(TemplateCategory), nullable=False)
    
    # Template content
    components_data = Column(JSON, nullable=False)  # Complete template structure
    default_settings = Column(JSON, default=dict)  # Default site settings
    
    # Visual assets
    preview_image_url = Column(String(500))
    thumbnail_url = Column(String(500))
    
    # Template properties
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    
    # Usage statistics
    usage_count = Column(Integer, default=0)
    average_rating = Column(Integer, default=0)  # Rating * 100
    
    # Relationships
    sites = relationship("Site", back_populates="template")
    
    def __repr__(self) -> str:
        return f"<Template(name='{self.name}', category='{self.category}')>"
    
    @property
    def rating(self) -> float:
        """Get template rating as float."""
        return self.average_rating / 100.0
    
    @property
    def is_popular(self) -> bool:
        """Check if template is popular (high usage)."""
        return self.usage_count > 100