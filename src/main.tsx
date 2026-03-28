/**
 * src/main.tsx
 * Application entry point: import global CSS and mount the React app.
 */

// Import minimal CSS reset to normalize browser defaults
import "./styles/reset.css"; // reset browser styles

// Import design tokens (CSS custom properties) used across the app
import "./styles/variables.css"; // CSS variables

// Import global typography, layout and accessibility utilities
import "./styles/global.css"; // global styles

// Import keyframe animations used by UI components
import "./styles/animations.css"; // animations

// Import React StrictMode to highlight potential problems in development
import { StrictMode } from "react"; // React StrictMode

// Import the React 18 root API for mounting the app
import { createRoot } from "react-dom/client"; // createRoot API

// Import App as a named export to match the component definition
import { App } from "./App"; // named export import

// Locate the DOM root element and mount the React application into it
createRoot(document.getElementById("root") as HTMLElement).render(
  // Wrap the app in StrictMode for development checks
  <StrictMode>
    <App /> {/* Render the main App component */}
  </StrictMode>,
);
