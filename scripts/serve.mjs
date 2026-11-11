import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const options = { host: process.env.HOST || '127.0.0.1', port: process.env.PORT || '5173' };
const args = process.argv.slice(2);

for (let index = 0; index < args.length; index++) {
  const argument = args[index];
  // The server already fails on an occupied port; accept the standard preview flag.
  if (argument === '--strictPort' || argument === '--strict-port') continue;
  if (argument === '--help' || argument === '-h') {
    console.log('Advent local server\nUsage: npm run dev -- --host 127.0.0.1 --port 5173\nEnvironment: HOST, PORT');
    process.exit(0);
  }
  const match = argument.match(/^--(host|port)(?:=(.*))?$/);
  if (!match) throw new Error(`Unknown option: ${argument}`);
  const value = match[2] ?? args[++index];
  if (value === undefined || value.startsWith('--')) throw new Error(`Missing value: --${match[1]}`);
  options[match[1]] = value;
}

const port = Number(options.port);
if (!/^\d+$/.test(String(options.port)) || !Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535');
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function insideRoot(path) {
  return path === root || path.startsWith(`${root}${sep}`);
}

function respond(response, status, message, method = 'GET') {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(status === 405 ? { Allow: 'GET, HEAD' } : {}),
  });
  response.end(method === 'HEAD' ? undefined : message);
}

const server = createServer(async (request, response) => {
  const method = request.method || 'GET';
  if (!['GET', 'HEAD'].includes(method)) return respond(response, 405, 'Method not allowed', method);
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\0') || pathname.includes('\\')) return respond(response, 400, 'Invalid path', method);
    const segments = pathname.split('/');
    if (segments.some(segment => segment.startsWith('.') || segment === 'node_modules')) {
      return respond(response, 403, 'Forbidden', method);
    }
    let path = resolve(root, `.${pathname}`);
    if (!insideRoot(path)) return respond(response, 403, 'Forbidden', method);
    path = await realpath(path);
    if (!insideRoot(path)) return respond(response, 403, 'Forbidden', method);
    let info = await stat(path);
    if (info.isDirectory()) {
      path = await realpath(resolve(path, 'index.html'));
      if (!insideRoot(path)) return respond(response, 403, 'Forbidden', method);
      info = await stat(path);
    }
    if (!info.isFile()) return respond(response, 404, 'Not found', method);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (method === 'HEAD') return response.end();
    const stream = createReadStream(path);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    if (error instanceof URIError || error instanceof TypeError) return respond(response, 400, 'Invalid URL', method);
    if (['ENOENT', 'ENOTDIR'].includes(error.code)) return respond(response, 404, 'Not found', method);
    if (error.code === 'EACCES') return respond(response, 403, 'Forbidden', method);
    respond(response, 500, 'Unable to read this file', method);
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is in use. Choose another with --port or PORT.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, options.host, () => {
  const address = server.address();
  const host = options.host.includes(':') ? `[${options.host}]` : options.host;
  console.log(`Advent → http://${host}:${address.port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
