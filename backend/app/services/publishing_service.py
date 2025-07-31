"""Publishing service that orchestrates site generation and deployment."""

import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update

from ..core.database import get_async_session
from ..models.sites import (
    Site, PublishedSite, DeploymentHistory, 
    SiteStatus, BuildStatus, SSLStatus, DomainStatus
)
from .site_generator import SiteGenerator
from .domain_manager import DomainManager
from ..core.config import settings


class PublishingService:
    """Orchestrates the complete site publishing pipeline."""
    
    def __init__(self):
        self.site_generator = SiteGenerator()
        self.domain_manager = DomainManager()
    
    async def publish_site(self, site_id: str, custom_domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Publish a site with complete deployment pipeline.
        
        Args:
            site_id: Site ID to publish
            custom_domain: Optional custom domain
            
        Returns:
            Publishing result
        """
        async with get_async_session() as session:
            # Get site with all related data
            site = await self._get_site_with_relations(session, site_id)
            if not site:
                return {
                    "success": False,
                    "error": "Site not found"
                }
            
            try:
                # Start publishing process
                publish_result = await self._execute_publishing_pipeline(
                    session, site, custom_domain
                )
                
                # Update site status
                if publish_result["success"]:
                    site.status = SiteStatus.PUBLISHED
                    site.published_at = datetime.utcnow()
                    await session.commit()
                
                return publish_result
                
            except Exception as e:
                await session.rollback()
                return {
                    "success": False,
                    "error": str(e)
                }
    
    async def _get_site_with_relations(self, session: AsyncSession, site_id: str) -> Optional[Site]:
        """Get site with all related data."""
        stmt = select(Site).options(
            selectinload(Site.components),
            selectinload(Site.template),
            selectinload(Site.published_sites)
        ).where(Site.id == site_id)
        
        result = await session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def _execute_publishing_pipeline(
        self, 
        session: AsyncSession, 
        site: Site, 
        custom_domain: Optional[str]
    ) -> Dict[str, Any]:
        """Execute the complete publishing pipeline."""
        
        # Step 1: Generate site
        print(f"Generating site for {site.name}...")
        generation_result = await self.site_generator.generate_site(site)
        
        if generation_result["status"] != BuildStatus.SUCCESS:
            return {
                "success": False,
                "error": "Site generation failed",
                "details": generation_result
            }
        
        # Step 2: Create or update published site record
        published_site = await self._create_or_update_published_site(
            session, site, generation_result, custom_domain
        )
        
        # Step 3: Setup domain (if custom domain provided)
        domain_result = None
        if custom_domain:
            print(f"Setting up custom domain {custom_domain}...")
            domain_result = await self._setup_custom_domain(
                session, published_site, custom_domain
            )
        
        # Step 4: Request SSL certificate
        print("Requesting SSL certificate...")
        ssl_result = await self._setup_ssl_certificate(session, published_site)
        
        # Step 5: Create deployment history record
        await self._create_deployment_record(
            session, published_site, generation_result
        )
        
        # Step 6: Validate deployment
        validation_result = await self._validate_deployment(published_site)
        
        return {
            "success": True,
            "published_site_id": str(published_site.id),
            "domain": published_site.domain,
            "custom_domain": published_site.custom_domain,
            "cdn_url": published_site.cdn_url,
            "preview_url": published_site.preview_url,
            "build_status": published_site.build_status,
            "ssl_status": published_site.ssl_status,
            "domain_status": published_site.domain_status,
            "generation_result": generation_result,
            "domain_result": domain_result,
            "ssl_result": ssl_result,
            "validation_result": validation_result
        }
    
    async def _create_or_update_published_site(
        self,
        session: AsyncSession,
        site: Site,
        generation_result: Dict[str, Any],
        custom_domain: Optional[str]
    ) -> PublishedSite:
        """Create or update published site record."""
        
        # Check if published site already exists
        existing_published_site = None
        if site.published_sites:
            existing_published_site = site.published_sites[0]
        
        if existing_published_site:
            # Update existing record
            published_site = existing_published_site
            published_site.build_status = generation_result["status"]
            published_site.build_started_at = generation_result["build_started_at"]
            published_site.build_completed_at = generation_result["build_completed_at"]
            published_site.build_duration = generation_result["build_duration"]
            published_site.cdn_url = generation_result.get("cdn_url")
            published_site.build_size = generation_result.get("build_size")
            published_site.build_hash = generation_result.get("build_hash")
            
            if custom_domain:
                published_site.custom_domain = custom_domain
                published_site.domain_status = DomainStatus.PENDING
        else:
            # Create new record
            domain = custom_domain or f"{site.subdomain}.{settings.default_domain}"
            
            published_site = PublishedSite(
                site_id=site.id,
                domain=domain,
                custom_domain=custom_domain,
                build_status=generation_result["status"],
                build_started_at=generation_result["build_started_at"],
                build_completed_at=generation_result["build_completed_at"],
                build_duration=generation_result["build_duration"],
                cdn_url=generation_result.get("cdn_url"),
                preview_url=f"https://preview-{site.id}.{settings.default_domain}",
                build_size=generation_result.get("build_size"),
                build_hash=generation_result.get("build_hash"),
                seo_settings={
                    "meta_title": site.meta_title,
                    "meta_description": site.meta_description,
                    "favicon_url": site.favicon_url
                }
            )
            
            session.add(published_site)
        
        await session.commit()
        await session.refresh(published_site)
        return published_site
    
    async def _setup_custom_domain(
        self,
        session: AsyncSession,
        published_site: PublishedSite,
        custom_domain: str
    ) -> Dict[str, Any]:
        """Setup custom domain configuration."""
        
        # Verify domain ownership
        verification_result = await self.domain_manager.verify_domain_ownership(
            custom_domain, str(published_site.site_id)
        )
        
        if verification_result["status"] != DomainStatus.VERIFIED:
            # Domain not yet verified - provide instructions
            published_site.domain_status = DomainStatus.PENDING
            await session.commit()
            
            return {
                "status": "pending_verification",
                "verification_token": f"aiwebbuilder-verify={published_site.site_id}",
                "instructions": "Add TXT record to your domain DNS"
            }
        
        # Setup DNS records
        target_url = published_site.cdn_url or f"{published_site.domain}"
        dns_result = await self.domain_manager.setup_dns_records(
            custom_domain, target_url
        )
        
        if dns_result["status"] == "success":
            published_site.domain_status = DomainStatus.VERIFIED
        else:
            published_site.domain_status = DomainStatus.DNS_ERROR
        
        await session.commit()
        
        return {
            "status": dns_result["status"],
            "dns_setup": dns_result
        }
    
    async def _setup_ssl_certificate(
        self,
        session: AsyncSession,
        published_site: PublishedSite
    ) -> Dict[str, Any]:
        """Setup SSL certificate for the domain."""
        
        domain = published_site.custom_domain or published_site.domain
        
        # Request SSL certificate
        ssl_result = await self.domain_manager.request_ssl_certificate(domain)
        
        # Update published site with SSL status
        published_site.ssl_status = ssl_result["status"]
        
        if ssl_result["status"] == SSLStatus.PENDING:
            published_site.ssl_provider = ssl_result.get("provider", "Let's Encrypt")
        
        await session.commit()
        
        return ssl_result
    
    async def _create_deployment_record(
        self,
        session: AsyncSession,
        published_site: PublishedSite,
        generation_result: Dict[str, Any]
    ) -> DeploymentHistory:
        """Create deployment history record."""
        
        # Generate version number
        version = f"v{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        
        deployment = DeploymentHistory(
            published_site_id=published_site.id,
            version=version,
            build_time=generation_result["build_started_at"],
            build_duration=generation_result["build_duration"],
            build_status=generation_result["status"],
            build_size=generation_result.get("build_size"),
            build_hash=generation_result.get("build_hash"),
            build_logs=generation_result.get("build_logs", "Build completed successfully")
        )
        
        session.add(deployment)
        await session.commit()
        
        return deployment
    
    async def _validate_deployment(self, published_site: PublishedSite) -> Dict[str, Any]:
        """Validate the deployment is working correctly."""
        
        domain = published_site.custom_domain or published_site.domain
        
        # Run domain validation
        validation_result = await self.domain_manager.validate_domain_configuration(domain)
        
        return validation_result
    
    async def unpublish_site(self, site_id: str) -> Dict[str, Any]:
        """
        Unpublish a site and clean up resources.
        
        Args:
            site_id: Site ID to unpublish
            
        Returns:
            Unpublishing result
        """
        async with get_async_session() as session:
            try:
                # Get site
                site = await self._get_site_with_relations(session, site_id)
                if not site:
                    return {
                        "success": False,
                        "error": "Site not found"
                    }
                
                # Update site status
                site.status = SiteStatus.DRAFT
                site.published_at = None
                
                # Mark published sites as inactive (don't delete for history)
                for published_site in site.published_sites:
                    published_site.build_status = BuildStatus.CANCELLED
                
                await session.commit()
                
                # TODO: Clean up CDN files and DNS records
                
                return {
                    "success": True,
                    "message": "Site unpublished successfully"
                }
                
            except Exception as e:
                await session.rollback()
                return {
                    "success": False,
                    "error": str(e)
                }
    
    async def get_publishing_status(self, site_id: str) -> Dict[str, Any]:
        """
        Get current publishing status for a site.
        
        Args:
            site_id: Site ID
            
        Returns:
            Publishing status information
        """
        async with get_async_session() as session:
            site = await self._get_site_with_relations(session, site_id)
            if not site:
                return {
                    "success": False,
                    "error": "Site not found"
                }
            
            if not site.published_sites:
                return {
                    "success": True,
                    "status": "not_published",
                    "site_status": site.status
                }
            
            published_site = site.published_sites[0]
            
            # Check SSL status if active
            ssl_status_info = None
            if published_site.ssl_status == SSLStatus.ACTIVE:
                ssl_status_info = await self.domain_manager.check_ssl_status(published_site)
            
            return {
                "success": True,
                "status": "published",
                "site_status": site.status,
                "published_site": {
                    "id": str(published_site.id),
                    "domain": published_site.domain,
                    "custom_domain": published_site.custom_domain,
                    "build_status": published_site.build_status,
                    "ssl_status": published_site.ssl_status,
                    "domain_status": published_site.domain_status,
                    "cdn_url": published_site.cdn_url,
                    "preview_url": published_site.preview_url,
                    "is_live": published_site.is_live,
                    "primary_url": published_site.primary_url,
                    "build_completed_at": published_site.build_completed_at.isoformat() if published_site.build_completed_at else None,
                    "ssl_expires_at": published_site.ssl_expires_at.isoformat() if published_site.ssl_expires_at else None
                },
                "ssl_status_info": ssl_status_info
            }
    
    async def rollback_deployment(self, site_id: str, target_version: str) -> Dict[str, Any]:
        """
        Rollback site to a previous version.
        
        Args:
            site_id: Site ID
            target_version: Version to rollback to
            
        Returns:
            Rollback result
        """
        async with get_async_session() as session:
            try:
                # Get site and deployment history
                site = await self._get_site_with_relations(session, site_id)
                if not site or not site.published_sites:
                    return {
                        "success": False,
                        "error": "Site not found or not published"
                    }
                
                published_site = site.published_sites[0]
                
                # Find target deployment
                stmt = select(DeploymentHistory).where(
                    DeploymentHistory.published_site_id == published_site.id,
                    DeploymentHistory.version == target_version,
                    DeploymentHistory.build_status == BuildStatus.SUCCESS
                )
                
                result = await session.execute(stmt)
                target_deployment = result.scalar_one_or_none()
                
                if not target_deployment:
                    return {
                        "success": False,
                        "error": "Target version not found or was not successful"
                    }
                
                # Create rollback deployment record
                current_version = f"v{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}-rollback"
                
                rollback_deployment = DeploymentHistory(
                    published_site_id=published_site.id,
                    version=current_version,
                    build_time=datetime.utcnow(),
                    build_duration=0,  # Rollback is instant
                    build_status=BuildStatus.SUCCESS,
                    build_size=target_deployment.build_size,
                    build_hash=target_deployment.build_hash,
                    build_logs=f"Rolled back to version {target_version}",
                    is_rollback=True,
                    rollback_from_version=target_version,
                    rollback_data=target_deployment.rollback_data
                )
                
                session.add(rollback_deployment)
                
                # Update published site with rollback info
                published_site.build_hash = target_deployment.build_hash
                published_site.build_size = target_deployment.build_size
                
                await session.commit()
                
                # TODO: Actually restore files from backup/CDN
                
                return {
                    "success": True,
                    "rolled_back_to": target_version,
                    "new_deployment_id": str(rollback_deployment.id)
                }
                
            except Exception as e:
                await session.rollback()
                return {
                    "success": False,
                    "error": str(e)
                }
    
    async def get_deployment_history(self, site_id: str) -> Dict[str, Any]:
        """
        Get deployment history for a site.
        
        Args:
            site_id: Site ID
            
        Returns:
            Deployment history
        """
        async with get_async_session() as session:
            site = await self._get_site_with_relations(session, site_id)
            if not site or not site.published_sites:
                return {
                    "success": False,
                    "error": "Site not found or not published"
                }
            
            published_site = site.published_sites[0]
            
            # Get deployment history
            stmt = select(DeploymentHistory).where(
                DeploymentHistory.published_site_id == published_site.id
            ).order_by(DeploymentHistory.build_time.desc())
            
            result = await session.execute(stmt)
            deployments = result.scalars().all()
            
            deployment_list = []
            for deployment in deployments:
                deployment_list.append({
                    "id": str(deployment.id),
                    "version": deployment.version,
                    "build_time": deployment.build_time.isoformat(),
                    "build_duration": deployment.build_duration,
                    "build_status": deployment.build_status,
                    "build_size": deployment.build_size,
                    "performance_score": deployment.performance_score,
                    "is_rollback": deployment.is_rollback,
                    "rollback_from_version": deployment.rollback_from_version,
                    "was_successful": deployment.was_successful
                })
            
            return {
                "success": True,
                "deployments": deployment_list,
                "total_deployments": len(deployment_list)
            }