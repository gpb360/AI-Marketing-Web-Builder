"""Domain management service for custom domain setup and SSL certificates."""

import asyncio
import dns.resolver
import ssl
import socket
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import requests
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import boto3
from botocore.exceptions import ClientError

from ..core.config import settings
from ..models.sites import PublishedSite, DomainStatus, SSLStatus


class DomainManager:
    """Handles custom domain configuration and SSL certificate management."""
    
    def __init__(self):
        # Cloudflare API client
        self.cloudflare_headers = {
            'Authorization': f'Bearer {settings.cloudflare_api_token}',
            'Content-Type': 'application/json'
        }
        
        # AWS Certificate Manager client
        self.acm_client = None
        if settings.aws_access_key_id and settings.aws_secret_access_key:
            self.acm_client = boto3.client(
                'acm',
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region
            )
    
    async def verify_domain_ownership(self, domain: str, site_id: str) -> Dict[str, Any]:
        """
        Verify domain ownership using DNS TXT record.
        
        Args:
            domain: Domain to verify
            site_id: Site ID for verification token
            
        Returns:
            Verification result
        """
        verification_token = f"aiwebbuilder-verify={site_id}"
        
        try:
            # Query DNS TXT records
            answers = dns.resolver.resolve(domain, 'TXT')
            
            for answer in answers:
                txt_record = str(answer).strip('"')
                if txt_record == verification_token:
                    return {
                        "status": DomainStatus.VERIFIED,
                        "verified_at": datetime.utcnow(),
                        "verification_method": "dns_txt"
                    }
            
            return {
                "status": DomainStatus.FAILED,
                "error": "Verification TXT record not found",
                "expected_record": verification_token
            }
            
        except Exception as e:
            return {
                "status": DomainStatus.DNS_ERROR,
                "error": str(e)
            }
    
    async def setup_dns_records(self, domain: str, target_url: str) -> Dict[str, Any]:
        """
        Setup DNS records for custom domain.
        
        Args:
            domain: Custom domain
            target_url: Target URL (CDN or load balancer)
            
        Returns:
            DNS setup result
        """
        if not settings.cloudflare_api_token:
            return {
                "status": "manual",
                "instructions": {
                    "record_type": "CNAME",
                    "name": domain,
                    "value": target_url,
                    "ttl": 300
                }
            }
        
        try:
            # Get zone ID for domain
            zone_id = await self._get_cloudflare_zone_id(domain)
            if not zone_id:
                return {
                    "status": "error",
                    "error": "Domain zone not found in Cloudflare"
                }
            
            # Create CNAME record
            response = requests.post(
                f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records',
                headers=self.cloudflare_headers,
                json={
                    'type': 'CNAME',
                    'name': domain,
                    'content': target_url,
                    'ttl': 300,
                    'proxied': True  # Enable Cloudflare proxy for security
                }
            )
            
            if response.status_code == 200:
                return {
                    "status": "success",
                    "record_id": response.json()['result']['id']
                }
            else:
                return {
                    "status": "error",
                    "error": response.json().get('errors', [])
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _get_cloudflare_zone_id(self, domain: str) -> Optional[str]:
        """Get Cloudflare zone ID for domain."""
        # Extract root domain
        domain_parts = domain.split('.')
        if len(domain_parts) >= 2:
            root_domain = '.'.join(domain_parts[-2:])
        else:
            root_domain = domain
        
        try:
            response = requests.get(
                f'https://api.cloudflare.com/client/v4/zones?name={root_domain}',
                headers=self.cloudflare_headers
            )
            
            if response.status_code == 200:
                zones = response.json()['result']
                if zones:
                    return zones[0]['id']
            
            return None
            
        except Exception:
            return None
    
    async def request_ssl_certificate(self, domain: str) -> Dict[str, Any]:
        """
        Request SSL certificate for domain.
        
        Args:
            domain: Domain for SSL certificate
            
        Returns:
            Certificate request result
        """
        if self.acm_client:
            return await self._request_acm_certificate(domain)
        else:
            return await self._request_letsencrypt_certificate(domain)
    
    async def _request_acm_certificate(self, domain: str) -> Dict[str, Any]:
        """Request certificate from AWS Certificate Manager."""
        try:
            response = self.acm_client.request_certificate(
                DomainName=domain,
                SubjectAlternativeNames=[f'www.{domain}'],
                ValidationMethod='DNS',
                Tags=[
                    {
                        'Key': 'Service',
                        'Value': 'AIWebBuilder'
                    }
                ]
            )
            
            certificate_arn = response['CertificateArn']
            
            # Get DNS validation records
            cert_details = self.acm_client.describe_certificate(
                CertificateArn=certificate_arn
            )
            
            validation_records = []
            for validation in cert_details['Certificate'].get('DomainValidationOptions', []):
                if 'ResourceRecord' in validation:
                    validation_records.append({
                        'name': validation['ResourceRecord']['Name'],
                        'type': validation['ResourceRecord']['Type'],
                        'value': validation['ResourceRecord']['Value']
                    })
            
            return {
                "status": SSLStatus.PENDING,
                "certificate_arn": certificate_arn,
                "validation_records": validation_records,
                "provider": "aws_acm"
            }
            
        except Exception as e:
            return {
                "status": SSLStatus.FAILED,
                "error": str(e)
            }
    
    async def _request_letsencrypt_certificate(self, domain: str) -> Dict[str, Any]:
        """Request certificate from Let's Encrypt."""
        # This would integrate with ACME client (like certbot)
        # For now, return a placeholder implementation
        
        return {
            "status": SSLStatus.PENDING,
            "provider": "letsencrypt",
            "challenge_type": "dns-01",
            "instructions": f"Create DNS TXT record _acme-challenge.{domain} with provided value"
        }
    
    async def check_ssl_status(self, published_site: PublishedSite) -> Dict[str, Any]:
        """
        Check SSL certificate status for published site.
        
        Args:
            published_site: PublishedSite instance
            
        Returns:
            SSL status information
        """
        domain = published_site.custom_domain or published_site.domain
        
        try:
            # Check SSL certificate via direct connection
            context = ssl.create_default_context()
            
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert_der = ssock.getpeercert_chain()[0]
                    cert = x509.load_der_x509_certificate(cert_der)
                    
                    # Extract certificate information
                    subject = cert.subject
                    issuer = cert.issuer
                    not_after = cert.not_valid_after
                    
                    # Get subject common name
                    common_name = None
                    for attribute in subject:
                        if attribute.oid == NameOID.COMMON_NAME:
                            common_name = attribute.value
                            break
                    
                    # Get issuer organization
                    issuer_org = None
                    for attribute in issuer:
                        if attribute.oid == NameOID.ORGANIZATION_NAME:
                            issuer_org = attribute.value
                            break
                    
                    # Check if certificate is valid and not expiring soon
                    now = datetime.utcnow()
                    days_until_expiry = (not_after - now).days
                    
                    if days_until_expiry > 30:
                        status = SSLStatus.ACTIVE
                    elif days_until_expiry > 0:
                        status = SSLStatus.ACTIVE  # But needs renewal soon
                    else:
                        status = SSLStatus.EXPIRED
                    
                    return {
                        "status": status,
                        "common_name": common_name,
                        "issuer": issuer_org,
                        "expires_at": not_after,
                        "days_until_expiry": days_until_expiry
                    }
                    
        except Exception as e:
            return {
                "status": SSLStatus.FAILED,
                "error": str(e)
            }
    
    async def setup_domain_security(self, domain: str) -> Dict[str, Any]:
        """
        Setup domain security headers and policies.
        
        Args:
            domain: Domain to secure
            
        Returns:
            Security setup result
        """
        security_config = {
            "security_headers": {
                "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                "X-XSS-Protection": "1; mode=block",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'"
            },
            "ssl_redirect": True,
            "hsts_enabled": True
        }
        
        # Apply security configuration (would integrate with CDN/proxy)
        return {
            "status": "success",
            "security_config": security_config
        }
    
    async def validate_domain_configuration(self, domain: str) -> Dict[str, Any]:
        """
        Validate complete domain configuration.
        
        Args:
            domain: Domain to validate
            
        Returns:
            Validation results
        """
        results = {
            "domain": domain,
            "dns_resolution": False,
            "ssl_certificate": False,
            "security_headers": False,
            "performance_score": 0,
            "issues": []
        }
        
        try:
            # Test DNS resolution
            dns_result = await self._test_dns_resolution(domain)
            results["dns_resolution"] = dns_result["success"]
            if not dns_result["success"]:
                results["issues"].append(f"DNS resolution failed: {dns_result['error']}")
            
            # Test SSL certificate
            ssl_result = await self._test_ssl_certificate(domain)
            results["ssl_certificate"] = ssl_result["success"]
            if not ssl_result["success"]:
                results["issues"].append(f"SSL certificate issue: {ssl_result['error']}")
            
            # Test security headers
            security_result = await self._test_security_headers(domain)
            results["security_headers"] = security_result["success"]
            if not security_result["success"]:
                results["issues"].append(f"Security headers missing: {security_result['missing']}")
            
            # Calculate performance score
            results["performance_score"] = await self._calculate_performance_score(domain)
            
        except Exception as e:
            results["issues"].append(f"Validation error: {str(e)}")
        
        return results
    
    async def _test_dns_resolution(self, domain: str) -> Dict[str, Any]:
        """Test DNS resolution for domain."""
        try:
            answers = dns.resolver.resolve(domain, 'A')
            return {
                "success": True,
                "ip_addresses": [str(answer) for answer in answers]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _test_ssl_certificate(self, domain: str) -> Dict[str, Any]:
        """Test SSL certificate validity."""
        try:
            context = ssl.create_default_context()
            
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    return {"success": True}
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _test_security_headers(self, domain: str) -> Dict[str, Any]:
        """Test security headers presence."""
        required_headers = [
            'strict-transport-security',
            'x-content-type-options',
            'x-frame-options'
        ]
        
        try:
            response = requests.head(f'https://{domain}', timeout=10)
            present_headers = [h.lower() for h in response.headers.keys()]
            missing_headers = [h for h in required_headers if h not in present_headers]
            
            return {
                "success": len(missing_headers) == 0,
                "missing": missing_headers
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _calculate_performance_score(self, domain: str) -> int:
        """Calculate basic performance score (0-100)."""
        try:
            # Simple performance test - measure response time
            start_time = datetime.utcnow()
            response = requests.get(f'https://{domain}', timeout=30)
            end_time = datetime.utcnow()
            
            response_time = (end_time - start_time).total_seconds()
            
            # Score based on response time
            if response_time < 1.0:
                return 100
            elif response_time < 2.0:
                return 90
            elif response_time < 3.0:
                return 80
            elif response_time < 5.0:
                return 70
            else:
                return 60
                
        except Exception:
            return 0