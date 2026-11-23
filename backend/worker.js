// Cloudflare Workers entrypoint.
// Runs the existing Express app inside the Workers runtime via the
// node:http server compatibility layer. Local/PM2 still use src/server.js.
import { httpServerHandler } from "cloudflare:node";
import app from "./src/app.js";

const port = 8080;
app.listen(port);

export default httpServerHandler({ port });
