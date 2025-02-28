
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "./providers/theme-provider";
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="drone-flux-theme">
    <App />
  </ThemeProvider>
);
