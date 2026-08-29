/* A dependency-free static server, only so the ES modules can load
   over http:// during development.  node serve.mjs [port]           */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const port = Number(process.argv[2]) || 5173;
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".avif": "image/avif", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".woff2": "font/woff2", ".ico": "image/x-icon"
};

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const path = join(root, normalize(url === "/" ? "/index.html" : url));
  if (!path.startsWith(root)) { res.writeHead(403).end("Forbidden"); return; }
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": types[extname(path)] ?? "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(port, () => console.log(`→ http://localhost:${port}`));
