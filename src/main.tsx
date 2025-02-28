
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "./providers/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class" storageKey="drone-flux-theme">
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
