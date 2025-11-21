import React from 'react';

interface IconSVGProps {
  variant: 'mechanic' | 'customer';
  size?: number;
}

export function MechanicIconSVG({ size = 192 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background com gradiente */}
      <defs>
        <linearGradient id="mechanicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background arredondado */}
      <rect width="192" height="192" rx="42" fill="url(#mechanicGrad)" />

      {/* Chave inglesa */}
      <g transform="translate(96, 96)">
        {/* Corpo da chave */}
        <path
          d="M-30,-40 L-20,-30 L20,10 L30,0 L-10,-40 Z"
          fill="white"
          opacity="0.9"
        />

        {/* Cabeça da chave */}
        <circle cx="30" cy="10" r="18" fill="white" opacity="0.9" />
        <circle cx="30" cy="10" r="10" fill="url(#mechanicGrad)" />

        {/* Detalhes */}
        <rect x="25" y="5" width="10" height="10" fill="white" opacity="0.9" />
      </g>

      {/* Letra M */}
      <text
        x="96"
        y="150"
        fontFamily="Arial, sans-serif"
        fontSize="48"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        M
      </text>
    </svg>
  );
}

export function CustomerIconSVG({ size = 192 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background com gradiente */}
      <defs>
        <linearGradient id="customerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background arredondado */}
      <rect width="192" height="192" rx="42" fill="url(#customerGrad)" />

      {/* Âncora */}
      <g transform="translate(96, 96)">
        {/* Haste da âncora */}
        <rect x="-4" y="-40" width="8" height="60" rx="4" fill="white" opacity="0.9" />

        {/* Anel superior */}
        <circle cx="0" cy="-40" r="10" fill="none" stroke="white" strokeWidth="6" opacity="0.9" />

        {/* Braços da âncora */}
        <path
          d="M -35,20 Q -35,5 -20,5 L -4,5 L -4,20 L 4,20 L 4,5 L 20,5 Q 35,5 35,20 L 35,30 Q 35,40 25,40 L 15,40 Q 10,40 10,30 L 10,25 L -10,25 L -10,30 Q -10,40 -15,40 L -25,40 Q -35,40 -35,30 Z"
          fill="white"
          opacity="0.9"
        />
      </g>

      {/* Letra C */}
      <text
        x="96"
        y="150"
        fontFamily="Arial, sans-serif"
        fontSize="48"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        C
      </text>
    </svg>
  );
}

export function IconSVG({ variant, size = 192 }: IconSVGProps) {
  if (variant === 'mechanic') {
    return <MechanicIconSVG size={size} />;
  }
  return <CustomerIconSVG size={size} />;
}

// Função para converter SVG em data URL
export function getIconDataURL(variant: 'mechanic' | 'customer', size: number = 192): string {
  const color = variant === 'mechanic' ? '#2563eb' : '#10b981';
  const letter = variant === 'mechanic' ? 'M' : 'C';

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.5}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${letter}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
