import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App";
import "./styles/globals.css";

// Ignore known browser ResizeObserver noise that can trigger CRA overlay.
if (typeof window !== "undefined") {
  const resizeObserverError = /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/i;
  window.addEventListener("error", (event) => {
    if (resizeObserverError.test(event.message || "")) {
      event.stopImmediatePropagation();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
