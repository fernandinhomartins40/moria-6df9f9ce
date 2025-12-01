import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { injectCorrectManifest, registerServiceWorker } from './utils/pwaManifest'

// CRÍTICO: Injetar manifest correto ANTES de renderizar
// Isso garante que beforeinstallprompt dispare com o manifest correto
injectCorrectManifest();

// Registrar service worker customizado (com fetch handler obrigatório)
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
