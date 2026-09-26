import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { bootstrap } from "./bootstrap";
import "./index.css";

// Mount React immediately using bundled stock and configuration so the
// initial paint is instantaneous (0ms delay).
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

// Background sync from Supabase without delaying initial screen paint.
void bootstrap();

