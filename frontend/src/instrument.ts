import * as Sentry from "@sentry/react";

// Vite exposes env variables via import.meta.env
// Variables must be prefixed with VITE_ (defined in frontend/.env)
const SENTRY_DSN_REACT = import.meta.env.VITE_SENTRY_DSN_REACT;
const MY_IP = import.meta.env.VITE_MY_IP || "http://localhost:8000";

if (SENTRY_DSN_REACT) {
  Sentry.init({
    dsn: SENTRY_DSN_REACT,
    integrations: [Sentry.browserTracingIntegration()],
    // Capture 100% of spans. This is useful for development and debugging. Consider reducing in production or using traceSampler
    tracesSampleRate: 1.0,
    tracePropagationTargets: [MY_IP, /^\/api\//],
  });
} else {
  console.warn("Sentry not started");
}
