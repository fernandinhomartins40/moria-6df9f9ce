/**
 * Script para gerar screenshots PWA usando sharp
 * Cria screenshots narrow (540x720) e wide (1280x720) para manifests
 */

const sharp = require('sharp');
const path = require('path');

// Função para criar screenshot com texto e cor
async function createScreenshot(config) {
  const { width, height, text, color, gradient, outputPath } = config;

  // Criar gradiente ou cor sólida como base
  const svgBackground = gradient ? `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
        ${text}
      </text>
    </svg>
  ` : `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
        ${text}
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svgBackground))
    .png()
    .toFile(outputPath);
}

async function generateAllScreenshots() {
  console.log('📸 Gerando screenshots PWA...\n');

  // Customer PWA (Verde)
  const customerPath = path.join(__dirname, 'apps', 'customer-pwa', 'public', 'screenshots');

  console.log('📱 Customer PWA (Verde):');

  // Narrow (mobile) 540x720
  await createScreenshot({
    width: 540,
    height: 720,
    text: 'Moria Cliente',
    gradient: ['#10b981', '#059669'],
    outputPath: path.join(customerPath, 'narrow-1.png')
  });
  console.log('  ✅ narrow-1.png (540x720)');

  // Wide (desktop/tablet) 1280x720
  await createScreenshot({
    width: 1280,
    height: 720,
    text: 'Moria - Área do Cliente',
    gradient: ['#10b981', '#059669'],
    outputPath: path.join(customerPath, 'wide-1.png')
  });
  console.log('  ✅ wide-1.png (1280x720)\n');

  // Admin PWA (Gradiente Laranja-Azul)
  const adminPath = path.join(__dirname, 'apps', 'admin-pwa', 'public', 'screenshots');

  console.log('🛡️  Admin PWA (Laranja-Azul):');

  // Narrow (mobile) 540x720
  await createScreenshot({
    width: 540,
    height: 720,
    text: 'Moria Admin',
    gradient: ['#f97316', '#2563eb'],
    outputPath: path.join(adminPath, 'narrow-1.png')
  });
  console.log('  ✅ narrow-1.png (540x720)');

  // Wide (desktop/tablet) 1280x720
  await createScreenshot({
    width: 1280,
    height: 720,
    text: 'Moria - Painel Administrativo',
    gradient: ['#f97316', '#2563eb'],
    outputPath: path.join(adminPath, 'wide-1.png')
  });
  console.log('  ✅ wide-1.png (1280x720)\n');

  console.log('🎉 Screenshots gerados com sucesso!');
  console.log('\n📋 Próximo passo:');
  console.log('  Adicionar screenshots aos manifests (manifest.json)');
  console.log('\n💡 Formato necessário:');
  console.log('  "screenshots": [');
  console.log('    { "src": "/screenshots/narrow-1.png", "sizes": "540x720", "type": "image/png", "form_factor": "narrow" },');
  console.log('    { "src": "/screenshots/wide-1.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" }');
  console.log('  ]');
}

// Criar diretórios se não existirem
const fs = require('fs');
const customerScreenshotsDir = path.join(__dirname, 'apps', 'customer-pwa', 'public', 'screenshots');
const adminScreenshotsDir = path.join(__dirname, 'apps', 'admin-pwa', 'public', 'screenshots');

if (!fs.existsSync(customerScreenshotsDir)) {
  fs.mkdirSync(customerScreenshotsDir, { recursive: true });
}
if (!fs.existsSync(adminScreenshotsDir)) {
  fs.mkdirSync(adminScreenshotsDir, { recursive: true });
}

generateAllScreenshots().catch(console.error);
