import { StrictMode } from 'react' // Componente que activa chequeos extra solo en desarrollo
import { createRoot } from 'react-dom/client' // Crea la raíz de React sobre el DOM real
import './index.css'
import App from './App' // Componente principal de la aplicación

// Punto de entrada: busca el <div id="root"> de index.html y monta la app dentro de él
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
