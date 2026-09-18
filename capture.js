const { chromium } = require('playwright');
const fs = require('fs');

// Your exact Canva links
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

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  for (const slide of slides) {
    console.log(`Rendering ${slide.name}...`);
    const page = await context.newPage();
    
    // Automatically upgrade the URL to Canva's clean embed mode
    const embedUrl = slide.url.includes('?embed') ? slide.url : slide.url + '?embed';
    
    await page.goto(embedUrl, { waitUntil: 'networkidle' });
    
    // Give Canva's canvas time to render fully
    await page.waitForTimeout(3000);

    // Inject a permanent CSS style to force all Canva links, buttons, and footers to be completely invisible
    await page.addStyleTag({ content: `
      a, button, [class*="footer"], [class*="overlay"], [class*="toolbar"] { 
        display: none !important; 
        opacity: 0 !important; 
        visibility: hidden !important; 
      }
    `});

    // Move the virtual mouse off-screen to trigger Canva's auto-hide feature just in case
    await page.mouse.move(0, 0);
    await page.waitForTimeout(1000);

    // Capture the clean screenshot
    await page.screenshot({ path: `./images/${slide.name}` });
    await page.close();
  }

  await browser.close();
  console.log('All slides captured cleanly.');
})();
