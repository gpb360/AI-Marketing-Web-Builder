const { chromium } = require('playwright-core');

async function testLoginFlow() {
  console.log('Starting simple login flow test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate directly to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3003/auth/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log('Login page loaded');
    
    // Check if we're on the login page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (!currentUrl.includes('/auth/login')) {
      console.log('❌ Not on login page, redirecting...');
      await page.goto('http://localhost:3003/auth/login');
      await page.waitForLoadState('networkidle');
    }
    
    // Fill in the login form with the new test user
    console.log('Filling login form...');
    await page.fill('input#email', 'test3@example.com');
    await page.fill('input#password', 'Password123!');
    
    // Submit the form
    console.log('Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or response
    console.log('Waiting for navigation...');
    await page.waitForTimeout(5000);
    
    // Check the result
    const newUrl = page.url();
    console.log('New URL after login attempt:', newUrl);
    
    if (newUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Login redirected to dashboard');
    } else {
      console.log('❌ FAILURE: Login did not redirect to dashboard');
      // Take a screenshot for debugging
      await page.screenshot({ path: 'login-failure.png' });
      console.log('Screenshot saved as login-failure.png');
      
      // Check for error messages
      const errorMessages = await page.locator('.error-message, .text-red-500, [role="alert"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('Error messages found:', errorMessages);
      }
      
      // Check page content
      const pageContent = await page.content();
      console.log('Page content (first 1000 chars):', pageContent.substring(0, 1000));
    }
    
  } catch (error) {
    console.error('Error during login test:', error);
  } finally {
    await browser.close();
  }
}

testLoginFlow();