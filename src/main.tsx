import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { hydrateStore, startAutosave } from "@/store/persistence/sync";

async function bootstrap() {
  try {
    await hydrateStore();
  } catch (e) {
    console.error("Hydrate failed", e);
  } finally {
    startAutosave();
  }
}

bootstrap();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
