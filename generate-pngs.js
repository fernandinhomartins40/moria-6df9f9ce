/**
 * Script para converter SVGs em PNGs de múltiplos tamanhos
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'favicon': 32,
  'apple-touch-icon': 180,
  'shortcut': 96,
  'manifest-192': 192,
  'manifest-512': 512,
};

async function generateIcons() {
  console.log('🎨 Gerando ícones PNG...\n');

  // Customer PWA (Verde)
  const customerSvgPath = path.join(__dirname, 'apps', 'customer-pwa', 'public', 'icons', 'icon.svg');
  const customerIconsPath = path.join(__dirname, 'apps', 'customer-pwa', 'public', 'icons');

  console.log('📱 Customer PWA (Verde):');
  for (const [name, size] of Object.entries(sizes)) {
    const outputPath = path.join(customerIconsPath, `customer-${size}.png`);

    await sharp(customerSvgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  ✅ ${size}x${size} → customer-${size}.png`);
  }

  // Criar aliases para nomes padrão
  await sharp(customerSvgPath).resize(192, 192).png().toFile(path.join(customerIconsPath, 'customer-192.png'));
  await sharp(customerSvgPath).resize(512, 512).png().toFile(path.join(customerIconsPath, 'customer-512.png'));
  await sharp(customerSvgPath).resize(180, 180).png().toFile(path.join(customerIconsPath, 'apple-touch-icon.png'));
  await sharp(customerSvgPath).resize(32, 32).png().toFile(path.join(customerIconsPath, 'favicon.png'));

  console.log('  ✅ Aliases criados (customer-192.png, customer-512.png, apple-touch-icon.png, favicon.png)\n');

  // Admin PWA (Laranja-Azul)
  const adminSvgPath = path.join(__dirname, 'apps', 'admin-pwa', 'public', 'icons', 'icon.svg');
  const adminIconsPath = path.join(__dirname, 'apps', 'admin-pwa', 'public', 'icons');

  console.log('🛡️  Admin PWA (Laranja-Azul):');
  for (const [name, size] of Object.entries(sizes)) {
    const outputPath = path.join(adminIconsPath, `admin-${size}.png`);

    await sharp(adminSvgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  ✅ ${size}x${size} → admin-${size}.png`);
  }

  // Criar aliases para nomes padrão
  await sharp(adminSvgPath).resize(192, 192).png().toFile(path.join(adminIconsPath, 'admin-192.png'));
  await sharp(adminSvgPath).resize(512, 512).png().toFile(path.join(adminIconsPath, 'admin-512.png'));
  await sharp(adminSvgPath).resize(180, 180).png().toFile(path.join(adminIconsPath, 'apple-touch-icon.png'));
  await sharp(adminSvgPath).resize(32, 32).png().toFile(path.join(adminIconsPath, 'favicon.png'));
  await sharp(adminSvgPath).resize(96, 96).png().toFile(path.join(adminIconsPath, 'store-96.png'));
  await sharp(adminSvgPath).resize(96, 96).png().toFile(path.join(adminIconsPath, 'mechanic-96.png'));

  console.log('  ✅ Aliases criados (admin-192.png, admin-512.png, apple-touch-icon.png, favicon.png)');
  console.log('  ✅ Shortcuts criados (store-96.png, mechanic-96.png)\n');

  console.log('🎉 Todos os ícones foram gerados com sucesso!');
  console.log('\n📋 Resumo:');
  console.log('  Customer PWA: apps/customer-pwa/public/icons/');
  console.log('  Admin PWA: apps/admin-pwa/public/icons/');
  console.log('\n✨ Os PWAs agora têm todos os ícones necessários para:');
  console.log('  - Android (192x192, 512x512)');
  console.log('  - iOS (180x180 apple-touch-icon)');
  console.log('  - Desktop (32x32 favicon)');
  console.log('  - Shortcuts (96x96)');
}

generateIcons().catch(console.error);
