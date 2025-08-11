import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Verificar variables de entorno requeridas
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

// Inicializar cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Rutas estáticas base
const staticRoutes = [
  '/',
  '/landing',
  //'/onboarding',
  //'/onboarding?plan=basic',
  //'/onboarding?plan=pro',
  //'/onboarding?plan=free'
];

// Función para obtener rutas dinámicas basadas en datos de Supabase
async function getDynamicRoutes() {
  const routes = [...staticRoutes];

  try {
    // Obtener todos los servicios activos
    const { data: services } = await supabase
      .from('services')
      .select('id, slug')
      .eq('is_active', true);

    // Obtener todos los profesionales activos
    const { data: professionals } = await supabase
      .from('professionals')
      .select('id, slug')
      .eq('is_active', true);

    // Agregar rutas de servicios
    if (services) {
      services.forEach(service => {
        routes.push(`/services/${service.slug}`);
      });
    }

    // Agregar rutas de profesionales
    if (professionals) {
      professionals.forEach(professional => {
        routes.push(`/professionals/${professional.slug}`);
      });
    }

    return routes;
  } catch (error) {
    console.error('Error fetching dynamic routes:', error);
    return staticRoutes; // Fallback a rutas estáticas si hay error
  }
}

async function prerender() {
  console.log('Iniciando proceso de prerender...');
  
  // Obtener todas las rutas (estáticas + dinámicas)
  const routes = await getDynamicRoutes();
  console.log('Rutas a procesar:', routes);
  // Start a local server to serve the built files
  console.log('Iniciando servidor local...');
  const app = express();
  const distDir = resolve(__dirname, 'dist');
  app.use(express.static(distDir));
  console.log('Directorio de distribución:', distDir);
  
  // Start server
  const server = app.listen(5173);

  console.log('Iniciando navegador...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Use the same dist directory that Vite uses
  
  for (const route of routes) {
    console.log(`Pre-rendering: ${route}`);
    
    // Load the page
    await page.goto(`http://localhost:5173${route}`, {
      waitUntil: 'networkidle0'
    });
    
    console.log(`Esperando carga de datos para ruta: ${route}`);
    
    try {
      // Esperar a que el contenedor principal esté presente
      await page.waitForSelector('#root', { timeout: 50000 });
      
      // Esperar a que desaparezca el estado de carga
      await page.waitForFunction(
        () => {
          const app = document.querySelector('#root');
          const hasContent = app && app.innerHTML.length > 0;
          const isLoading = app && (app.innerHTML.includes('Loading...') || app.innerHTML.includes('Cargando...'));
          console.log('Estado de carga:', { hasContent, isLoading });
          return hasContent && !isLoading;
        },
        { timeout: 50000, polling: 100 }
      );
    } catch (error) {
      console.warn(`Tiempo de espera excedido para ruta ${route}, continuando con el contenido actual...`);
    }

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
