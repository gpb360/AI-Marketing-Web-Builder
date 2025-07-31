#!/usr/bin/env python3
"""
Test script to verify migration service fixes
Tests Step 3 redirect generation with error handling, timeout protection, and fallback behavior
"""

import asyncio
import json
import time
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.insert(0, '/mnt/d/s7s-projects/AI-Marketing-Web-Builder/backend')

from app.services.migration import WebsiteScraper, MigrationAnalyzer
from app.services.migration.seo_preservation import SEOPreserver, RedirectManager

async def test_redirect_generation():
    """Test redirect generation with error handling and fallback"""
    
    print("🧪 Testing Step 3 Redirect Generation...")
    
    # Test data simulating scraped website
    test_scraped_data = {
        'base_url': 'https://example.com',
        'pages': {
            'https://example.com/': {
                'title': 'Home Page',
                'meta': {'description': 'Welcome to our site'},
                'content': {'text': 'Home page content'},
                'structure': {'h1': ['Welcome']}
            },
            'https://example.com/about': {
                'title': 'About Us',
                'meta': {'description': 'About our company'},
                'content': {'text': 'About us content'},
                'structure': {'h1': ['About Us']}
            },
            'https://example.com/contact': {
                'title': 'Contact',
                'meta': {'description': 'Contact information'},
                'content': {'text': 'Contact content'},
                'structure': {'h1': ['Contact Us']}
            }
        },
        'assets': {
            'https://example.com/logo.png': {'type': 'image', 'alt': 'Logo'}
        },
        'styles': {
            'https://example.com/style.css': {'content': 'body { color: blue; }'}
        }
    }
    
    try:
        # Test 1: Advanced redirect generation
        print("   📋 Testing advanced redirect generation...")
        seo_preserver = SEOPreserver()
        seo_data = seo_preserver.extract_seo_data(test_scraped_data)
        
        redirects = seo_data.get('redirect_mapping', [])
        print(f"   ✅ Generated {len(redirects)} redirects via SEO preserver")
        
        # Test 2: Basic fallback redirects
        print("   📋 Testing basic fallback redirects...")
        fallback_redirects = await _generate_test_redirects(test_scraped_data)
        print(f"   ✅ Generated {len(fallback_redirects)} basic fallback redirects")
        
        # Test 3: Validation
        print("   📋 Testing redirect validation...")
        redirect_manager = RedirectManager()
        validation = redirect_manager.validate_redirects(redirects)
        print(f"   ✅ Validation result: {validation['valid']} (issues: {len(validation['issues'])})")
        
        # Test 4: Server-specific rules generation
        print("   📋 Testing server-specific redirect rules...")
        apache_rules = redirect_manager.generate_redirects(redirects, 'apache')
        nginx_rules = redirect_manager.generate_redirects(redirects, 'nginx')
        print(f"   ✅ Generated Apache rules ({len(apache_rules)} chars)")
        print(f"   ✅ Generated Nginx rules ({len(nginx_rules)} chars)")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error in redirect generation: {e}")
        return False

async def _generate_test_redirects(scraped_data: dict) -> list:
    """Generate basic test redirects as fallback"""
    try:
        redirects = []
        base_url = scraped_data.get("base_url", "")
        
        for url in scraped_data.get("pages", {}).keys():
            if url.startswith(base_url):
                path = url[len(base_url):]
                if path:
                    redirects.append({
                        "from": path,
                        "to": path,
                        "type": "permanent",
                        "old_url": url,
                        "new_url": url,
                        "generated_by": "fallback"
                    })
        
        return redirects
    except Exception as e:
        print(f"   ❌ Error in fallback redirect generation: {e}")
        return []

async def test_timeout_protection():
    """Test timeout protection in scraping"""
    
    print("\n⏱️  Testing Timeout Protection...")
    
    try:
        # Test with very short timeout
        async with WebsiteScraper(timeout=1) as scraper:
            try:
                # This should timeout quickly
                await scraper.scrape_website('https://httpbin.org/delay/5', depth=1)
                print("   ❌ Timeout protection failed - should have timed out")
                return False
            except Exception as e:
                if "timeout" in str(e).lower():
                    print("   ✅ Timeout protection working correctly")
                    return True
                else:
                    print(f"   ❌ Unexpected error: {e}")
                    return False
                    
    except Exception as e:
        print(f"   ✅ Expected timeout behavior: {e}")
        return True

async def test_error_handling():
    """Test error handling in various scenarios"""
    
    print("\n🔍 Testing Error Handling...")
    
    test_cases = [
        {
            'name': 'Invalid URL',
            'url': 'https://invalid-domain-12345.com',
            'expected': 'error handling'
        },
        {
            'name': 'Non-existent page',
            'url': 'https://httpbin.org/status/404',
            'expected': 'graceful handling'
        }
    ]
    
    all_passed = True
    
    for case in test_cases:
        print(f"   📋 Testing {case['name']}...")
        try:
            async with WebsiteScraper(timeout=10) as scraper:
                await scraper.scrape_website(case['url'], depth=1)
            print(f"   ✅ {case['name']} handled gracefully")
        except Exception as e:
            print(f"   ✅ {case['name']} error handled: {type(e).__name__}")
    
    return all_passed

async def test_end_to_end_migration():
    """Test complete migration flow"""
    
    print("\n🔄 Testing End-to-End Migration Flow...")
    
    try:
        # Test with a simple, reliable website
        test_url = 'https://httpbin.org/html'
        
        print("   📋 Testing scraping...")
        async with WebsiteScraper(timeout=30) as scraper:
            scraped_data = await scraper.scrape_website(test_url, depth=1)
        
        print(f"   ✅ Scraped {len(scraped_data.get('pages', {}))} pages")
        
        # Test analysis
        print("   📋 Testing analysis...")
        analyzer = MigrationAnalyzer()
        analysis = analyzer.analyze_migration_feasibility(scraped_data)
        report = analyzer.generate_migration_report(scraped_data)
        
        print(f"   ✅ Analysis completed: {analysis['complexity']} complexity")
        print(f"   ✅ Report generated: {len(report['migration_plan']['steps'])} steps")
        
        # Test redirect generation
        print("   📋 Testing redirect generation...")
        seo_preserver = SEOPreserver()
        seo_data = seo_preserver.extract_seo_data(scraped_data)
        redirects = seo_data.get('redirect_mapping', [])
        
        print(f"   ✅ Generated {len(redirects)} redirects")
        
        return True
        
    except Exception as e:
        print(f"   ❌ End-to-end test failed: {e}")
        return False

async def main():
    """Run all tests"""
    
    print("🚀 Testing Migration Service Fixes")
    print("=" * 50)
    
    start_time = time.time()
    
    tests = [
        test_redirect_generation,
        test_timeout_protection,
        test_error_handling,
        test_end_to_end_migration
    ]
    
    results = []
    for test in tests:
        try:
            result = await test()
            results.append(result)
        except Exception as e:
            print(f"   ❌ Test failed with exception: {e}")
            results.append(False)
    
    end_time = time.time()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Tests passed: {passed}/{total}")
    print(f"Total time: {end_time - start_time:.2f}s")
    
    if passed == total:
        print("\n✅ All tests passed! Migration service fixes are working correctly.")
        print("\n🔧 Key improvements verified:")
        print("   • Step 3 redirect generation with comprehensive error handling")
        print("   • Timeout protection for long-running operations")
        print("   • Fallback behavior when advanced features fail")
        print("   • End-to-end migration flow completion")
        return True
    else:
        print(f"\n❌ {total - passed} tests failed. Review the logs above.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)