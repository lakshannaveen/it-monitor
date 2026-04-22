import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App";
import "./styles/globals.css";

if (typeof window !== "undefined") {
  const resizeObserverError = /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/i;

  // Prevent ResizeObserver loop warnings by deferring observer callbacks.
  if (window.ResizeObserver) {
    const NativeResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeResizeObserver {
      constructor(callback) {
        super((entries, observer) => {
          window.requestAnimationFrame(() => callback(entries, observer));
        });
      }
    };
  }

  // Fallback: ignore only this known noisy browser message in dev overlay.
  window.addEventListener("error", (event) => {
    if (resizeObserverError.test(event.message || "")) {
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message = event?.reason?.message || String(event?.reason || "");
    if (resizeObserverError.test(message)) {
      event.preventDefault();
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
