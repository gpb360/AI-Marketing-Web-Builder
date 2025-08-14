"""
Template models for website templates and components.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.models.base import Base, TimestampMixin, UUIDMixin


class TemplateCategory(str, enum.Enum):
    """Template categories."""
    LANDING_PAGE = "landing_page"
    ECOMMERCE = "ecommerce"
    BLOG = "blog"
    PORTFOLIO = "portfolio"
    BUSINESS = "business"
    SAAS = "saas"
    AGENCY = "agency"
    RESTAURANT = "restaurant"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    NONPROFIT = "nonprofit"
    REAL_ESTATE = "real_estate"


class TemplateStatus(str, enum.Enum):
    """Template status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Template(Base, TimestampMixin, UUIDMixin):
    """Website template model."""
    
    __tablename__ = "templates"
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[TemplateCategory] = mapped_column(Enum(TemplateCategory), nullable=False)
    status: Mapped[TemplateStatus] = mapped_column(Enum(TemplateStatus), default=TemplateStatus.DRAFT)
    
    # Template content and structure
    preview_image: Mapped[Optional[str]] = mapped_column(String(500))
    thumbnail_image: Mapped[Optional[str]] = mapped_column(String(500))
    demo_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Template configuration
    config: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    components: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    styles: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # SEO and metadata
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)
    meta_title: Mapped[Optional[str]] = mapped_column(String(200))
    meta_description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Usage and analytics
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="template")
    
    def __repr__(self) -> str:
        return f"<Template(id={self.id}, name='{self.name}', category='{self.category}')>"


class TemplateComponent(Base, TimestampMixin, UUIDMixin):
    """Individual template component model."""
    
    __tablename__ = "template_components"
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    component_type: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Component configuration
    props: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    styles: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    html_template: Mapped[Optional[str]] = mapped_column(Text)
    css_styles: Mapped[Optional[str]] = mapped_column(Text)
    javascript: Mapped[Optional[str]] = mapped_column(Text)
    
    # Component metadata
    category: Mapped[str] = mapped_column(String(100))
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)
    is_responsive: Mapped[bool] = mapped_column(Boolean, default=True)
    is_interactive: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Usage tracking
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    
    def __repr__(self) -> str:
        return f"<TemplateComponent(id={self.id}, name='{self.name}', type='{self.component_type}')>"