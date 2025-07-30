"""
Project schemas for API request/response validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    """Base project schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: List[str] = Field(default_factory=list)
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Project creation schema."""
    template_id: Optional[int] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None


class ProjectUpdate(BaseModel):
    """Project update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    config: Optional[Dict[str, Any]] = None
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    analytics_code: Optional[str] = None
    tracking_enabled: Optional[bool] = None


class ProjectInDB(ProjectBase):
    """Project schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: ProjectStatus
    owner_id: int
    template_id: Optional[int]
    config: Dict[str, Any]
    custom_css: Optional[str]
    custom_js: Optional[str]
    is_published: bool
    published_url: Optional[str]
    analytics_code: Optional[str]
    tracking_enabled: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


class Project(ProjectInDB):
    """Project schema for API responses."""
    pass


class ProjectPageBase(BaseModel):
    """Base project page schema."""
    title: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: List[str] = Field(default_factory=list)
    is_homepage: bool = False
    order_index: int = 0


class ProjectPageCreate(ProjectPageBase):
    """Project page creation schema."""
    content: Dict[str, Any] = Field(default_factory=dict)


class ProjectPageUpdate(BaseModel):
    """Project page update schema."""
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None


class ProjectPageInDB(ProjectPageBase):
    """Project page schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    project_id: int
    content: Dict[str, Any]
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


class ProjectPage(ProjectPageInDB):
    """Project page schema for API responses."""
    pass