"""
SEO Preservation Service
Maintains SEO rankings during website migration
"""

import json
import re
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class SEOPreserver:
    """Preserves SEO elements during migration"""
    
    def __init__(self):
        self.redirects = []
        self.meta_data = {}
        self.url_mapping = {}
        self.broken_links = []
        self.performance_metrics = {}
    
    def extract_seo_data(self, scraped_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract all SEO-relevant data from scraped website"""
        
        seo_data = {
            'meta_tags': {},
            'url_structure': {},
            'content_structure': {},
            'internal_links': {},
            'external_links': {},
            'images': {},
            'schema_markup': {},
            'performance_baseline': {}
        }
        
        base_url = scraped_data.get('base_url', '')
        
        # Process each page for SEO data
        for url, page_data in scraped_data.get('pages', {}).items():
            page_seo = self._extract_page_seo(url, page_data)
            seo_data['meta_tags'][url] = page_seo['meta_tags']
            seo_data['content_structure'][url] = page_seo['content_structure']
            seo_data['internal_links'][url] = page_seo['internal_links']
            seo_data['external_links'][url] = page_seo['external_links']
            seo_data['images'][url] = page_seo['images']
            seo_data['schema_markup'][url] = page_seo['schema_markup']
        
        # Extract URL structure patterns
        seo_data['url_structure'] = self._analyze_url_structure(scraped_data)
        
        # Generate redirect mapping
        seo_data['redirect_mapping'] = self._generate_redirect_mapping(scraped_data)
        
        return seo_data
    
    def _extract_page_seo(self, url: str, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract SEO data from individual page"""
        
        return {
            'meta_tags': {
                'title': page_data.get('title', ''),
                'description': page_data.get('meta', {}).get('description', ''),
                'keywords': page_data.get('meta', {}).get('keywords', ''),
                'canonical': page_data.get('meta', {}).get('canonical', url),
                'og_tags': page_data.get('seo', {}).get('og_tags', {}),
                'twitter_tags': page_data.get('seo', {}).get('twitter_tags', {})
            },
            'content_structure': {
                'h1': page_data.get('structure', {}).get('h1', []),
                'h2': page_data.get('structure', {}).get('h2', []),
                'h3': page_data.get('structure', {}).get('h3', []),
                'word_count': len(page_data.get('content', {}).get('text', '').split()),
                'content_length': len(page_data.get('content', {}).get('text', ''))
            },
            'internal_links': page_data.get('structure', {}).get('links', []),
            'external_links': [
                link for link in page_data.get('structure', {}).get('links', [])
                if not link['href'].startswith(urlparse(url).netloc)
            ],
            'images': [
                {
                    'src': img['src'],
                    'alt': img['alt'],
                    'title': img.get('title', ''),
                    'caption': self._extract_image_caption(img['src'], page_data)
                }
                for img in page_data.get('structure', {}).get('images', [])
            ],
            'schema_markup': page_data.get('seo', {}).get('schema_markup', [])
        }
    
    def _analyze_url_structure(self, scraped_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze URL structure for SEO optimization"""
        
        urls = list(scraped_data.get('pages', {}).keys())
        
        structure = {
            'depth_analysis': {},
            'keyword_usage': {},
            'url_patterns': [],
            'optimization_recommendations': []
        }
        
        for url in urls:
            parsed = urlparse(url)
            path_parts = [p for p in parsed.path.split('/') if p]
            
            # Analyze URL depth
            structure['depth_analysis'][url] = len(path_parts)
            
            # Extract keywords from URLs
            keywords = []
            for part in path_parts:
                keywords.extend(re.findall(r'[a-zA-Z]+', part.lower()))
            structure['keyword_usage'][url] = keywords
        
        # Generate recommendations
        structure['optimization_recommendations'] = self._generate_url_recommendations(structure)
        
        return structure
    
    def _generate_redirect_mapping(self, scraped_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate redirect mapping to preserve SEO value"""
        
        mapping = []
        base_url = scraped_data.get('base_url', '')
        
        for url in scraped_data.get('pages', {}).keys():
            if url.startswith(base_url):
                old_path = url[len(base_url):]
                if old_path:
                    # Generate new URL structure
                    new_path = self._optimize_url_path(old_path)
                    
                    mapping.append({
                        'old_url': url,
                        'new_url': urljoin(base_url, new_path),
                        'old_path': old_path,
                        'new_path': new_path,
                        'redirect_type': '301',  # Permanent redirect
                        'priority': 'high'
                    })
        
        return mapping
    
    def _optimize_url_path(self, path: str) -> str:
        """Optimize URL path for SEO"""
        
        # Remove trailing slashes
        path = path.rstrip('/')
        
        # Convert to lowercase
        path = path.lower()
        
        # Replace spaces and special characters with hyphens
        path = re.sub(r'[^a-zA-Z0-9-]', '-', path)
        path = re.sub(r'-+', '-', path)
        
        # Remove leading hyphen
        path = path.lstrip('-')
        
        return path
    
    def _generate_url_recommendations(self, structure: Dict[str, Any]) -> List[str]:
        """Generate URL optimization recommendations"""
        
        recommendations = []
        
        # Check URL depth
        deep_urls = [url for url, depth in structure['depth_analysis'].items() if depth > 3]
        if deep_urls:
            recommendations.append(
                f"Consider flattening URL structure for {len(deep_urls)} deep URLs"
            )
        
        # Check for dynamic parameters
        for url in structure['depth_analysis'].keys():
            if '?' in url or '=' in url:
                recommendations.append(
                    f"Consider creating static URLs for dynamic content: {url}"
                )
        
        return recommendations
    
    def _extract_image_caption(self, img_src: str, page_data: Dict[str, Any]) -> str:
        """Extract image caption from surrounding content"""
        
        # This would require HTML parsing to find captions
        # For now, return alt text as caption
        for img in page_data.get('structure', {}).get('images', []):
            if img['src'] == img_src:
                return img.get('alt', '')
        return ''
    
    def generate_robots_txt(self, scraped_data: Dict[str, Any]) -> str:
        """Generate robots.txt for the migrated site"""
        
        base_url = scraped_data.get('base_url', '')
        parsed = urlparse(base_url)
        
        robots_content = [
            "User-agent: *",
            "Allow: /",
            "",
            "# Sitemap",
            f"Sitemap: {urljoin(base_url, '/sitemap.xml')}",
            "",
            "# Common directories to block",
            "Disallow: /admin/",
            "Disallow: /wp-admin/",
            "Disallow: /cgi-bin/",
            "Disallow: /private/"
        ]
        
        return '\n'.join(robots_content)
    
    def generate_sitemap_xml(self, scraped_data: Dict[str, Any]) -> str:
        """Generate XML sitemap for the migrated site"""
        
        base_url = scraped_data.get('base_url', '')
        pages = scraped_data.get('pages', {})
        
        sitemap_content = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        ]
        
        for url, page_data in pages.items():
            # Generate new URL
            parsed = urlparse(url)
            new_path = self._optimize_url_path(parsed.path)
            new_url = urljoin(base_url, new_path)
            
            # Calculate priority based on URL depth
            depth = len([p for p in parsed.path.split('/') if p])
            priority = max(0.1, 1.0 - (depth * 0.2))
            
            # Use last modified date or current date
            lastmod = '2024-01-01'  # Default, should be actual last modified
            
            sitemap_content.extend([
                '  <url>',
                f'    <loc>{new_url}</loc>',
                f'    <lastmod>{lastmod}</lastmod>',
                '    <changefreq>weekly</changefreq>',
                f'    <priority>{priority:.1f}</priority>',
                '  </url>'
            ])
        
        sitemap_content.append('</urlset>')
        
        return '\n'.join(sitemap_content)
    
    def generate_meta_redirects(self, redirect_mapping: List[Dict[str, str]]) -> str:
        """Generate HTML meta redirects as fallback"""
        
        redirects_html = []
        
        for redirect in redirect_mapping:
            redirects_html.append(
                f'<meta http-equiv="refresh" content="0; url={redirect["new_url"]}" />'
            )
        
        return '\n'.join(redirects_html)
    
    def analyze_seo_impact(self, original_data: Dict[str, Any], migrated_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze SEO impact after migration"""
        
        impact_analysis = {
            'meta_tags': {
                'preserved': 0,
                'modified': 0,
                'lost': 0
            },
            'url_changes': {
                'total': 0,
                'redirects_created': 0,
                'potential_issues': []
            },
            'content_changes': {
                'word_count_diff': 0,
                'heading_preservation': 0,
                'image_alt_preservation': 0
            },
            'recommendations': []
        }
        
        original_pages = original_data.get('pages', {})
        migrated_pages = migrated_data.get('processed_pages', {})
        
        # Analyze meta tags preservation
        for url, original_page in original_pages.items():
            migrated_page = migrated_pages.get(url, {})
            
            original_meta = original_page.get('meta', {})
            migrated_meta = migrated_page.get('optimized', {}).get('metadata', {})
            
            if original_meta.get('title') == migrated_meta.get('title'):
                impact_analysis['meta_tags']['preserved'] += 1
            else:
                impact_analysis['meta_tags']['modified'] += 1
        
        # Generate recommendations
        if impact_analysis['meta_tags']['modified'] > 0:
            impact_analysis['recommendations'].append(
                f"Review {impact_analysis['meta_tags']['modified']} modified meta tags"
            )
        
        return impact_analysis

class RedirectManager:
    """Manages URL redirects for SEO preservation"""
    
    def __init__(self):
        self.redirects = []
        self.htaccess_rules = []
        self.nginx_rules = []
    
    def generate_redirects(self, redirect_mapping: List[Dict[str, str]], 
                          server_type: str = 'apache') -> str:
        """Generate server-specific redirect rules"""
        
        if server_type == 'apache':
            return self._generate_apache_redirects(redirect_mapping)
        elif server_type == 'nginx':
            return self._generate_nginx_redirects(redirect_mapping)
        else:
            return self._generate_generic_redirects(redirect_mapping)
    
    def _generate_apache_redirects(self, redirect_mapping: List[Dict[str, str]]) -> str:
        """Generate Apache .htaccess redirect rules"""
        
        rules = [
            "# SEO Redirect Rules - Generated for migration",
            "RewriteEngine On",
            ""
        ]
        
        for redirect in redirect_mapping:
            rules.append(
                f"Redirect 301 {redirect['old_path']} {redirect['new_path']}"
            )
        
        return '\n'.join(rules)
    
    def _generate_nginx_redirects(self, redirect_mapping: List[Dict[str, str]]) -> str:
        """Generate Nginx redirect rules"""
        
        rules = [
            "# SEO Redirect Rules - Generated for migration",
            "server {",
            "    listen 80;",
            "    server_name _;",
            ""
        ]
        
        for redirect in redirect_mapping:
            rules.append(
                f"    rewrite ^{redirect['old_path']}$ {redirect['new_path']} permanent;"
            )
        
        rules.extend(["}", ""])
        
        return '\n'.join(rules)
    
    def _generate_generic_redirects(self, redirect_mapping: List[Dict[str, str]]) -> str:
        """Generate generic redirect rules for JavaScript/Node.js"""
        
        rules = []
        for redirect in redirect_mapping:
            rules.append({
                'from': redirect['old_path'],
                'to': redirect['new_path'],
                'status': 301,
                'permanent': True
            })
        
        return json.dumps(rules, indent=2)
    
    def validate_redirects(self, redirect_mapping: List[Dict[str, str]]) -> Dict[str, Any]:
        """Validate redirect mapping for issues"""
        
        validation = {
            'valid': True,
            'issues': [],
            'warnings': [],
            'duplicates': [],
            'cycles': []
        }
        
        # Check for duplicates
        old_paths = [r['old_path'] for r in redirect_mapping]
        duplicates = [path for path in old_paths if old_paths.count(path) > 1]
        if duplicates:
            validation['duplicates'] = list(set(duplicates))
            validation['issues'].append(f"Duplicate redirects found: {duplicates}")
        
        # Check for redirect chains/cycles
        path_map = {r['old_path']: r['new_path'] for r in redirect_mapping}
        for old_path, new_path in path_map.items():
            if new_path in path_map:
                validation['cycles'].append(f"Redirect chain: {old_path} -> {new_path}")
        
        return validation