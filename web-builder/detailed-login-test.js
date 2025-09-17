const { chromium } = require('playwright-core');

async function detailedLoginTest() {
  console.log('Starting detailed login flow test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Enable console logging
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error));
    
    // Navigate directly to login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log('Login page loaded');
    
    // Check if we're on the login page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
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
    
    // Check cookies to see if auth token was set
    const cookies = await context.cookies();
    console.log('All cookies:', cookies);
    
    const authCookies = cookies.filter(cookie => cookie.name === 'auth_token');
    console.log('Auth cookies:', authCookies);
    
    if (authCookies.length > 0) {
      console.log('✅ Auth token found in cookies');
    } else {
      console.log('❌ No auth token found in cookies');
    }
    
    // Check for error messages
    const errorMessages = await page.locator('.error-message, .text-red-500, [role="alert"]').allTextContents();
    if (errorMessages.length > 0) {
      console.log('Error messages found:', errorMessages);
    }
    
    // Check page content
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    
    if (newUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Login redirected to dashboard');
    } else if (newUrl.includes('returnUrl=%2Fdashboard')) {
      console.log('⚠️  Login successful but redirect failed - token might be set but redirect not working');
    } else {
      console.log('❌ FAILURE: Login did not redirect properly');
      // Take a screenshot for debugging
      await page.screenshot({ path: 'detailed-login-failure.png' });
      console.log('Screenshot saved as detailed-login-failure.png');
    }
    
  } catch (error) {
    console.error('Error during login test:', error);
  } finally {
    await browser.close();
  }
}

detailedLoginTest();