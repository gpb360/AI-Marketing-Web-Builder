"""Site generation service for converting components to static HTML."""

import os
import json
import hashlib
import tempfile
import shutil
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, Template as Jinja2Template
import cssmin
import jsmin
from PIL import Image
import boto3
from botocore.exceptions import ClientError

from ..core.config import settings
from ..models.sites import Site, Component, PublishedSite, BuildStatus


class SiteGenerator:
    """Handles static site generation from component data."""
    
    def __init__(self):
        self.templates_dir = Path(__file__).parent.parent / "templates"
        self.static_dir = Path(__file__).parent.parent / "static"
        self.jinja_env = Environment(
            loader=FileSystemLoader([str(self.templates_dir)]),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # AWS S3 client for file storage
        self.s3_client = None
        if settings.aws_access_key_id and settings.aws_secret_access_key:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region
            )
    
    async def generate_site(self, site: Site) -> Dict[str, Any]:
        """
        Generate static site from component data.
        
        Args:
            site: Site model instance
            
        Returns:
            Dictionary with build results
        """
        build_start = datetime.utcnow()
        
        try:
            # Create temporary build directory
            with tempfile.TemporaryDirectory() as temp_dir:
                build_dir = Path(temp_dir) / "build"
                build_dir.mkdir(exist_ok=True)
                
                # Generate site structure
                await self._generate_site_structure(site, build_dir)
                
                # Generate HTML from components
                html_content = await self._generate_html(site)
                
                # Generate CSS
                css_content = await self._generate_css(site)
                
                # Generate JavaScript
                js_content = await self._generate_javascript(site)
                
                # Optimize images
                await self._optimize_images(site, build_dir)
                
                # Write main files
                await self._write_site_files(
                    build_dir, html_content, css_content, js_content, site
                )
                
                # Generate SEO files
                await self._generate_seo_files(site, build_dir)
                
                # Calculate build hash
                build_hash = await self._calculate_build_hash(build_dir)
                
                # Calculate build size
                build_size = await self._calculate_build_size(build_dir)
                
                # Upload to S3/CDN
                cdn_url = await self._upload_to_cdn(build_dir, site)
                
                build_end = datetime.utcnow()
                build_duration = int((build_end - build_start).total_seconds())
                
                return {
                    "status": BuildStatus.SUCCESS,
                    "build_hash": build_hash,
                    "build_size": build_size,
                    "build_duration": build_duration,
                    "cdn_url": cdn_url,
                    "build_started_at": build_start,
                    "build_completed_at": build_end
                }
                
        except Exception as e:
            build_end = datetime.utcnow()
            build_duration = int((build_end - build_start).total_seconds())
            
            return {
                "status": BuildStatus.FAILED,
                "build_duration": build_duration,
                "build_started_at": build_start,
                "build_completed_at": build_end,
                "error": str(e)
            }
    
    async def _generate_site_structure(self, site: Site, build_dir: Path) -> None:
        """Create basic site directory structure."""
        directories = [
            "assets/css",
            "assets/js",
            "assets/images",
            "assets/fonts"
        ]
        
        for directory in directories:
            (build_dir / directory).mkdir(parents=True, exist_ok=True)
    
    async def _generate_html(self, site: Site) -> str:
        """Generate main HTML content from components."""
        # Load base template
        base_template = self.jinja_env.get_template("base.html")
        
        # Generate component HTML
        components_html = []
        sorted_components = sorted(site.components, key=lambda c: c.order_index)
        
        for component in sorted_components:
            component_html = await self._generate_component_html(component)
            components_html.append(component_html)
        
        # Render final HTML
        html_content = base_template.render(
            site=site,
            components_html="\n".join(components_html),
            meta_title=site.meta_title or site.name,
            meta_description=site.meta_description or site.description,
            favicon_url=site.favicon_url
        )
        
        return html_content
    
    async def _generate_component_html(self, component: Component) -> str:
        """Generate HTML for a single component."""
        component_type = component.type.value
        template_name = f"components/{component_type}.html"
        
        try:
            template = self.jinja_env.get_template(template_name)
            return template.render(
                component=component,
                config=component.config,
                styles=component.styles
            )
        except Exception:
            # Fallback to generic component template
            generic_template = self.jinja_env.get_template("components/generic.html")
            return generic_template.render(component=component)
    
    async def _generate_css(self, site: Site) -> str:
        """Generate and optimize CSS."""
        css_parts = []
        
        # Add base CSS
        base_css_path = self.static_dir / "css" / "base.css"
        if base_css_path.exists():
            css_parts.append(base_css_path.read_text())
        
        # Add Tailwind CSS (would be compiled from config)
        tailwind_css = await self._compile_tailwind_css(site)
        css_parts.append(tailwind_css)
        
        # Add component-specific styles
        for component in site.components:
            if component.styles:
                component_css = await self._generate_component_css(component)
                css_parts.append(component_css)
        
        # Combine all CSS
        combined_css = "\n".join(css_parts)
        
        # Minify if enabled
        if settings.css_minification:
            combined_css = cssmin.cssmin(combined_css)
        
        return combined_css
    
    async def _compile_tailwind_css(self, site: Site) -> str:
        """Compile Tailwind CSS based on site configuration."""
        # This would integrate with Tailwind CLI or PostCSS
        # For now, return basic Tailwind classes used
        
        base_classes = [
            "container", "mx-auto", "px-4", "py-8", "text-center",
            "bg-blue-500", "text-white", "rounded", "shadow-lg",
            "hover:bg-blue-600", "transition-colors", "duration-200"
        ]
        
        # Extract classes used in components
        used_classes = set(base_classes)
        for component in site.components:
            if isinstance(component.config, dict):
                # Extract Tailwind classes from component config
                classes = self._extract_tailwind_classes(component.config)
                used_classes.update(classes)
        
        # Generate minimal Tailwind CSS
        # In production, this would use Tailwind's purge functionality
        return self._generate_minimal_tailwind(used_classes)
    
    def _extract_tailwind_classes(self, config: Dict[str, Any]) -> List[str]:
        """Extract Tailwind classes from component configuration."""
        classes = []
        
        def extract_from_value(value):
            if isinstance(value, str) and any(prefix in value for prefix in ['bg-', 'text-', 'p-', 'm-', 'w-', 'h-']):
                classes.extend(value.split())
            elif isinstance(value, dict):
                for v in value.values():
                    extract_from_value(v)
            elif isinstance(value, list):
                for item in value:
                    extract_from_value(item)
        
        extract_from_value(config)
        return classes
    
    def _generate_minimal_tailwind(self, classes: set) -> str:
        """Generate minimal Tailwind CSS for used classes."""
        # This is a simplified version - in production would use actual Tailwind
        css_rules = []
        
        for class_name in classes:
            if class_name.startswith('bg-'):
                color = class_name.replace('bg-', '')
                css_rules.append(f".{class_name} {{ background-color: var(--color-{color}); }}")
            elif class_name.startswith('text-'):
                if class_name.endswith('-center'):
                    css_rules.append(f".{class_name} {{ text-align: center; }}")
                else:
                    color = class_name.replace('text-', '')
                    css_rules.append(f".{class_name} {{ color: var(--color-{color}); }}")
            elif class_name.startswith('p-'):
                size = class_name.replace('p-', '')
                css_rules.append(f".{class_name} {{ padding: {size}rem; }}")
        
        return "\n".join(css_rules)
    
    async def _generate_component_css(self, component: Component) -> str:
        """Generate CSS for component custom styles."""
        if not component.styles:
            return ""
        
        css_rules = []
        component_selector = f".component-{component.component_id}"
        
        # Convert styles dict to CSS
        for property_name, value in component.styles.items():
            css_property = property_name.replace('_', '-')
            css_rules.append(f"  {css_property}: {value};")
        
        if css_rules:
            return f"{component_selector} {{\n" + "\n".join(css_rules) + "\n}"
        
        return ""
    
    async def _generate_javascript(self, site: Site) -> str:
        """Generate and bundle JavaScript."""
        js_parts = []
        
        # Add base JavaScript
        base_js_path = self.static_dir / "js" / "base.js"
        if base_js_path.exists():
            js_parts.append(base_js_path.read_text())
        
        # Add component-specific JavaScript
        for component in site.components:
            component_js = await self._generate_component_js(component)
            if component_js:
                js_parts.append(component_js)
        
        # Add analytics tracking
        if site.settings.get('analytics_id'):
            analytics_js = self._generate_analytics_js(site.settings['analytics_id'])
            js_parts.append(analytics_js)
        
        # Combine all JavaScript
        combined_js = "\n".join(js_parts)
        
        # Minify if enabled
        if settings.js_bundling:
            combined_js = jsmin.jsmin(combined_js)
        
        return combined_js
    
    async def _generate_component_js(self, component: Component) -> str:
        """Generate JavaScript for interactive components."""
        if component.type.value == "contact_form":
            return self._generate_form_js(component)
        elif component.type.value == "newsletter_signup":
            return self._generate_newsletter_js(component)
        elif component.type.value == "cta_button":
            return self._generate_cta_js(component)
        
        return ""
    
    def _generate_form_js(self, component: Component) -> str:
        """Generate JavaScript for contact forms."""
        return f"""
        document.addEventListener('DOMContentLoaded', function() {{
            const form = document.getElementById('{component.component_id}');
            if (form) {{
                form.addEventListener('submit', async function(e) {{
                    e.preventDefault();
                    const formData = new FormData(form);
                    
                    try {{
                        const response = await fetch('/api/v1/forms/submit', {{
                            method: 'POST',
                            body: formData
                        }});
                        
                        if (response.ok) {{
                            form.innerHTML = '<div class="success-message">Thank you for your message!</div>';
                        }}
                    }} catch (error) {{
                        console.error('Form submission error:', error);
                    }}
                }});
            }}
        }});
        """
    
    def _generate_newsletter_js(self, component: Component) -> str:
        """Generate JavaScript for newsletter signup."""
        return f"""
        document.addEventListener('DOMContentLoaded', function() {{
            const form = document.getElementById('{component.component_id}');
            if (form) {{
                form.addEventListener('submit', async function(e) {{
                    e.preventDefault();
                    const email = form.querySelector('input[type="email"]').value;
                    
                    try {{
                        const response = await fetch('/api/v1/newsletter/subscribe', {{
                            method: 'POST',
                            headers: {{ 'Content-Type': 'application/json' }},
                            body: JSON.stringify({{ email }})
                        }});
                        
                        if (response.ok) {{
                            form.innerHTML = '<div class="success-message">Successfully subscribed!</div>';
                        }}
                    }} catch (error) {{
                        console.error('Newsletter subscription error:', error);
                    }}
                }});
            }}
        }});
        """
    
    def _generate_cta_js(self, component: Component) -> str:
        """Generate JavaScript for CTA buttons."""
        return f"""
        document.addEventListener('DOMContentLoaded', function() {{
            const button = document.getElementById('{component.component_id}');
            if (button) {{
                button.addEventListener('click', function() {{
                    // Track CTA click
                    if (window.gtag) {{
                        gtag('event', 'click', {{
                            'event_category': 'CTA',
                            'event_label': '{component.name}'
                        }});
                    }}
                }});
            }}
        }});
        """
    
    def _generate_analytics_js(self, analytics_id: str) -> str:
        """Generate Google Analytics JavaScript."""
        return f"""
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={analytics_id}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){{dataLayer.push(arguments);}}
            gtag('js', new Date());
            gtag('config', '{analytics_id}');
        </script>
        """
    
    async def _optimize_images(self, site: Site, build_dir: Path) -> None:
        """Optimize images for web delivery."""
        if not settings.image_optimization:
            return
        
        images_dir = build_dir / "assets" / "images"
        
        # Process images from components
        for component in site.components:
            if isinstance(component.config, dict):
                await self._process_component_images(component.config, images_dir)
    
    async def _process_component_images(self, config: Dict[str, Any], images_dir: Path) -> None:
        """Process and optimize images from component configuration."""
        def process_value(value):
            if isinstance(value, str) and (value.startswith('http') or value.endswith(('.jpg', '.jpeg', '.png', '.gif'))):
                # This would download and optimize the image
                # For now, just log the image URL
                pass
            elif isinstance(value, dict):
                for v in value.values():
                    process_value(v)
            elif isinstance(value, list):
                for item in value:
                    process_value(item)
        
        process_value(config)
    
    async def _write_site_files(
        self, 
        build_dir: Path, 
        html_content: str, 
        css_content: str, 
        js_content: str, 
        site: Site
    ) -> None:
        """Write generated files to build directory."""
        # Write main HTML file
        (build_dir / "index.html").write_text(html_content, encoding='utf-8')
        
        # Write CSS file
        if css_content:
            (build_dir / "assets" / "css" / "main.css").write_text(css_content, encoding='utf-8')
        
        # Write JavaScript file
        if js_content:
            (build_dir / "assets" / "js" / "main.js").write_text(js_content, encoding='utf-8')
    
    async def _generate_seo_files(self, site: Site, build_dir: Path) -> None:
        """Generate SEO-related files."""
        # Generate sitemap.xml
        sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{site.url}</loc>
        <lastmod>{datetime.utcnow().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>"""
        
        (build_dir / "sitemap.xml").write_text(sitemap_content, encoding='utf-8')
        
        # Generate robots.txt
        robots_content = f"""User-agent: *
Allow: /

Sitemap: {site.url}/sitemap.xml"""
        
        (build_dir / "robots.txt").write_text(robots_content, encoding='utf-8')
        
        # Generate manifest.json for PWA
        manifest_content = {
            "name": site.name,
            "short_name": site.name[:12],
            "description": site.description or "",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#000000"
        }
        
        (build_dir / "manifest.json").write_text(
            json.dumps(manifest_content, indent=2), 
            encoding='utf-8'
        )
    
    async def _calculate_build_hash(self, build_dir: Path) -> str:
        """Calculate SHA256 hash of build artifacts."""
        hasher = hashlib.sha256()
        
        for file_path in sorted(build_dir.rglob("*")):
            if file_path.is_file():
                hasher.update(file_path.read_bytes())
        
        return hasher.hexdigest()
    
    async def _calculate_build_size(self, build_dir: Path) -> int:
        """Calculate total size of build artifacts in bytes."""
        total_size = 0
        
        for file_path in build_dir.rglob("*"):
            if file_path.is_file():
                total_size += file_path.stat().st_size
        
        return total_size
    
    async def _upload_to_cdn(self, build_dir: Path, site: Site) -> Optional[str]:
        """Upload build artifacts to S3/CDN."""
        if not self.s3_client:
            return None
        
        try:
            # Upload all files to S3
            for file_path in build_dir.rglob("*"):
                if file_path.is_file():
                    relative_path = file_path.relative_to(build_dir)
                    s3_key = f"sites/{site.id}/{relative_path}"
                    
                    # Determine content type
                    content_type = self._get_content_type(file_path.suffix)
                    
                    self.s3_client.upload_file(
                        str(file_path),
                        settings.s3_bucket_name,
                        s3_key,
                        ExtraArgs={
                            'ContentType': content_type,
                            'CacheControl': 'max-age=31536000' if file_path.suffix in ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif'] else 'max-age=3600'
                        }
                    )
            
            # Return CDN URL
            if settings.cloudfront_distribution_id:
                return f"https://{settings.cloudfront_distribution_id}.cloudfront.net/sites/{site.id}"
            else:
                return f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/sites/{site.id}"
                
        except Exception as e:
            print(f"CDN upload error: {e}")
            return None
    
    def _get_content_type(self, file_extension: str) -> str:
        """Get appropriate content type for file extension."""
        content_types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.xml': 'application/xml',
            '.txt': 'text/plain',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        }
        
        return content_types.get(file_extension.lower(), 'application/octet-stream')