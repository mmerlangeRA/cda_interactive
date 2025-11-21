import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./custom-icons.css"; // Import custom icons CSS for animations
import "./custom-theme.css"; // Import custom theme after Bootstrap
import "./instrument";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
