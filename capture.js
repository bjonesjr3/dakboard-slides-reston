const { chromium } = require('playwright');
const fs = require('fs');

// Replace these with your actual Canva view/embed links:
const slides = [
  { name: 'lighthouse.png', url: 'https://www.canva.com/design/DAHSvid9_mo/poez2AtuAhGiU_Ny_-LrjA/view' },
  { name: 'basictraining.png', url: 'https://www.canva.com/design/DAHSvuFPbDs/oVs89StvLVF23ZaybyrNxA/view' },
  { name: 'baptism.png', url: 'https://www.canva.com/design/DAHSviPMZHE/FTie-c6Ki8PzU0upfbS6uQ/view' },
  { name: 'csm.png', url: 'https://www.canva.com/design/DAHSvsI0uPk/zkoSJbEFhD9vuw2OS6beHg/view' },
  { name: 'socials.png', url: 'https://www.canva.com/design/DAHSvjHD4uA/LRXZxkzwArA4OxVMbh0eIQ/view' },
  { name: 'lightteam.png', url: 'https://www.canva.com/design/DAHSvsDsnzg/JY37QsbNkiXzqTGoydsDqg/view' },
  { name: 'events.png', url: 'https://www.canva.com/design/DAHSvsV38wM/UlDeX6Q-BAOYqUOxVVNwyQ/view' }
];

(async () => {
  if (!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
  }

  // Launch Chromium with full 1080p resolution
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  for (const slide of slides) {
    console.log(`Rendering ${slide.name}...`);
    const page = await context.newPage();
    
    // Wait until Canva finishes network rendering
    await page.goto(slide.url, { waitUntil: 'networkidle' });
    
    // Optional delay to allow dynamic Canva animations to settle
    await page.waitForTimeout(3000);

    // === NEW CODE: Strip away the Canva UI before taking the screenshot ===
    await page.evaluate(() => {
      // Remove top header and bottom footer areas
      document.querySelectorAll('header, footer').forEach(el => el.remove());
      
      // Remove all clickable buttons like Share, Zoom, and Page navigation arrows
      document.querySelectorAll('button').forEach(el => el.remove());
      
      // Remove Canva logos and watermark links
      document.querySelectorAll('a[href*="canva.com"]').forEach(el => el.remove());
    });
    // =====================================================================

    // Save screenshot directly over existing file
    await page.screenshot({ path: `./images/${slide.name}` });
    await page.close();
  }

  await browser.close();
  console.log('All slides captured.');
})();
