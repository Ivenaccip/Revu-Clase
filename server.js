'use strict';

// Servidor estatico sin dependencias para la landing REVU.
// - Escucha en process.env.PORT (Hostinger lo inyecta); 3000 en local.
// - Sirve archivos estaticos desde este directorio.
// - Soporta HTTP Range (206 Partial Content) para streaming de video.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  if (body === undefined) res.end();
  else res.end(body);
}

// Resuelve la URL a una ruta segura dentro de ROOT (evita path traversal).
function resolvePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch (e) {
    return null;
  }
  if (decoded === '/' || decoded === '') decoded = '/index.html';

  const resolved = path.normalize(path.join(ROOT, decoded));
  // Debe quedar dentro de ROOT.
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

function serveFile(req, res, filePath, stat) {
  const type = contentType(filePath);
  const total = stat.size;
  const range = req.headers.range;

  // Cache: HTML sin cache agresivo; assets con cache largo.
  const isHtml = type.startsWith('text/html');
  const cacheControl = isHtml
    ? 'no-cache'
    : 'public, max-age=86400';

  const baseHeaders = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
    'Last-Modified': stat.mtime.toUTCString()
  };

  // --- Peticiones con Range (video streaming, seek) ---
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match) {
      return send(res, 416, {
        'Content-Range': `bytes */${total}`,
        'Content-Type': 'text/plain; charset=utf-8'
      }, 'Range Not Satisfiable');
    }

    let start = match[1] === '' ? undefined : parseInt(match[1], 10);
    let end = match[2] === '' ? undefined : parseInt(match[2], 10);

    if (start === undefined && end === undefined) {
      // "bytes=-" invalido
      return send(res, 416, {
        'Content-Range': `bytes */${total}`,
        'Content-Type': 'text/plain; charset=utf-8'
      }, 'Range Not Satisfiable');
    }

    if (start === undefined) {
      // sufijo: ultimos N bytes -> "bytes=-500"
      const suffix = end;
      start = Math.max(0, total - suffix);
      end = total - 1;
    } else if (end === undefined) {
      end = total - 1;
    }

    if (isNaN(start) || isNaN(end) || start > end || start >= total) {
      return send(res, 416, {
        'Content-Range': `bytes */${total}`,
        'Content-Type': 'text/plain; charset=utf-8'
      }, 'Range Not Satisfiable');
    }

    if (end >= total) end = total - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, Object.assign({}, baseHeaders, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': chunkSize
    }));

    if (req.method === 'HEAD') return res.end();

    const stream = fs.createReadStream(filePath, { start, end });
    stream.on('error', () => res.destroyed || res.end());
    stream.pipe(res);
    return;
  }

  // --- Respuesta completa (200) ---
  res.writeHead(200, Object.assign({}, baseHeaders, {
    'Content-Length': total
  }));

  if (req.method === 'HEAD') return res.end();

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.destroyed || res.end());
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, {
      'Allow': 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8'
    }, 'Method Not Allowed');
  }

  const filePath = resolvePath(req.url || '/');
  if (!filePath) {
    return send(res, 403, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat) {
      return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
    }

    // Un directorio -> intenta su index.html.
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      return fs.stat(indexPath, (err2, stat2) => {
        if (err2 || !stat2 || !stat2.isFile()) {
          return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
        }
        serveFile(req, res, indexPath, stat2);
      });
    }

    if (!stat.isFile()) {
      return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
    }

    serveFile(req, res, filePath, stat);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`REVU listo en http://${HOST}:${PORT} (sirviendo ${ROOT})`);
});
