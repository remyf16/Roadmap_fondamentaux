import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { hydrateFromApi, startAutosaveToApi } from "@/store/persistence/sync";

async function bootstrap() {
  try {
    await hydrateFromApi();
  } catch (e) {
    console.error("Hydration failed", e);
  } finally {
    startAutosaveToApi();
  }
}

bootstrap();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
