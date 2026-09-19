import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { bootstrap } from "./bootstrap";
import "./index.css";

// Stock and contact details come from the database; load them first so the
// first paint is already the real site. bootstrap() never rejects.
void bootstrap().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
