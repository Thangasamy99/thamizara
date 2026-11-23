// Vercel entrypoint — re-exports the Express app so the platform can wrap it
// as a serverless handler. Local/PM2 deployments use src/server.js instead.
export { default } from "../src/app.js";
