import path from 'path';
import fs from 'fs';
import MCR from 'monocart-coverage-reports';

async function globalTeardown() {
  console.log('\n📦 Generating HTML coverage report...');

  const rawDataDir = path.resolve(process.cwd(), '.temp-v8-coverage');
  const reportOutputDir = path.resolve(process.cwd(), 'coverage-report');

  try {
    if (!fs.existsSync(rawDataDir)) {
      console.warn('⚠️ No coverage directory found. Skipping report generation.');
      return;
    }

    const files = fs.readdirSync(rawDataDir).filter((f) => f.startsWith('coverage-') && f.endsWith('.json'));

    if (files.length === 0) {
      console.warn('⚠️ No coverage files found in', rawDataDir);
      return;
    }

    console.log(`Found ${files.length} coverage file(s)`);

    const reportOptions = {
      name: 'HMS E2E Code Coverage',
      outputDir: reportOutputDir,
      reports: ['v8', 'html', 'console-summary'],

      // Note: chunk-*.js entries can be real lazy-loaded route code (e.g. the login
      // route's chunk unpacks into src/app/auth/login/login.ts + auth.service.ts via
      // its source map) - so filtering can't go by filename. Instead: drop entries
      // that have no sourceMappingURL at all (esbuild runtime-helper chunks like
      // chunk-653SOEEV.js, which never unpack to real source), and the global compiled
      // styles.css (a single bundled file, not per-component, not useful row-by-row).
      entryFilter: (entry: { url: string; source?: string }) => {
        const { pathname, hostname } = new URL(entry.url);
        if (hostname === 'fonts.googleapis.com' || hostname === 'fonts.gstatic.com') {
          return false;
        }
        // Vite dev-server client bootstrapping - not app code.
        if (pathname === '/@vite/client' || pathname.endsWith('/vite/dist/client/env.mjs')) {
          return false;
        }
        // Vite's pre-bundled vendor deps cache (@angular/*, rxjs, zone.js, etc.) -
        // third-party library code, not app source.
        if (pathname.includes('/vite/deps/')) {
          return false;
        }
        if (pathname === '/styles.css') {
          return false;
        }
        if (entry.source !== undefined && !entry.source.includes('sourceMappingURL')) {
          return false;
        }
        return true;
      },

      sourceFilter: (sourcePath: string) => {
        if (
          sourcePath.includes('webpack/') ||
          sourcePath.includes('node_modules/') ||
          sourcePath.includes('fonts.googleapis') ||
          sourcePath.includes('fonts.gstatic') ||
          sourcePath.startsWith('localhost-4200/')
        ) {
          return false;
        }
        return true;
      },

      sourcePath: (filePath: string) => {
        if (filePath.startsWith('webpack:///')) {
          return filePath.replace('webpack:///', '');
        }
        return filePath;
      },
    };

    const coverageReport = MCR(reportOptions);

    for (const file of files) {
      const filepath = path.join(rawDataDir, file);
      const rawData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      if (Array.isArray(rawData) && rawData.length > 0) {
        await coverageReport.add(rawData);
      }
    }

    await coverageReport.generate();
    console.log(`✅ HTML Report ready at: ${reportOutputDir}/index.html\n`);
  } catch (error) {
    console.error('❌ Error generating coverage report:', (error as Error).message);
  }
}

export default globalTeardown;
