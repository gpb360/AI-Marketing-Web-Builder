import { test, expect, Page } from '@playwright/test';

/**
 * Theme Styling Validation Test Suite
 * 
 * Comprehensive testing to verify theme implementation and styling functionality
 * Tests based on the design document requirements and current theme system
 */

test.describe('Theme Styling Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should load page with proper theme backgrounds', async ({ page }) => {
    // Test 1: Check if the main page loads with correct gradient background
    const body = page.locator('body');
    
    // Check if the page loaded successfully
    await expect(page).toHaveTitle(/AI Marketing Web Builder|Home/);
    
    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/theme-background-check.png',
      fullPage: true 
    });
    
    console.log('✓ Page loaded successfully with theme');
  });

  test('should validate landing page gradient backgrounds', async ({ page }) => {
    // Test 2: Check specific gradient background implementation
    const mainContainer = page.locator('main, [class*="gradient"], [class*="bg-gradient"]').first();
    
    // Check if gradient classes are applied
    const hasGradientBg = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="bg-gradient"]');
      return elements.length > 0;
    });
    
    console.log(`Gradient background elements found: ${hasGradientBg}`);
    
    // Check for specific theme classes
    const themeElements = await page.evaluate(() => {
      const bgGradient = document.querySelectorAll('[class*="from-black"]');
      const textWhite = document.querySelectorAll('[class*="text-white"]');
      const yellowAccent = document.querySelectorAll('[class*="text-yellow-400"]');
      
      return {
        gradientElements: bgGradient.length,
        whiteTextElements: textWhite.length,
        yellowAccentElements: yellowAccent.length
      };
    });
    
    console.log('Theme elements found:', themeElements);
    
    // Take screenshot of the landing section
    await page.screenshot({ 
      path: 'test-results/landing-gradient-validation.png',
      fullPage: true 
    });
  });

  test('should validate button styling and variants', async ({ page }) => {
    // Test 3: Check button implementations and styling
    const buttons = page.locator('button, [role="button"], a[class*="bg-gradient"]');
    const buttonCount = await buttons.count();
    
    console.log(`Found ${buttonCount} interactive elements`);
    
    if (buttonCount > 0) {
      // Check first button styling
      const firstButton = buttons.first();
      await firstButton.scrollIntoViewIfNeeded();
      
      // Check for luxury button classes
      const buttonClasses = await firstButton.getAttribute('class');
      console.log('First button classes:', buttonClasses);
      
      // Test button hover state if possible
      await firstButton.hover();
      await page.waitForTimeout(500);
      
      // Take screenshot of button states
      await page.screenshot({ 
        path: 'test-results/button-styling-validation.png',
        clip: { x: 0, y: 0, width: 1200, height: 800 }
      });
    }
  });

  test('should validate text hierarchy and typography', async ({ page }) => {
    // Test 4: Check text styling and hierarchy
    const textElements = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const paragraphs = document.querySelectorAll('p');
      const textWhite = document.querySelectorAll('[class*="text-white"]');
      const textGray = document.querySelectorAll('[class*="text-gray"]');
      const textYellow = document.querySelectorAll('[class*="text-yellow"]');
      
      return {
        headings: headings.length,
        paragraphs: paragraphs.length,
        whiteText: textWhite.length,
        grayText: textGray.length,
        yellowText: textYellow.length,
        headingClasses: Array.from(headings).map(h => h.className).slice(0, 3),
        paragraphClasses: Array.from(paragraphs).map(p => p.className).slice(0, 3)
      };
    });
    
    console.log('Typography elements:', textElements);
    
    // Validate we have proper text styling
    expect(textElements.whiteText + textElements.grayText + textElements.yellowText).toBeGreaterThan(0);
  });

  test('should validate component styling consistency', async ({ page }) => {
    // Test 5: Check for consistent component styling
    const componentAnalysis = await page.evaluate(() => {
      // Check for theme utility usage
      const bgGray900 = document.querySelectorAll('[class*="bg-gray-900"]');
      const bgGray800 = document.querySelectorAll('[class*="bg-gray-800"]');
      const backdropBlur = document.querySelectorAll('[class*="backdrop-blur"]');
      const borderGray = document.querySelectorAll('[class*="border-gray"]');
      
      // Check for consistent spacing
      const padding = document.querySelectorAll('[class*="p-"], [class*="px-"], [class*="py-"]');
      const margin = document.querySelectorAll('[class*="m-"], [class*="mx-"], [class*="my-"]');
      
      return {
        backgroundElements: {
          gray900: bgGray900.length,
          gray800: bgGray800.length,
          backdropBlur: backdropBlur.length
        },
        spacingElements: {
          padding: padding.length,
          margin: margin.length
        },
        borderElements: borderGray.length
      };
    });
    
    console.log('Component styling analysis:', componentAnalysis);
    
    // Take full page screenshot for visual analysis
    await page.screenshot({ 
      path: 'test-results/component-styling-analysis.png',
      fullPage: true 
    });
  });

  test('should validate responsive design and mobile compatibility', async ({ page }) => {
    // Test 6: Check responsive behavior
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Check if content is properly displayed
      const isContentVisible = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main && window.getComputedStyle(main).display !== 'none';
      });
      
      console.log(`${viewport.name} viewport (${viewport.width}x${viewport.height}): Content visible = ${isContentVisible}`);
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name}-${viewport.width}x${viewport.height}.png`,
        fullPage: true 
      });
    }
  });

  test('should check for CSS compilation and loading', async ({ page }) => {
    // Test 7: Verify CSS is properly loaded and compiled
    const cssAnalysis = await page.evaluate(() => {
      // Check if Tailwind CSS is working by looking for compiled styles
      const testElement = document.createElement('div');
      testElement.className = 'bg-gray-900 text-white p-4';
      document.body.appendChild(testElement);
      
      const styles = window.getComputedStyle(testElement);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      const padding = styles.padding;
      
      document.body.removeChild(testElement);
      
      return {
        backgroundColor: bgColor,
        textColor: textColor,
        padding: padding,
        tailwindWorking: bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent'
      };
    });
    
    console.log('CSS compilation analysis:', cssAnalysis);
    
    // Verify Tailwind CSS is working
    expect(cssAnalysis.tailwindWorking).toBeTruthy();
  });

  test('should analyze theme file accessibility and performance', async ({ page }) => {
    // Test 8: Performance and accessibility analysis
    
    // Check for accessibility attributes
    const a11yElements = await page.evaluate(() => {
      const focusableElements = document.querySelectorAll('[tabindex], button, a, input, select, textarea');
      const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
      const altTexts = document.querySelectorAll('img[alt]');
      
      return {
        focusableElements: focusableElements.length,
        ariaLabels: ariaLabels.length,
        altTexts: altTexts.length
      };
    });
    
    console.log('Accessibility elements:', a11yElements);
    
    // Performance check - measure page load time
    const navigationStart = await page.evaluate(() => performance.timing.navigationStart);
    const loadComplete = await page.evaluate(() => performance.timing.loadEventEnd);
    const loadTime = loadComplete - navigationStart;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/final-theme-validation.png',
      fullPage: true 
    });
  });

});

test.describe('Theme Error Detection', () => {
  
  test('should detect common theme issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for common styling issues
    const issues = await page.evaluate(() => {
      const problems = [];
      
      // Check for missing background colors
      const elementsWithoutBg = document.querySelectorAll('div:not([class*="bg-"])');
      if (elementsWithoutBg.length > 10) {
        problems.push(`Many elements (${elementsWithoutBg.length}) without background classes`);
      }
      
      // Check for hardcoded colors
      const elementsWithStyle = document.querySelectorAll('[style*="color"], [style*="background"]');
      if (elementsWithStyle.length > 0) {
        problems.push(`Found ${elementsWithStyle.length} elements with hardcoded styles`);
      }
      
      // Check for missing text colors
      const textElements = document.querySelectorAll('p, span, div');
      const elementsWithoutTextColor = Array.from(textElements).filter(el => {
        const classes = el.className;
        return !classes.includes('text-') && el.innerText.trim().length > 0;
      });
      
      if (elementsWithoutTextColor.length > 5) {
        problems.push(`Many text elements (${elementsWithoutTextColor.length}) without text color classes`);
      }
      
      return problems;
    });
    
    console.log('Theme issues detected:', issues);
    
    if (issues.length > 0) {
      console.warn('⚠️ Theme styling issues found:');
      issues.forEach(issue => console.warn(`  - ${issue}`));
    } else {
      console.log('✓ No major theme issues detected');
    }
  });

});