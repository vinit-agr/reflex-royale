const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'game-screenshot.png' });
  console.log('Screenshot saved to game-screenshot.png');
  await browser.close();
})();
