"""
Template schemas for API request/response validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

from app.models.template import TemplateCategory, TemplateStatus


class TemplateBase(BaseModel):
    """Base template schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: TemplateCategory
    preview_image: Optional[str] = None
    thumbnail_image: Optional[str] = None
    demo_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_premium: bool = False
    is_featured: bool = False


class TemplateCreate(TemplateBase):
    """Template creation schema."""
    config: Dict[str, Any] = Field(default_factory=dict)
    components: List[Dict[str, Any]] = Field(default_factory=list)
    styles: Dict[str, Any] = Field(default_factory=dict)


class TemplateUpdate(BaseModel):
    """Template update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TemplateCategory] = None
    status: Optional[TemplateStatus] = None
    preview_image: Optional[str] = None
    thumbnail_image: Optional[str] = None
    demo_url: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    components: Optional[List[Dict[str, Any]]] = None
    styles: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_premium: Optional[bool] = None
    is_featured: Optional[bool] = None


class TemplateInDB(TemplateBase):
    """Template schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: TemplateStatus
    config: Dict[str, Any]
    components: List[Dict[str, Any]]
    styles: Dict[str, Any]
    usage_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class Template(TemplateInDB):
    """Template schema for API responses."""
    pass


class TemplateList(BaseModel):
    """Template list response schema."""
    templates: List[Template]
    total: int
    page: int
    size: int
    pages: int


class TemplateComponentBase(BaseModel):
    """Base template component schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    component_type: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., max_length=100)
    tags: List[str] = Field(default_factory=list)
    is_responsive: bool = True
    is_interactive: bool = False


class TemplateComponentCreate(TemplateComponentBase):
    """Template component creation schema."""
    props: Dict[str, Any] = Field(default_factory=dict)
    styles: Dict[str, Any] = Field(default_factory=dict)
    html_template: Optional[str] = None
    css_styles: Optional[str] = None
    javascript: Optional[str] = None


class TemplateComponentUpdate(BaseModel):
    """Template component update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    component_type: Optional[str] = None
    category: Optional[str] = None
    props: Optional[Dict[str, Any]] = None
    styles: Optional[Dict[str, Any]] = None
    html_template: Optional[str] = None
    css_styles: Optional[str] = None
    javascript: Optional[str] = None
    tags: Optional[List[str]] = None
    is_responsive: Optional[bool] = None
    is_interactive: Optional[bool] = None


class TemplateComponentInDB(TemplateComponentBase):
    """Template component schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    props: Dict[str, Any]
    styles: Dict[str, Any]
    html_template: Optional[str]
    css_styles: Optional[str]
    javascript: Optional[str]
    usage_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class TemplateComponent(TemplateComponentInDB):
    """Template component schema for API responses."""
    pass