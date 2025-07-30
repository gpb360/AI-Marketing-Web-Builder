"""
Project models for user-created websites and projects.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.models.base import Base, TimestampMixin


class ProjectStatus(str, enum.Enum):
    """Project status enumeration."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    DELETED = "deleted"


class Project(Base, TimestampMixin):
    """User project model for created websites."""
    
    __tablename__ = "projects"
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[ProjectStatus] = mapped_column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    
    # Project relationships
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    template_id: Mapped[Optional[int]] = mapped_column(ForeignKey("templates.id"))
    
    # Project configuration
    config: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    custom_css: Mapped[Optional[str]] = mapped_column(Text)
    custom_js: Mapped[Optional[str]] = mapped_column(Text)
    
    # SEO and metadata
    meta_title: Mapped[Optional[str]] = mapped_column(String(200))
    meta_description: Mapped[Optional[str]] = mapped_column(Text)
    meta_keywords: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Domain and publishing
    subdomain: Mapped[Optional[str]] = mapped_column(String(100))
    custom_domain: Mapped[Optional[str]] = mapped_column(String(255))
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Analytics and tracking
    analytics_code: Mapped[Optional[str]] = mapped_column(Text)
    tracking_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="projects")
    template: Mapped[Optional["Template"]] = relationship("Template", back_populates="projects")
    pages: Mapped[List["ProjectPage"]] = relationship("ProjectPage", back_populates="project")
    
    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"


class ProjectPage(Base, TimestampMixin):
    """Individual page within a project."""
    
    __tablename__ = "project_pages"
    
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Page configuration
    is_homepage: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[int] = mapped_column(default=0)
    
    # SEO for individual pages
    meta_title: Mapped[Optional[str]] = mapped_column(String(200))
    meta_description: Mapped[Optional[str]] = mapped_column(Text)
    meta_keywords: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Page relationships
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    project: Mapped["Project"] = relationship("Project", back_populates="pages")
    
    def __repr__(self) -> str:
        return f"<ProjectPage(id={self.id}, title='{self.title}', project_id={self.project_id})>"