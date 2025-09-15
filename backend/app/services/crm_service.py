"""
CRM service for contact and lead management.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from datetime import datetime, timedelta

from app.models.crm import Contact, ContactActivity, EmailCampaign, ContactStatus, CampaignStatus as EmailCampaignStatus
from app.schemas.crm import CRMContactCreate, CRMContactUpdate, CRMActivityCreate, CRMActivityUpdate, EmailCampaignCreate, EmailCampaignUpdate
from app.services.base_service import BaseService


class CRMContactService(BaseService[Contact, CRMContactCreate, CRMContactUpdate]):
    """CRM contact service for contact management."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Contact, db)
    
    async def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 100) -> List[Contact]:
        """Get contacts by owner."""
        result = await self.db.execute(
            select(Contact)
            .where(Contact.owner_id == owner_id)
            .order_by(Contact.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_email(self, owner_id: int, email: str) -> Optional[Contact]:
        """Get contact by owner and email."""
        result = await self.db.execute(
            select(Contact)
            .where(and_(Contact.owner_id == owner_id, Contact.email == email))
        )
        return result.scalar_one_or_none()
    
    async def search_contacts(self, owner_id: int, query: str, skip: int = 0, limit: int = 100) -> List[Contact]:
        """Search contacts by name, email, or company."""
        search_filter = or_(
            Contact.first_name.ilike(f"%{query}%"),
            Contact.last_name.ilike(f"%{query}%"),
            Contact.email.ilike(f"%{query}%"),
            Contact.company.ilike(f"%{query}%")
        )
        
        result = await self.db.execute(
            select(Contact)
            .where(and_(Contact.owner_id == owner_id, search_filter))
            .order_by(Contact.lead_score.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_status(self, owner_id: int, status: ContactStatus, skip: int = 0, limit: int = 100) -> List[Contact]:
        """Get contacts by status."""
        result = await self.db.execute(
            select(Contact)
            .where(and_(Contact.owner_id == owner_id, Contact.status == status))
            .order_by(Contact.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_high_value_leads(self, owner_id: int, min_score: int = 80, limit: int = 50) -> List[Contact]:
        """Get high-value leads by score."""
        result = await self.db.execute(
            select(Contact)
            .where(and_(
                Contact.owner_id == owner_id,
                Contact.lead_score >= min_score,
                Contact.status.in_([ContactStatus.NEW, ContactStatus.CONTACTED, ContactStatus.QUALIFIED])
            ))
            .order_by(Contact.lead_score.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def update_lead_score(self, contact_id: int, score: int) -> Optional[Contact]:
        """Update contact lead score."""
        contact = await self.get_by_id(contact_id)
        if contact:
            contact.lead_score = score
            await self.db.commit()
            await self.db.refresh(contact)
        return contact
    
    async def update_last_activity(self, contact_id: int) -> Optional[Contact]:
        """Update contact's last activity timestamp."""
        contact = await self.get_by_id(contact_id)
        if contact:
            contact.last_activity = datetime.utcnow()
            contact.total_interactions += 1
            await self.db.commit()
            await self.db.refresh(contact)
        return contact
    
    async def get_contact_stats(self, owner_id: int) -> Dict[str, Any]:
        """Get contact statistics."""
        # Total contacts
        total_result = await self.db.execute(
            select(func.count(Contact.id))
            .where(Contact.owner_id == owner_id)
        )
        total_contacts = total_result.scalar()
        
        # New contacts this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month_result = await self.db.execute(
            select(func.count(Contact.id))
            .where(and_(
                Contact.owner_id == owner_id,
                Contact.created_at >= month_start
            ))
        )
        new_contacts_this_month = new_this_month_result.scalar()
        
        # Qualified leads
        qualified_result = await self.db.execute(
            select(func.count(Contact.id))
            .where(and_(
                Contact.owner_id == owner_id,
                Contact.status == ContactStatus.QUALIFIED
            ))
        )
        qualified_leads = qualified_result.scalar()
        
        # Conversion rate (closed won / total qualified)
        closed_won_result = await self.db.execute(
            select(func.count(Contact.id))
            .where(and_(
                Contact.owner_id == owner_id,
                Contact.status == ContactStatus.CLOSED_WON
            ))
        )
        closed_won = closed_won_result.scalar()
        
        total_opportunities = qualified_leads + closed_won
        conversion_rate = (closed_won / total_opportunities * 100) if total_opportunities > 0 else 0
        
        # Average lead score
        avg_score_result = await self.db.execute(
            select(func.avg(Contact.lead_score))
            .where(Contact.owner_id == owner_id)
        )
        avg_lead_score = avg_score_result.scalar() or 0
        
        return {
            "total_contacts": total_contacts,
            "new_contacts_this_month": new_contacts_this_month,
            "qualified_leads": qualified_leads,
            "conversion_rate": conversion_rate,
            "avg_lead_score": avg_lead_score,
            "active_campaigns": 0  # Will be filled by campaign service
        }


class CRMActivityService(BaseService[ContactActivity, CRMActivityCreate, CRMActivityUpdate]):
    """CRM activity service for activity tracking."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(ContactActivity, db)
    
    async def get_by_contact(self, contact_id: int, skip: int = 0, limit: int = 100) -> List[ContactActivity]:
        """Get activities by contact."""
        result = await self.db.execute(
            select(ContactActivity)
            .where(ContactActivity.contact_id == contact_id)
            .order_by(ContactActivity.activity_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_recent_activities(self, owner_id: int, days: int = 7, limit: int = 50) -> List[ContactActivity]:
        """Get recent activities for owner's contacts."""
        since_date = datetime.utcnow() - timedelta(days=days)
        
        result = await self.db.execute(
            select(ContactActivity)
            .join(Contact)
            .where(and_(
                Contact.owner_id == owner_id,
                ContactActivity.activity_date >= since_date
            ))
            .order_by(ContactActivity.activity_date.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_activities_by_type(self, contact_id: int, activity_type: str) -> List[ContactActivity]:
        """Get activities by type for a contact."""
        result = await self.db.execute(
            select(ContactActivity)
            .where(and_(
                ContactActivity.contact_id == contact_id,
                ContactActivity.type == activity_type
            ))
            .order_by(ContactActivity.activity_date.desc())
        )
        return result.scalars().all()


class EmailCampaignService(BaseService[EmailCampaign, EmailCampaignCreate, EmailCampaignUpdate]):
    """Email campaign service for email marketing."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(EmailCampaign, db)
    
    async def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 100) -> List[EmailCampaign]:
        """Get campaigns by owner."""
        result = await self.db.execute(
            select(EmailCampaign)
            .where(EmailCampaign.owner_id == owner_id)
            .order_by(EmailCampaign.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_active_campaigns(self, owner_id: int) -> List[EmailCampaign]:
        """Get active campaigns."""
        result = await self.db.execute(
            select(EmailCampaign)
            .where(and_(
                EmailCampaign.owner_id == owner_id,
                EmailCampaign.status.in_([EmailCampaignStatus.SCHEDULED, EmailCampaignStatus.SENDING])
            ))
            .order_by(EmailCampaign.scheduled_at)
        )
        return result.scalars().all()
    
    async def get_campaign_performance(self, campaign_id: int) -> Dict[str, Any]:
        """Get campaign performance metrics."""
        campaign = await self.get_by_id(campaign_id)
        if not campaign:
            return {}
        
        open_rate = (campaign.opens_count / campaign.delivered_count * 100) if campaign.delivered_count > 0 else 0
        click_rate = (campaign.clicks_count / campaign.delivered_count * 100) if campaign.delivered_count > 0 else 0
        bounce_rate = (campaign.bounces_count / campaign.recipients_count * 100) if campaign.recipients_count > 0 else 0
        unsubscribe_rate = (campaign.unsubscribes_count / campaign.delivered_count * 100) if campaign.delivered_count > 0 else 0
        
        return {
            "campaign_id": campaign_id,
            "recipient_count": campaign.recipients_count,
            "delivered_count": campaign.delivered_count,
            "opened_count": campaign.opens_count,
            "clicked_count": campaign.clicks_count,
            "bounced_count": campaign.bounces_count,
            "unsubscribed_count": campaign.unsubscribes_count,
            "open_rate": open_rate,
            "click_rate": click_rate,
            "bounce_rate": bounce_rate,
            "unsubscribe_rate": unsubscribe_rate
        }
    
    async def schedule_campaign(self, campaign_id: int, scheduled_at: datetime) -> Optional[EmailCampaign]:
        """Schedule a campaign for sending."""
        campaign = await self.get_by_id(campaign_id)
        if campaign:
            campaign.status = EmailCampaignStatus.SCHEDULED
            campaign.scheduled_at = scheduled_at
            await self.db.commit()
            await self.db.refresh(campaign)
        return campaign
    
    async def mark_campaign_sent(self, campaign_id: int) -> Optional[EmailCampaign]:
        """Mark campaign as sent."""
        campaign = await self.get_by_id(campaign_id)
        if campaign:
            campaign.status = EmailCampaignStatus.SENT
            campaign.sent_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(campaign)
        return campaign