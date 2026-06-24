const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('file:///sessions/nice-compassionate-hypatia/mnt/outputs/finsight/demo-tour.html');
  // skip straight to the final state
  await page.evaluate(() => { window.__tourJumpToEnd && window.__tourJumpToEnd(); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/full.png' });
  const el = await page.$('.charts-row');
  if (el) await el.screenshot({ path: '/tmp/charts.png' });
  await browser.close();
})();
