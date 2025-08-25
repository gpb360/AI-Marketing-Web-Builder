const { chromium } = require('playwright');

async function testLoginFlow() {
  console.log('Starting login flow test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3003/auth/login');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Fill in login credentials
    console.log('Filling login form...');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123');
    
    // Submit the form
    console.log('Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or response
    console.log('Waiting for navigation...');
    await page.waitForTimeout(5000); // Wait 5 seconds
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we're on the dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Login redirected to dashboard');
    } else {
      console.log('❌ FAILURE: Login did not redirect to dashboard');
      console.log('Page content:', await page.content());
    }
    
  } catch (error) {
    console.error('Error during login test:', error);
  } finally {
    await browser.close();
  }
}

testLoginFlow();