const fs = require('fs');
const path = require('path');

const NYC_OUTPUT_DIR = path.resolve(__dirname, '.nyc_output');

if (!fs.existsSync(NYC_OUTPUT_DIR)) {
  console.log('[Coverage] No data collected');
  process.exit(0);
}

const files = fs.readdirSync(NYC_OUTPUT_DIR).filter(f => f.endsWith('.json'));
if (files.length === 0) {
  console.log('[Coverage] No coverage files found');
  process.exit(0);
}

const merged = {};

files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(NYC_OUTPUT_DIR, file), 'utf-8'));
    Object.entries(data).forEach(([filePath, coverageObj]) => {
      if (!merged[filePath]) {
        merged[filePath] = JSON.parse(JSON.stringify(coverageObj));
      } else if (coverageObj?.s && merged[filePath]?.s) {
        Object.entries(coverageObj.s).forEach(([key, count]) => {
          merged[filePath].s[key] = Math.max(merged[filePath].s[key] || 0, count || 0);
        });
      }
    });
  } catch (e) {
    console.error(`Failed to read ${file}`);
  }
});

const mergedFile = path.join(NYC_OUTPUT_DIR, 'coverage-final.json');
fs.writeFileSync(mergedFile, JSON.stringify(merged, null, 2));
console.log(`[Coverage] Merged ${Object.keys(merged).length} files from ${files.length} runs`);
