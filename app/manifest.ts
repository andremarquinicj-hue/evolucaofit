import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Evolução Fit', short_name: 'Evolução Fit', description: 'Seu progresso na academia, treino após treino.',
    start_url: '/inicio', display: 'standalone', background_color: '#faf6fa', theme_color: '#faf6fa',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
  };
}
