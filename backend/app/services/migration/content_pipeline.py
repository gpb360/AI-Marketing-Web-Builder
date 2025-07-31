"""
Content Migration Pipeline
Handles HTML/CSS/JS extraction, optimization, and transformation
"""

import re
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
from bs4 import BeautifulSoup, Comment
import cssutils
from cssutils.css import CSSRule
import hashlib
from urllib.parse import urljoin, urlparse
from datetime import datetime

logger = logging.getLogger(__name__)

class ContentOptimizer:
    """Optimizes scraped content for template migration"""
    
    @staticmethod
    def optimize_html(content: str, base_url: str) -> Dict[str, Any]:
        """Optimize HTML content for template use"""
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Remove unnecessary elements
        ContentOptimizer._clean_html(soup)
        
        # Extract semantic structure
        structure = ContentOptimizer._extract_structure(soup)
        
        # Generate component mappings
        components = ContentOptimizer._identify_components(soup)
        
        # Optimize images
        ContentOptimizer._optimize_images(soup, base_url)
        
        # Extract inline styles for migration
        inline_styles = ContentOptimizer._extract_inline_styles(soup)
        
        return {
            'optimized_html': str(soup),
            'structure': structure,
            'components': components,
            'inline_styles': inline_styles,
            'metadata': {
                'word_count': len(soup.get_text(strip=True).split()),
                'image_count': len(soup.find_all('img')),
                'link_count': len(soup.find_all('a')),
                'heading_count': len(soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']))
            }
        }
    
    @staticmethod
    def _clean_html(soup: BeautifulSoup):
        """Remove unnecessary elements from HTML"""
        
        # Remove comments
        comments = soup.find_all(string=lambda text: isinstance(text, Comment))
        for comment in comments:
            comment.extract()
        
        # Remove script tags (keep content for analysis)
        for script in soup.find_all('script'):
            script.decompose()
        
        # Remove style tags
        for style in soup.find_all('style'):
            style.decompose()
        
        # Remove empty elements
        for element in soup.find_all():
            if not element.get_text(strip=True) and not element.find_all():
                if element.name not in ['br', 'hr', 'img']:
                    element.decompose()
    
    @staticmethod
    def _extract_structure(soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract semantic structure"""
        
        structure = {
            'header': None,
            'navigation': [],
            'main_content': None,
            'sidebar': [],
            'footer': None,
            'sections': []
        }
        
        # Find header
        header = soup.find('header') or soup.find(class_=re.compile('header', re.I))
        if header:
            structure['header'] = {
                'content': str(header),
                'text': header.get_text(strip=True),
                'logo': bool(header.find('img')) or bool(header.find(class_=re.compile('logo', re.I)))
            }
        
        # Find navigation
        nav_elements = soup.find_all('nav') + soup.find_all(class_=re.compile('nav|menu', re.I))
        for nav in nav_elements:
            structure['navigation'].append({
                'content': str(nav),
                'links': len(nav.find_all('a')),
                'type': 'horizontal' if len(nav.find_all('li')) > 1 else 'vertical'
            })
        
        # Find main content
        main = soup.find('main') or soup.find(id=re.compile('main|content', re.I)) or soup.find(class_=re.compile('main|content', re.I))
        if main:
            structure['main_content'] = {
                'content': str(main),
                'text': main.get_text(strip=True),
                'sections': len(main.find_all(['section', 'article']))
            }
        
        # Find footer
        footer = soup.find('footer') or soup.find(class_=re.compile('footer', re.I))
        if footer:
            structure['footer'] = {
                'content': str(footer),
                'text': footer.get_text(strip=True),
                'links': len(footer.find_all('a'))
            }
        
        return structure
    
    @staticmethod
    def _identify_components(soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Identify reusable components"""
        
        components = []
        
        # Identify common patterns
        patterns = [
            {'name': 'hero_section', 'selectors': ['.hero', '.banner', '.jumbotron']},
            {'name': 'card', 'selectors': ['.card', '.post', '.item', '.product']},
            {'name': 'button', 'selectors': ['.btn', '.button', 'button']},
            {'name': 'form', 'selectors': ['form', '.form', '.contact-form']},
            {'name': 'feature', 'selectors': ['.feature', '.service', '.benefit']},
            {'name': 'testimonial', 'selectors': ['.testimonial', '.review', '.quote']},
            {'name': 'team_member', 'selectors': ['.team', '.member', '.profile']},
            {'name': 'pricing_table', 'selectors': ['.pricing', '.price', '.plan']}
        ]
        
        for pattern in patterns:
            for selector in pattern['selectors']:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        components.append({
                            'type': pattern['name'],
                            'selector': selector,
                            'content': str(element),
                            'text': element.get_text(strip=True),
                            'classes': element.get('class', [])
                        })
        
        return components
    
    @staticmethod
    def _optimize_images(soup: BeautifulSoup, base_url: str):
        """Optimize images for web use"""
        
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if src and not src.startswith(('http://', 'https://', 'data:')):
                # Convert relative URLs to absolute
                img['src'] = urljoin(base_url, src)
            
            # Add loading attribute for performance
            if not img.get('loading'):
                img['loading'] = 'lazy'
            
            # Ensure alt text
            if not img.get('alt'):
                img['alt'] = 'Image'
    
    @staticmethod
    def _extract_inline_styles(soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract inline styles for migration"""
        
        inline_styles = []
        
        for element in soup.find_all(style=True):
            inline_styles.append({
                'selector': element.name,
                'classes': element.get('class', []),
                'id': element.get('id', ''),
                'styles': element.get('style', '')
            })
        
        return inline_styles

class CSSProcessor:
    """Process and optimize CSS for template migration"""
    
    @staticmethod
    def process_css(css_content: str, base_url: str) -> Dict[str, Any]:
        """Process CSS content for template use"""
        
        try:
            sheet = cssutils.parseString(css_content)
            
            # Extract theme variables
            theme_data = CSSProcessor._extract_theme_variables(sheet)
            
            # Extract responsive breakpoints
            breakpoints = CSSProcessor._extract_breakpoints(sheet)
            
            # Extract component styles
            components = CSSProcessor._extract_component_styles(sheet)
            
            # Optimize CSS
            optimized_css = CSSProcessor._optimize_css(sheet, base_url)
            
            return {
                'theme': theme_data,
                'breakpoints': breakpoints,
                'components': components,
                'optimized_css': optimized_css,
                'metadata': {
                    'rules_count': len(sheet.cssRules),
                    'selectors_count': sum(1 for rule in sheet.cssRules if rule.type == CSSRule.STYLE_RULE),
                    'media_queries': len([r for r in sheet.cssRules if r.type == CSSRule.MEDIA_RULE])
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing CSS: {e}")
            return {
                'theme': {},
                'breakpoints': {},
                'components': {},
                'optimized_css': css_content,
                'error': str(e)
            }
    
    @staticmethod
    def _extract_theme_variables(sheet) -> Dict[str, Any]:
        """Extract theme variables from CSS"""
        
        theme = {
            'colors': {},
            'fonts': {},
            'spacing': {},
            'border_radius': {},
            'shadows': {}
        }
        
        for rule in sheet.cssRules:
            if rule.type == CSSRule.STYLE_RULE:
                for prop in rule.style:
                    # Extract colors
                    if 'color' in prop.name or 'background' in prop.name:
                        value = prop.value.strip()
                        if value and value not in theme['colors']:
                            theme['colors'][value] = {
                                'usage': [prop.name],
                                'selectors': [rule.selectorText]
                            }
                    
                    # Extract fonts
                    elif 'font-family' in prop.name:
                        fonts = prop.value.split(',')
                        for font in fonts:
                            font = font.strip().strip('"\'')
                            if font and font not in theme['fonts']:
                                theme['fonts'][font] = {
                                    'usage': [prop.name],
                                    'selectors': [rule.selectorText]
                                }
                    
                    # Extract spacing
                    elif any(spacing in prop.name for spacing in ['margin', 'padding']):
                        value = prop.value.strip()
                        if value not in theme['spacing']:
                            theme['spacing'][value] = {
                                'property': prop.name,
                                'selectors': [rule.selectorText]
                            }
        
        return theme
    
    @staticmethod
    def _extract_breakpoints(sheet) -> Dict[str, str]:
        """Extract responsive breakpoints"""
        
        breakpoints = {}
        
        for rule in sheet.cssRules:
            if rule.type == CSSRule.MEDIA_RULE:
                media_query = rule.media.mediaText
                # Extract common breakpoint patterns
                if 'max-width' in media_query or 'min-width' in media_query:
                    breakpoints[media_query] = {
                        'rules': len(rule.cssRules),
                        'selectors': [r.selectorText for r in rule.cssRules if hasattr(r, 'selectorText')]
                    }
        
        return breakpoints
    
    @staticmethod
    def _extract_component_styles(sheet) -> Dict[str, Any]:
        """Extract component-specific styles"""
        
        components = {}
        
        # Define component patterns
        component_patterns = {
            'button': [r'\.btn', r'button', r'\.button'],
            'card': [r'\.card', r'\.post', r'\.item'],
            'navigation': [r'\.nav', r'\.navbar', r'\.menu'],
            'form': [r'\.form', r'input', r'\.input'],
            'hero': [r'\.hero', r'\.banner', r'\.jumbotron'],
            'footer': [r'\.footer', r'footer'],
            'header': [r'\.header', r'\.navbar', r'header']
        }
        
        for rule in sheet.cssRules:
            if rule.type == CSSRule.STYLE_RULE:
                selector = rule.selectorText
                
                for component, patterns in component_patterns.items():
                    for pattern in patterns:
                        if re.search(pattern, selector, re.IGNORECASE):
                            if component not in components:
                                components[component] = []
                            
                            styles = {}
                            for prop in rule.style:
                                styles[prop.name] = prop.value
                            
                            components[component].append({
                                'selector': selector,
                                'styles': styles
                            })
        
        return components
    
    @staticmethod
    def _optimize_css(sheet, base_url: str) -> str:
        """Optimize CSS for template use"""
        
        optimized_rules = []
        
        for rule in sheet.cssRules:
            if rule.type == CSSRule.STYLE_RULE:
                # Remove vendor prefixes that are no longer needed
                styles = {}
                for prop in rule.style:
                    if not prop.name.startswith('-webkit-') and not prop.name.startswith('-moz-'):
                        styles[prop.name] = prop.value
                
                # Update URLs in CSS
                updated_styles = CSSProcessor._update_css_urls(styles, base_url)
                
                # Rebuild rule
                rule.style.cssText = '; '.join(f"{k}: {v}" for k, v in updated_styles.items())
                optimized_rules.append(rule.cssText)
            else:
                optimized_rules.append(rule.cssText)
        
        return '\n'.join(optimized_rules)
    
    @staticmethod
    def _update_css_urls(styles: Dict[str, str], base_url: str) -> Dict[str, str]:
        """Update relative URLs in CSS to absolute"""
        
        updated_styles = {}
        
        for prop, value in styles.items():
            if 'url(' in value:
                # Extract and update URLs
                urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', value)
                for url in urls:
                    if not url.startswith(('http://', 'https://', 'data:')):
                        new_url = urljoin(base_url, url)
                        value = value.replace(url, new_url)
            
            updated_styles[prop] = value
        
        return updated_styles

class MigrationPipeline:
    """Main pipeline for content migration"""
    
    def __init__(self):
        self.optimizer = ContentOptimizer()
        self.css_processor = CSSProcessor()
        self.migration_steps = []
        
    async def process_website(self, scraped_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process entire website for migration"""
        
        migration_data = {
            'original_data': scraped_data,
            'processed_pages': {},
            'processed_styles': {},
            'processed_scripts': {},
            'migration_plan': {},
            'recommendations': [],
            'warnings': []
        }
        
        # Process each page
        for url, page_data in scraped_data.get('pages', {}).items():
            try:
                processed_page = await self._process_page(page_data, scraped_data.get('base_url', ''))
                migration_data['processed_pages'][url] = processed_page
            except Exception as e:
                migration_data['warnings'].append(f"Failed to process page {url}: {str(e)}")
        
        # Process CSS
        for css_url, css_data in scraped_data.get('styles', {}).items():
            try:
                processed_css = self.css_processor.process_css(
                    css_data.get('content', ''),
                    scraped_data.get('base_url', '')
                )
                migration_data['processed_styles'][css_url] = processed_css
            except Exception as e:
                migration_data['warnings'].append(f"Failed to process CSS {css_url}: {str(e)}")
        
        # Generate migration plan
        migration_data['migration_plan'] = await self._generate_migration_plan(migration_data)
        
        # Generate recommendations
        migration_data['recommendations'] = await self._generate_recommendations(migration_data)
        
        return migration_data
    
    async def _process_page(self, page_data: Dict[str, Any], base_url: str) -> Dict[str, Any]:
        """Process individual page"""
        
        html_content = page_data.get('content', {}).get('html', '')
        
        if html_content:
            optimized = self.optimizer.optimize_html(html_content, base_url)
            return {
                'original': page_data,
                'optimized': optimized,
                'migration_priority': self._calculate_priority(page_data),
                'estimated_effort': self._estimate_effort(optimized)
            }
        
        return {'error': 'No HTML content found'}
    
    def _calculate_priority(self, page_data: Dict[str, Any]) -> str:
        """Calculate migration priority for page"""
        
        url = page_data.get('url', '')
        title = page_data.get('title', '').lower()
        
        # High priority pages
        if any(keyword in url.lower() or keyword in title for keyword in ['index', 'home', 'landing', 'main']):
            return 'high'
        
        # Medium priority pages
        if any(keyword in url.lower() or keyword in title for keyword in ['about', 'contact', 'services', 'products']):
            return 'medium'
        
        # Low priority pages
        return 'low'
    
    def _estimate_effort(self, optimized_data: Dict[str, Any]) -> str:
        """Estimate migration effort for page"""
        
        metadata = optimized_data.get('metadata', {})
        
        word_count = metadata.get('word_count', 0)
        image_count = metadata.get('image_count', 0)
        component_count = len(optimized_data.get('components', []))
        
        if word_count > 1000 or image_count > 10 or component_count > 10:
            return 'high'
        elif word_count > 500 or image_count > 5 or component_count > 5:
            return 'medium'
        else:
            return 'low'
    
    async def _generate_migration_plan(self, migration_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed migration plan"""
        
        plan = {
            'phases': [
                {
                    'name': 'Setup and Planning',
                    'duration': '30 minutes',
                    'tasks': [
                        'Create new template structure',
                        'Set up development environment',
                        'Review scraped content'
                    ]
                },
                {
                    'name': 'Content Migration',
                    'duration': '2-4 hours',
                    'tasks': [
                        'Migrate high priority pages',
                        'Extract and migrate components',
                        'Optimize images and assets'
                    ]
                },
                {
                    'name': 'Styling and Layout',
                    'duration': '1-2 hours',
                    'tasks': [
                        'Migrate CSS styles',
                        'Implement responsive design',
                        'Apply theme variables'
                    ]
                },
                {
                    'name': 'Testing and Deployment',
                    'duration': '1 hour',
                    'tasks': [
                        'Test across devices',
                        'SEO optimization',
                        'Deploy to production'
                    ]
                }
            ],
            'total_estimated_time': '4.5-8.5 hours',
            'risk_level': 'medium'
        }
        
        return plan
    
    async def _generate_recommendations(self, migration_data: Dict[str, Any]) -> List[str]:
        """Generate migration recommendations"""
        
        recommendations = []
        
        # Analyze theme
        themes = []
        for css_data in migration_data.get('processed_styles', {}).values():
            theme = css_data.get('theme', {})
            if theme.get('colors'):
                themes.append(theme)
        
        if themes:
            recommendations.append("Extract common color scheme for consistent branding")
        
        # Analyze components
        components = []
        for page_data in migration_data.get('processed_pages', {}).values():
            page_components = page_data.get('optimized', {}).get('components', [])
            components.extend(page_components)
        
        if components:
            recommendations.append("Create reusable component library based on extracted patterns")
        
        # Analyze images
        image_count = 0
        for page_data in migration_data.get('processed_pages', {}).values():
            metadata = page_data.get('optimized', {}).get('metadata', {})
            image_count += metadata.get('image_count', 0)
        
        if image_count > 20:
            recommendations.append("Consider implementing image optimization and lazy loading")
        
        # General recommendations
        recommendations.extend([
            "Test migrated site on multiple devices and browsers",
            "Set up proper redirects to maintain SEO rankings",
            "Monitor site performance after migration",
            "Create backup plan for rollback if issues occur"
        ])
        
        return recommendations