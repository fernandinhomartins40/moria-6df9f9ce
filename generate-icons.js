/**
 * Script para gerar ícones PWA em múltiplos tamanhos
 * Usa canvas para renderizar SVG em PNG
 */

const fs = require('fs');
const path = require('path');

// SVG do Customer (Verde - Âncora)
const customerSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradiente verde -->
  <defs>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background com bordas arredondadas -->
  <rect width="512" height="512" rx="100" fill="url(#greenGrad)"/>

  <!-- Âncora (ícone central) -->
  <g transform="translate(256, 256)">
    <!-- Círculo superior da âncora -->
    <circle cx="0" cy="-80" r="30" fill="white" stroke="white" stroke-width="8"/>

    <!-- Haste vertical -->
    <rect x="-8" y="-50" width="16" height="180" fill="white" rx="8"/>

    <!-- Barra horizontal -->
    <rect x="-90" y="-10" width="180" height="16" fill="white" rx="8"/>

    <!-- Gancho esquerdo -->
    <path d="M -80 130 Q -120 130 -120 90 Q -120 50 -80 50"
          fill="none" stroke="white" stroke-width="16" stroke-linecap="round"/>

    <!-- Gancho direito -->
    <path d="M 80 130 Q 120 130 120 90 Q 120 50 80 50"
          fill="none" stroke="white" stroke-width="16" stroke-linecap="round"/>
  </g>
</svg>`;

// SVG do Admin (Gradiente Laranja-Azul - Escudo)
const adminSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradiente laranja-azul -->
  <defs>
    <linearGradient id="orangeBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background com bordas arredondadas -->
  <rect width="512" height="512" rx="100" fill="url(#orangeBlueGrad)"/>

  <!-- Escudo (ícone central) -->
  <g transform="translate(256, 256)">
    <!-- Corpo do escudo -->
    <path d="M 0 -140
             L 100 -100
             L 100 20
             Q 100 80 50 120
             Q 0 160 0 160
             Q 0 160 -50 120
             Q -100 80 -100 20
             L -100 -100
             Z"
          fill="white" stroke="white" stroke-width="4"/>

    <!-- Marca de verificação (checkmark) -->
    <path d="M -40 0 L -10 40 L 60 -40"
          fill="none" stroke="url(#orangeBlueGrad)" stroke-width="20"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

// Salvar SVGs
const customerPath = path.join(__dirname, 'apps', 'customer-pwa', 'public', 'icons');
const adminPath = path.join(__dirname, 'apps', 'admin-pwa', 'public', 'icons');

fs.writeFileSync(path.join(customerPath, 'icon.svg'), customerSVG);
fs.writeFileSync(path.join(adminPath, 'icon.svg'), adminSVG);

console.log('✅ SVG icons created successfully!');
console.log('📁 Customer PWA: apps/customer-pwa/public/icons/icon.svg');
console.log('📁 Admin PWA: apps/admin-pwa/public/icons/icon.svg');
console.log('\n📝 Para gerar PNGs, você pode:');
console.log('1. Usar ferramentas online como: https://cloudconvert.com/svg-to-png');
console.log('2. Usar ImageMagick: convert -background none icon.svg -resize 192x192 customer-192.png');
console.log('3. Usar sharp (npm): instalar sharp e converter programaticamente');
console.log('\n🎯 Tamanhos necessários:');
console.log('- 192x192 (Android/Chrome)');
console.log('- 512x512 (Android/Chrome splash)');
console.log('- 180x180 (Apple touch icon)');
console.log('- 96x96 (Shortcuts)');
console.log('- 32x32 (Favicon)');
