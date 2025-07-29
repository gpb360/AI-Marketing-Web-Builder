"""
CRM endpoints for contact and lead management.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.crm import ContactStatus, ContactSource
from app.schemas.crm import (
    CRMContact, CRMContactCreate, CRMContactUpdate, CRMContactList,
    CRMActivity, CRMActivityCreate, CRMActivityUpdate,
    EmailCampaign, EmailCampaignCreate, EmailCampaignUpdate,
    CRMStats
)
from app.services.crm_service import CRMContactService, CRMActivityService, EmailCampaignService

router = APIRouter()


@router.get("/contacts", response_model=CRMContactList)
async def get_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[ContactStatus] = None,
    source: Optional[ContactSource] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get contacts with filtering and pagination."""
    contact_service = CRMContactService(db)
    
    filters = {"owner_id": current_user.id}
    if status:
        filters["status"] = status
    if source:
        filters["source"] = source
    
    if search:
        contacts = await contact_service.search_contacts(current_user.id, search, skip, limit)
    else:
        contacts = await contact_service.get_multi(skip, limit, filters)
    
    total = await contact_service.count(filters)
    
    return {
        "contacts": contacts,
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/contacts/stats", response_model=CRMStats)
async def get_crm_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get CRM statistics for current user."""
    contact_service = CRMContactService(db)
    campaign_service = EmailCampaignService(db)
    
    return await contact_service.get_contact_stats(current_user.id)


@router.get("/contacts/{contact_id}", response_model=CRMContact)
async def get_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get contact by ID."""
    contact_service = CRMContactService(db)
    contact = await contact_service.get_by_id(contact_id)
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check ownership
    if contact.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this contact"
        )
    
    return contact


@router.post("/contacts", response_model=CRMContact, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_in: CRMContactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new contact."""
    contact_service = CRMContactService(db)
    
    # Check if contact with email already exists for this user
    existing_contact = await contact_service.get_by_email(current_user.id, contact_in.email)
    if existing_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact with this email already exists"
        )
    
    return await contact_service.create(contact_in, owner_id=current_user.id)


@router.put("/contacts/{contact_id}", response_model=CRMContact)
async def update_contact(
    contact_id: int,
    contact_in: CRMContactUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update contact."""
    contact_service = CRMContactService(db)
    contact = await contact_service.get_by_id(contact_id)
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check ownership
    if contact.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this contact"
        )
    
    updated_contact = await contact_service.update(contact_id, contact_in)
    return updated_contact


@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete contact."""
    contact_service = CRMContactService(db)
    contact = await contact_service.get_by_id(contact_id)
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check ownership
    if contact.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this contact"
        )
    
    success = await contact_service.delete(contact_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete contact"
        )
    
    return {"message": "Contact deleted successfully"}


# Contact Activities
@router.get("/contacts/{contact_id}/activities", response_model=List[CRMActivity])
async def get_contact_activities(
    contact_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get contact activities."""
    contact_service = CRMContactService(db)
    activity_service = CRMActivityService(db)
    
    contact = await contact_service.get_by_id(contact_id)
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check ownership
    if contact.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this contact"
        )
    
    return await activity_service.get_by_contact(contact_id, skip, limit)


@router.post("/contacts/{contact_id}/activities", response_model=CRMActivity, status_code=status.HTTP_201_CREATED)
async def create_contact_activity(
    contact_id: int,
    activity_in: CRMActivityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create contact activity."""
    contact_service = CRMContactService(db)
    activity_service = CRMActivityService(db)
    
    contact = await contact_service.get_by_id(contact_id)
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check ownership
    if contact.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this contact"
        )
    
    # Set contact_id from URL
    activity_in.contact_id = contact_id
    activity = await activity_service.create(activity_in)
    
    # Update contact's last activity
    await contact_service.update_last_activity(contact_id)
    
    return activity


# Email Campaigns
@router.get("/campaigns", response_model=List[EmailCampaign])
async def get_email_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get email campaigns."""
    campaign_service = EmailCampaignService(db)
    filters = {"owner_id": current_user.id}
    return await campaign_service.get_multi(skip, limit, filters)


@router.get("/campaigns/{campaign_id}", response_model=EmailCampaign)
async def get_email_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get email campaign by ID."""
    campaign_service = EmailCampaignService(db)
    campaign = await campaign_service.get_by_id(campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    
    # Check ownership
    if campaign.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this campaign"
        )
    
    return campaign


@router.post("/campaigns", response_model=EmailCampaign, status_code=status.HTTP_201_CREATED)
async def create_email_campaign(
    campaign_in: EmailCampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Create a new email campaign."""
    campaign_service = EmailCampaignService(db)
    return await campaign_service.create(campaign_in, owner_id=current_user.id)


@router.put("/campaigns/{campaign_id}", response_model=EmailCampaign)
async def update_email_campaign(
    campaign_id: int,
    campaign_in: EmailCampaignUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update email campaign."""
    campaign_service = EmailCampaignService(db)
    campaign = await campaign_service.get_by_id(campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    
    # Check ownership
    if campaign.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this campaign"
        )
    
    updated_campaign = await campaign_service.update(campaign_id, campaign_in)
    return updated_campaign


@router.delete("/campaigns/{campaign_id}")
async def delete_email_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete email campaign."""
    campaign_service = EmailCampaignService(db)
    campaign = await campaign_service.get_by_id(campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    
    # Check ownership
    if campaign.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this campaign"
        )
    
    success = await campaign_service.delete(campaign_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete campaign"
        )
    
    return {"message": "Email campaign deleted successfully"}