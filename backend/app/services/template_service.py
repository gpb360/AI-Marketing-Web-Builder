"""
Template service for template management operations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.template import Template, TemplateComponent, TemplateCategory, TemplateStatus
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateComponentCreate, TemplateComponentUpdate
from app.services.base_service import BaseService


class TemplateService(BaseService[Template, TemplateCreate, TemplateUpdate]):
    """Template service for template management."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Template, db)
    
    async def get_by_category(self, category: TemplateCategory, skip: int = 0, limit: int = 100) -> List[Template]:
        """Get templates by category."""
        result = await self.db.execute(
            select(Template)
            .where(and_(Template.category == category, Template.status == TemplateStatus.PUBLISHED))
            .order_by(Template.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_featured(self, limit: int = 10) -> List[Template]:
        """Get featured templates."""
        result = await self.db.execute(
            select(Template)
            .where(and_(Template.is_featured == True, Template.status == TemplateStatus.PUBLISHED))
            .order_by(Template.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_premium(self, skip: int = 0, limit: int = 100) -> List[Template]:
        """Get premium templates."""
        result = await self.db.execute(
            select(Template)
            .where(and_(Template.is_premium == True, Template.status == TemplateStatus.PUBLISHED))
            .order_by(Template.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def search_templates(self, query: str, category: Optional[TemplateCategory] = None, skip: int = 0, limit: int = 100) -> List[Template]:
        """Search templates by name, description, or tags."""
        search_filter = Template.name.ilike(f"%{query}%") | Template.description.ilike(f"%{query}%")
        
        base_query = select(Template).where(
            and_(
                search_filter,
                Template.status == TemplateStatus.PUBLISHED
            )
        )
        
        if category:
            base_query = base_query.where(Template.category == category)
        
        result = await self.db.execute(
            base_query
            .order_by(Template.usage_count.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def increment_usage(self, template_id: int) -> Optional[Template]:
        """Increment template usage count."""
        template = await self.get_by_id(template_id)
        if template:
            template.usage_count += 1
            await self.db.commit()
            await self.db.refresh(template)
        return template
    
    async def publish_template(self, template_id: int) -> Optional[Template]:
        """Publish a template."""
        template = await self.get_by_id(template_id)
        if template:
            template.status = TemplateStatus.PUBLISHED
            await self.db.commit()
            await self.db.refresh(template)
        return template
    
    async def archive_template(self, template_id: int) -> Optional[Template]:
        """Archive a template."""
        template = await self.get_by_id(template_id)
        if template:
            template.status = TemplateStatus.ARCHIVED
            await self.db.commit()
            await self.db.refresh(template)
        return template
    
    async def get_popular_templates(self, limit: int = 10) -> List[Template]:
        """Get most popular templates by usage count."""
        result = await self.db.execute(
            select(Template)
            .where(Template.status == TemplateStatus.PUBLISHED)
            .order_by(Template.usage_count.desc())
            .limit(limit)
        )
        return result.scalars().all()


class TemplateComponentService(BaseService[TemplateComponent, TemplateComponentCreate, TemplateComponentUpdate]):
    """Template component service for component management."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TemplateComponent, db)
    
    async def get_by_type(self, component_type: str, skip: int = 0, limit: int = 100) -> List[TemplateComponent]:
        """Get components by type."""
        result = await self.db.execute(
            select(TemplateComponent)
            .where(TemplateComponent.component_type == component_type)
            .order_by(TemplateComponent.usage_count.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_category(self, category: str, skip: int = 0, limit: int = 100) -> List[TemplateComponent]:
        """Get components by category."""
        result = await self.db.execute(
            select(TemplateComponent)
            .where(TemplateComponent.category == category)
            .order_by(TemplateComponent.usage_count.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def search_components(self, query: str, skip: int = 0, limit: int = 100) -> List[TemplateComponent]:
        """Search components by name or description."""
        search_filter = TemplateComponent.name.ilike(f"%{query}%") | TemplateComponent.description.ilike(f"%{query}%")
        
        result = await self.db.execute(
            select(TemplateComponent)
            .where(search_filter)
            .order_by(TemplateComponent.usage_count.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def increment_usage(self, component_id: int) -> Optional[TemplateComponent]:
        """Increment component usage count."""
        component = await self.get_by_id(component_id)
        if component:
            component.usage_count += 1
            await self.db.commit()
            await self.db.refresh(component)
        return component
    
    async def get_popular_components(self, limit: int = 10) -> List[TemplateComponent]:
        """Get most popular components by usage count."""
        result = await self.db.execute(
            select(TemplateComponent)
            .order_by(TemplateComponent.usage_count.desc())
            .limit(limit)
        )
        return result.scalars().all()