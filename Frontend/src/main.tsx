
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "./providers/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from './contexts/NotificationContext';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class" storageKey="drone-flux-theme">
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
);
