import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routes = [
  '/',
  '/landing',
  '/onboarding',
  '/onboarding?plan=basic',
  '/onboarding?plan=pro',
  '/onboarding?plan=free'
];

async function prerender() {
  // Start a local server to serve the built files
  const app = express();
  const distDir = resolve(__dirname, 'dist');
  app.use(express.static(distDir));
  
  // Start server
  const server = app.listen(5173);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Use the same dist directory that Vite uses
  
  for (const route of routes) {
    console.log(`Pre-rendering: ${route}`);
    
    // Load the page
    await page.goto(`http://localhost:5173${route}`, {
      waitUntil: 'networkidle0'
    });
    
    // Get the HTML content
    const html = await page.content();
    
    // Determine the output path
    let outputPath = resolve(distDir, route === '/' ? 'index.html' : `${route.slice(1)}/index.html`);
    if (route.includes('?')) {
      // Handle routes with query parameters
      const [basePath, params] = route.split('?');
      outputPath = resolve(__dirname, 'dist', `${basePath.slice(1)}-${params}/index.html`);
    }
    
    // Ensure the directory exists
    await fs.ensureDir(dirname(outputPath));
    
    // Write the pre-rendered HTML
    await fs.writeFile(outputPath, html);
    
    console.log(`Pre-rendered: ${outputPath}`);
  }
  
  await browser.close();
  // Close the server
  server.close();
}

prerender().catch(console.error);
