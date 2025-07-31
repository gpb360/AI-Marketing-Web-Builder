"""
Website Scraping Service for Template Migration
Provides robust scraping with error handling and content extraction
"""

import asyncio
import aiohttp
import re
import json
import logging
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse, parse_qs
from bs4 import BeautifulSoup
import cssutils
from pathlib import Path
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)

class ScrapingError(Exception):
    """Custom exception for scraping errors"""
    pass

class WebsiteScraper:
    """Advanced website scraper for template migration"""
    
    def __init__(self, max_concurrent=10, timeout=30):
        self.max_concurrent = max_concurrent
        self.timeout = timeout
        self.session = None
        self.visited_urls = set()
        self.scraped_content = {}
        self.error_log = []
        
    async def __aenter__(self):
        """Async context manager entry"""
        connector = aiohttp.TCPConnector(limit=self.max_concurrent, limit_per_host=5)
        timeout = aiohttp.ClientTimeout(total=self.timeout)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def scrape_website(self, url: str, depth: int = 3) -> Dict[str, Any]:
        """
        Main scraping method - scrapes entire website structure
        
        Args:
            url: Base URL to scrape
            depth: Maximum crawl depth
            
        Returns:
            Dict containing scraped content and metadata
        """
        try:
            if not self.session:
                raise ScrapingError("Scraper not initialized. Use async context manager.")
            
            base_url = self._normalize_url(url)
            logger.info(f"Starting scrape of {base_url} with depth {depth}")
            
            # Initialize scraping state
            self.visited_urls.clear()
            self.scraped_content = {
                'base_url': base_url,
                'pages': {},
                'assets': {},
                'styles': {},
                'scripts': {},
                'metadata': {
                    'start_time': datetime.utcnow().isoformat(),
                    'total_pages': 0,
                    'total_assets': 0,
                    'errors': []
                }
            }
            
            # Start recursive scraping
            await self._crawl_page(base_url, depth)
            
            # Process and optimize content
            await self._process_content()
            
            self.scraped_content['metadata'].update({
                'end_time': datetime.utcnow().isoformat(),
                'total_pages': len(self.scraped_content['pages']),
                'total_assets': len(self.scraped_content['assets']),
                'errors': self.error_log
            })
            
            return self.scraped_content
            
        except Exception as e:
            logger.error(f"Failed to scrape website: {str(e)}")
            raise ScrapingError(f"Website scraping failed: {str(e)}")
    
    async def _crawl_page(self, url: str, depth: int):
        """Recursively crawl pages"""
        if depth <= 0 or url in self.visited_urls:
            return
        
        self.visited_urls.add(url)
        
        try:
            content = await self._fetch_page(url)
            if not content:
                return
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract page content
            page_data = await self._extract_page_content(url, soup)
            self.scraped_content['pages'][url] = page_data
            
            # Extract assets
            await self._extract_assets(url, soup)
            
            # Find and crawl internal links
            if depth > 1:
                links = self._extract_internal_links(url, soup)
                tasks = [self._crawl_page(link, depth - 1) for link in links]
                await asyncio.gather(*tasks, return_exceptions=True)
                
        except Exception as e:
            error_msg = f"Error crawling {url}: {str(e)}"
            logger.error(error_msg)
            self.error_log.append(error_msg)
    
    async def _fetch_page(self, url: str) -> Optional[str]:
        """Fetch page content with retries"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        content_type = response.headers.get('content-type', '')
                        if 'text/html' in content_type:
                            return await response.text()
                        else:
                            logger.warning(f"Skipping non-HTML content at {url}")
                            return None
                    else:
                        logger.warning(f"HTTP {response.status} for {url}")
                        
            except asyncio.TimeoutError:
                logger.warning(f"Timeout fetching {url} (attempt {attempt + 1})")
            except Exception as e:
                logger.error(f"Error fetching {url}: {str(e)}")
                
        return None
    
    async def _extract_page_content(self, url: str, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract structured content from HTML page"""
        
        # Remove script and style tags for cleaner content
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extract metadata
        title = soup.find('title')
        meta_description = soup.find('meta', attrs={'name': 'description'})
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        
        # Extract structured content
        content = {
            'url': url,
            'title': title.string if title else '',
            'meta': {
                'description': meta_description.get('content', '') if meta_description else '',
                'keywords': meta_keywords.get('content', '') if meta_keywords else '',
                'canonical': self._extract_canonical_url(soup, url)
            },
            'structure': {
                'h1': [h.get_text(strip=True) for h in soup.find_all('h1')],
                'h2': [h.get_text(strip=True) for h in soup.find_all('h2')],
                'h3': [h.get_text(strip=True) for h in soup.find_all('h3')],
                'images': self._extract_images(soup, url),
                'links': self._extract_link_structure(soup, url),
                'forms': self._extract_forms(soup),
            },
            'content': {
                'text': soup.get_text(strip=True, separator='\n'),
                'html': str(soup.body) if soup.body else str(soup),
                'selectors': self._generate_selectors(soup)
            },
            'seo': {
                'og_tags': self._extract_og_tags(soup),
                'twitter_tags': self._extract_twitter_tags(soup),
                'schema_markup': self._extract_schema_markup(soup)
            }
        }
        
        return content
    
    async def _extract_assets(self, base_url: str, soup: BeautifulSoup):
        """Extract CSS, JS, and image assets"""
        
        # Extract CSS
        for link in soup.find_all('link', rel='stylesheet'):
            css_url = urljoin(base_url, link.get('href', ''))
            if css_url not in self.scraped_content['styles']:
                try:
                    async with self.session.get(css_url) as response:
                        if response.status == 200:
                            css_content = await response.text()
                            self.scraped_content['styles'][css_url] = {
                                'content': css_content,
                                'url': css_url,
                                'type': 'external'
                            }
                except Exception as e:
                    logger.error(f"Failed to fetch CSS {css_url}: {e}")
        
        # Extract inline CSS
        for style in soup.find_all('style'):
            style_hash = hashlib.md5(style.get_text().encode()).hexdigest()
            self.scraped_content['styles'][f'inline_{style_hash}'] = {
                'content': style.get_text(),
                'url': base_url,
                'type': 'inline'
            }
        
        # Extract JavaScript
        for script in soup.find_all('script', src=True):
            js_url = urljoin(base_url, script.get('src'))
            if js_url not in self.scraped_content['scripts']:
                try:
                    async with self.session.get(js_url) as response:
                        if response.status == 200:
                            js_content = await response.text()
                            self.scraped_content['scripts'][js_url] = {
                                'content': js_content,
                                'url': js_url,
                                'type': 'external'
                            }
                except Exception as e:
                    logger.error(f"Failed to fetch JS {js_url}: {e}")
        
        # Extract inline JavaScript
        for script in soup.find_all('script', src=None):
            if script.get_text().strip():
                script_hash = hashlib.md5(script.get_text().encode()).hexdigest()
                self.scraped_content['scripts'][f'inline_{script_hash}'] = {
                    'content': script.get_text(),
                    'url': base_url,
                    'type': 'inline'
                }
        
        # Extract images and other assets
        for img in soup.find_all('img'):
            img_url = urljoin(base_url, img.get('src', ''))
            if img_url not in self.scraped_content['assets']:
                self.scraped_content['assets'][img_url] = {
                    'type': 'image',
                    'alt': img.get('alt', ''),
                    'url': img_url
                }
    
    def _extract_internal_links(self, base_url: str, soup: BeautifulSoup) -> List[str]:
        """Extract internal links for crawling"""
        base_domain = urlparse(base_url).netloc
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            # Only include internal links
            if parsed.netloc == base_domain and full_url not in self.visited_urls:
                # Skip common non-content URLs
                if not any(skip in full_url.lower() for skip in [
                    '.pdf', '.zip', '.exe', '.mp4', '.mp3',
                    'mailto:', 'tel:', 'javascript:', '#'
                ]):
                    links.append(full_url)
        
        return list(set(links))[:20]  # Limit to prevent excessive crawling
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract image information"""
        images = []
        for img in soup.find_all('img'):
            src = urljoin(base_url, img.get('src', ''))
            images.append({
                'src': src,
                'alt': img.get('alt', ''),
                'width': img.get('width', ''),
                'height': img.get('height', ''),
                'class': img.get('class', [])
            })
        return images
    
    def _extract_link_structure(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract link structure"""
        links = []
        for link in soup.find_all('a', href=True):
            links.append({
                'text': link.get_text(strip=True),
                'href': urljoin(base_url, link.get('href')),
                'title': link.get('title', ''),
                'rel': link.get('rel', [])
            })
        return links
    
    def _extract_forms(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract form structure"""
        forms = []
        for form in soup.find_all('form'):
            form_data = {
                'action': form.get('action', ''),
                'method': form.get('method', 'get'),
                'inputs': []
            }
            
            for input_tag in form.find_all(['input', 'textarea', 'select']):
                input_data = {
                    'type': input_tag.get('type', input_tag.name),
                    'name': input_tag.get('name', ''),
                    'id': input_tag.get('id', ''),
                    'placeholder': input_tag.get('placeholder', ''),
                    'required': input_tag.get('required') is not None
                }
                form_data['inputs'].append(input_data)
            
            forms.append(form_data)
        return forms
    
    def _extract_og_tags(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract Open Graph tags"""
        og_tags = {}
        for tag in soup.find_all('meta', property=re.compile(r'^og:')):
            prop = tag.get('property', '').replace('og:', '')
            content = tag.get('content', '')
            og_tags[prop] = content
        return og_tags
    
    def _extract_twitter_tags(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract Twitter card tags"""
        twitter_tags = {}
        for tag in soup.find_all('meta', attrs={'name': re.compile(r'^twitter:')}):
            name = tag.get('name', '').replace('twitter:', '')
            content = tag.get('content', '')
            twitter_tags[name] = content
        return twitter_tags
    
    def _extract_schema_markup(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract JSON-LD schema markup"""
        schemas = []
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                schema_data = json.loads(script.string)
                schemas.append(schema_data)
            except json.JSONDecodeError:
                logger.warning("Invalid JSON-LD schema found")
        return schemas
    
    def _extract_canonical_url(self, soup: BeautifulSoup, current_url: str) -> str:
        """Extract canonical URL"""
        canonical = soup.find('link', rel='canonical')
        if canonical and canonical.get('href'):
            return urljoin(current_url, canonical.get('href'))
        return current_url
    
    def _generate_selectors(self, soup: BeautifulSoup) -> Dict[str, List[str]]:
        """Generate CSS selectors for common elements"""
        selectors = {
            'headers': [],
            'navigation': [],
            'content': [],
            'sidebar': [],
            'footer': []
        }
        
        # Common selectors for different sections
        nav_selectors = ['nav', '.nav', '.navbar', '.navigation', '#nav', '#navigation']
        for selector in nav_selectors:
            elements = soup.select(selector)
            if elements:
                selectors['navigation'].append(selector)
        
        content_selectors = ['main', '.main', '.content', '#content', '.container', '#main']
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                selectors['content'].append(selector)
        
        return selectors
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL format"""
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        return url.rstrip('/')
    
    async def _process_content(self):
        """Post-process scraped content for optimization"""
        # Analyze CSS for theme extraction
        await self._extract_themes_from_css()
        
        # Generate asset manifest
        self._generate_asset_manifest()
        
        # Detect common patterns
        self._detect_layout_patterns()
    
    async def _extract_themes_from_css(self):
        """Extract theme information from CSS"""
        themes = {
            'colors': {},
            'fonts': {},
            'spacing': {},
            'breakpoints': {}
        }
        
        for css_url, css_data in self.scraped_content['styles'].items():
            try:
                sheet = cssutils.parseString(css_data['content'])
                
                for rule in sheet:
                    if rule.type == rule.STYLE_RULE:
                        for prop in rule.style:
                            if 'color' in prop.name:
                                themes['colors'][prop.value] = themes['colors'].get(prop.value, 0) + 1
                            elif 'font-family' in prop.name:
                                themes['fonts'][prop.value] = themes['fonts'].get(prop.value, 0) + 1
                            elif 'margin' in prop.name or 'padding' in prop.name:
                                themes['spacing'][prop.value] = themes['spacing'].get(prop.value, 0) + 1
                            elif 'max-width' in prop.name and 'px' in prop.value:
                                themes['breakpoints'][prop.value] = themes['breakpoints'].get(prop.value, 0) + 1
                                
            except Exception as e:
                logger.error(f"Error parsing CSS from {css_url}: {e}")
        
        self.scraped_content['themes'] = themes
    
    def _generate_asset_manifest(self):
        """Generate manifest of all assets with metadata"""
        manifest = {
            'version': '1.0',
            'generated': datetime.utcnow().isoformat(),
            'assets': {}
        }
        
        for asset_url, asset_data in self.scraped_content['assets'].items():
            manifest['assets'][asset_url] = {
                'type': asset_data['type'],
                'hash': hashlib.md5(asset_url.encode()).hexdigest()[:8]
            }
        
        self.scraped_content['asset_manifest'] = manifest
    
    def _detect_layout_patterns(self):
        """Detect common layout patterns across pages"""
        patterns = {
            'header_patterns': [],
            'navigation_patterns': [],
            'content_patterns': [],
            'footer_patterns': []
        }
        
        # Analyze page structures for common patterns
        for url, page_data in self.scraped_content['pages'].items():
            # This is a simplified pattern detection
            # In practice, you'd use more sophisticated DOM analysis
            structure = page_data.get('structure', {})
            
            # Detect navigation patterns based on link structure
            nav_links = structure.get('links', [])
            if len(nav_links) > 3 and len(nav_links) < 10:
                patterns['navigation_patterns'].append({
                    'page': url,
                    'link_count': len(nav_links),
                    'links': [link['text'] for link in nav_links[:5]]
                })
        
        self.scraped_content['layout_patterns'] = patterns


class MigrationAnalyzer:
    """Analyzes scraped content for migration planning"""
    
    @staticmethod
    def analyze_migration_feasibility(scraped_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze if website is suitable for migration"""
        
        analysis = {
            'feasible': True,
            'complexity': 'medium',
            'warnings': [],
            'recommendations': [],
            'estimated_time': '2-4 hours'
        }
        
        # Check for complex JavaScript frameworks
        js_content = ' '.join([js.get('content', '') for js in scraped_data.get('scripts', {}).values()])
        
        complex_frameworks = ['React', 'Angular', 'Vue', 'Ember']
        for framework in complex_frameworks:
            if framework.lower() in js_content.lower():
                analysis['warnings'].append(f"Detected {framework} - migration complexity increases")
                analysis['complexity'] = 'high'
                analysis['estimated_time'] = '4-8 hours'
        
        # Check page count
        page_count = len(scraped_data.get('pages', {}))
        if page_count > 50:
            analysis['warnings'].append(f"Large site detected ({page_count} pages)")
            analysis['estimated_time'] = '8-16 hours'
        
        # Check for dynamic content
        dynamic_indicators = ['api/', 'ajax', 'fetch(', '$.get', '$.post']
        for indicator in dynamic_indicators:
            if indicator in js_content.lower():
                analysis['warnings'].append("Dynamic content detected - manual review required")
                break
        
        return analysis
    
    @staticmethod
    def generate_migration_report(scraped_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive migration report"""
        
        report = {
            'summary': {
                'total_pages': len(scraped_data.get('pages', {})),
                'total_assets': len(scraped_data.get('assets', {})),
                'total_styles': len(scraped_data.get('styles', {})),
                'total_scripts': len(scraped_data.get('scripts', {}))
            },
            'content_analysis': {
                'pages_by_type': {},
                'common_elements': {},
                'seo_score': 0
            },
            'technical_details': {
                'frameworks': [],
                'libraries': [],
                'compatibility': []
            },
            'migration_plan': {
                'steps': [],
                'timeline': '',
                'risks': []
            }
        }
        
        # Analyze pages by content type
        for url, page_data in scraped_data.get('pages', {}).items():
            page_type = 'content'  # Default
            if 'product' in url.lower():
                page_type = 'product'
            elif 'blog' in url.lower() or 'news' in url.lower():
                page_type = 'blog'
            elif 'contact' in url.lower():
                page_type = 'contact'
            
            report['content_analysis']['pages_by_type'][page_type] = \
                report['content_analysis']['pages_by_type'].get(page_type, 0) + 1
        
        # Generate migration steps
        report['migration_plan']['steps'] = [
            "Setup new template structure",
            "Migrate content and assets",
            "Recreate styling and layout",
            "Implement interactive features",
            "Test and optimize",
            "Deploy and monitor"
        ]
        
        return report