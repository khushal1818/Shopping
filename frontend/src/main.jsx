import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ShopContextProvider from './Context/ShopContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'

// Detect genuine browser page reload (Ctrl+R, F5, or browser refresh button)
const isBrowserReload = () => {
  try {
    const navEntries = window.performance?.getEntriesByType?.('navigation');
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === 'reload';
    }
    return window.performance?.navigation?.type === 1;
  } catch {
    return false;
  }
};

// On genuine browser reload, preserve standard routes or shop route
if (isBrowserReload()) {
  try {
    window.scrollTo(0, 0);
  } catch {
    // ignore
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </AuthProvider>
  </StrictMode>,
)
