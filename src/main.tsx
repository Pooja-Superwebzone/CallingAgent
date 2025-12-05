import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import './scss/_custom.scss'

createRoot(document.getElementById("root")!).render(<App />);
