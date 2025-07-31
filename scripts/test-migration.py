#!/usr/bin/env python3
"""
Test script for template migration system
"""

import asyncio
import sys
import os
sys.path.append('/mnt/d/s7s-projects/AI-Marketing-Web-Builder/backend')

from app.services.migration import WebsiteScraper, MigrationAnalyzer, MigrationPipeline
from app.services.migration.seo_preservation import SEOPreserver
from app.services.migration.rollback_system import RollbackManager

async def test_migration():
    """Test the complete migration pipeline"""
    
    print("🚀 Starting Template Migration System Test")
    print("=" * 50)
    
    # Test URLs (use safe test sites)
    test_urls = [
        "https://httpbin.org/html",  # Safe test site with HTML
        "https://example.com",       # Simple example site
    ]
    
    for url in test_urls:
        print(f"\n📊 Testing migration for: {url}")
        
        try:
            # Test scraping
            print("🔍 Testing website scraping...")
            async with WebsiteScraper() as scraper:
                scraped_data = await scraper.scrape_website(url, depth=1)
                
                if scraped_data.get('pages'):
                    print(f"   ✅ Scraped {len(scraped_data['pages'])} pages")
                    print(f"   ✅ Found {len(scraped_data.get('assets', {}))} assets")
                    print(f"   ✅ Found {len(scraped_data.get('styles', {}))} styles")
                else:
                    print("   ⚠️  No pages found")
                    continue
            
            # Test analysis
            print("🧪 Testing migration analysis...")
            analyzer = MigrationAnalyzer()
            analysis = analyzer.analyze_migration_feasibility(scraped_data)
            print(f"   ✅ Migration complexity: {analysis['complexity']}")
            print(f"   ✅ Estimated time: {analysis['estimated_time']}")
            
            # Test pipeline
            print("⚙️  Testing content pipeline...")
            pipeline = MigrationPipeline()
            processed_data = await pipeline.process_website(scraped_data)
            
            if processed_data.get('processed_pages'):
                print(f"   ✅ Processed {len(processed_data['processed_pages'])} pages")
                print(f"   ✅ Generated migration plan")
                print(f"   ✅ Generated {len(processed_data['recommendations'])} recommendations")
            
            # Test SEO preservation
            print("🔍 Testing SEO preservation...")
            seo_preserver = SEOPreserver()
            seo_data = seo_preserver.extract_seo_data(scraped_data)
            
            print(f"   ✅ Extracted SEO data for {len(seo_data['meta_tags'])} pages")
            print(f"   ✅ Generated {len(seo_data['redirect_mapping'])} redirects")
            
            robots_txt = seo_preserver.generate_robots_txt(scraped_data)
            sitemap_xml = seo_preserver.generate_sitemap_xml(scraped_data)
            
            print(f"   ✅ Generated robots.txt ({len(robots_txt)} chars)")
            print(f"   ✅ Generated sitemap.xml ({len(sitemap_xml)} chars)")
            
            # Test rollback system
            print("🔄 Testing rollback system...")
            rollback_manager = RollbackManager()
            
            # Create test rollback points
            migration_id = f"test_{url.split('//')[1].replace('/', '_')}"
            
            rollback_manager.create_rollback_point(
                migration_id, "initial", {"test": "data"}
            )
            
            status = rollback_manager.get_migration_status(migration_id)
            print(f"   ✅ Created rollback system with {status['rollback_points']} points")
            
            print(f"\n✅ Migration test completed successfully for {url}")
            
        except Exception as e:
            print(f"   ❌ Error testing {url}: {e}")
            continue
    
    print("\n🎉 All migration tests completed!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Install new dependencies: pip install beautifulsoup4 cssutils lxml")
    print("2. Start the backend server: python run.py")
    print("3. Test the frontend: npm run dev")
    print("4. Access migration dashboard at: /migration")

if __name__ == "__main__":
    asyncio.run(test_migration())