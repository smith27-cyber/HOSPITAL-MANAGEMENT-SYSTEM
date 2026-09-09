#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createInstrumenter } = require('istanbul-lib-instrument');

const instrumenter = createInstrumenter({
  esModules: true,
  produceSourceMap: true,
  compact: false
});

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(__dirname, 'dist', 'hms-frontend', 'browser', filePath);

  // Serve instrumented JS files with coverage
  if ((req.url.endsWith('.js') || req.url.includes('/browser/')) &&
      !req.url.includes('node_modules') &&
      !req.url.includes('.map')) {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        const instrumented = instrumenter.instrumentSync(content, req.url);

        // Inject istanbul coverage initialization if not already there
        if (!instrumented.includes('window.__coverage__')) {
          const wrappedCode = `
window.__coverage__ = window.__coverage__ || {};
(function() {
${instrumented}
})();
`;
          res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-cache' });
          res.end(wrappedCode);
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-cache' });
        res.end(instrumented);
        return;
      }
    } catch (error) {
      console.error(`Failed to instrument ${req.url}:`, error.message);
    }
  }

  // Serve other files normally
  try {
    if (!fs.existsSync(filePath)) {
      // Try without browser suffix for nested routes
      const altPath = path.join(__dirname, 'dist', 'hms-frontend', 'browser', 'index.html');
      if (fs.existsSync(altPath) && !filePath.includes('.')) {
        filePath = altPath;
      }
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ico': 'image/x-icon'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  } catch (error) {
    console.error(`Error serving ${req.url}:`, error.message);
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(4200, () => {
  console.log('✅ Instrumented server running on http://localhost:4200');
  console.log('   Coverage data available in window.__coverage__');
  console.log('   Collecting code coverage from all JS files...');
});
