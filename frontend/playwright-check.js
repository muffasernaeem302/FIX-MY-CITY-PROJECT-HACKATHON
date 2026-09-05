const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const filePath = path.join(process.cwd(), 'tmp-report.png');
  fs.writeFileSync(filePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAFc0jzMAAAAC0lEQVR42mP8z8AARQAB6wN4wgAAAABJRU5ErkJggg==', 'base64'));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.click('text=How it works');
  await page.waitForSelector('text=From citizen photo to verified repair.');
  console.log('HOW_IT_WORKS_OK');

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.click('text=Impact');
  await page.waitForSelector('text=Prioritized by risk, not just volume.');
  console.log('IMPACT_OK');

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.click('text=Demo');
  await page.waitForSelector('text=A fast report flow built for public trust.');
  console.log('DEMO_OK');

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'citizen@example.com');
  await page.fill('input[type="password"]', 'Password123');
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/dashboard');
  console.log('LOGIN_OK');

  await page.click('text=Report new issue');
  await page.waitForSelector('text=Report an issue');
  await page.selectOption('select', 'BROKEN_STREETLIGHT');
  await page.fill('input[placeholder="Brief summary"]', 'Broken streetlight at Main and 2nd');
  await page.fill('textarea[placeholder*="Describe the issue"]', 'The streetlight near the intersection is flickering and has been out for three nights.');
  await page.fill('input[placeholder="e.g. 40.7128"]', '40.7128');
  await page.fill('input[placeholder="e.g. -74.0060"]', '-74.0060');
  await page.setInputFiles('input[type="file"]', filePath);
  await page.click('button:has-text("Submit report")');
  await page.waitForSelector('text=AI analysis');
  console.log('REPORT_OK');
  const text = await page.textContent('body');
  console.log('HAS_RISK', /Risk score/.test(text));
  console.log('HAS_PRIORITY', /Priority/.test(text));
  console.log('HAS_REPORT_ID', /#/.test(text));

  await page.click('text=Back to dashboard');
  await page.waitForSelector('text=My Dashboard');
  const dashText = await page.textContent('body');
  console.log('DASHBOARD_VISIBLE', /Broken streetlight at Main and 2nd/.test(dashText));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobile.click('text=Report an issue');
  await mobile.waitForSelector('text=Report an issue');
  console.log('MOBILE_PAGE_OK');

  await page.close();
  await mobile.close();
  await browser.close();
})();
