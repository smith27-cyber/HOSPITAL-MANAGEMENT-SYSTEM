import { test, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Coverage fixture for automatic coverage collection
 */

let globalCoverageData: any = {};

export const coverageTest = test.extend({
  coverage: async ({ page }, use) => {
    const coverageDir = './coverage/instrumented';

    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }

    // Enable coverage collection
    const jsCoveragePromise = page.context().startJSCoverage?.({
      resetOnNavigation: false,
    });

    const cssCoveragePromise = page.context().startCSSCoverage?.({
      resetOnNavigation: false,
    });

    const coverage = {
      page,
      collect: async (testName: string) => {
        try {
          const jsCoverage = jsCoveragePromise ?
            await (await jsCoveragePromise) : [];
          const cssCoverage = cssCoveragePromise ?
            await (await cssCoveragePromise) : [];

          // Save raw coverage data
          const timestamp = Date.now();
          fs.writeFileSync(
            path.join(coverageDir, `${testName}-${timestamp}.json`),
            JSON.stringify({ js: jsCoverage, css: cssCoverage }, null, 2)
          );

          // Merge into global coverage
          globalCoverageData[testName] = {
            js: jsCoverage,
            css: cssCoverage,
            timestamp,
          };

          return { js: jsCoverage.length, css: cssCoverage.length };
        } catch (error) {
          console.error('Error collecting coverage:', error);
          return { js: 0, css: 0 };
        }
      },

      generateReport: async () => {
        try {
          // Convert to NYC format
          const nycReport = convertToNycFormat(globalCoverageData);

          const reportPath = path.join(coverageDir, 'coverage-final.json');
          fs.writeFileSync(reportPath, JSON.stringify(nycReport, null, 2));

          // Generate lcov format
          const lcovPath = path.join(coverageDir, 'lcov.info');
          fs.writeFileSync(lcovPath, generateLcov(nycReport));

          console.log('✅ Coverage report generated:');
          console.log(`   NYC Format: ${reportPath}`);
          console.log(`   LCOV Format: ${lcovPath}`);

          return nycReport;
        } catch (error) {
          console.error('Error generating report:', error);
          return null;
        }
      },
    };

    await use(coverage);

    // Cleanup and generate final report
    try {
      await coverage.generateReport();
    } catch (error) {
      console.error('Error in coverage cleanup:', error);
    }
  },
});

/**
 * Convert browser coverage to NYC format
 */
function convertToNycFormat(coverageData: any) {
  const nycFormat: any = {};

  for (const [testName, data] of Object.entries(coverageData) as any) {
    if (data.js) {
      for (const jsEntry of data.js) {
        const filePath = normalizeUrl(jsEntry.url);
        if (!nycFormat[filePath]) {
          nycFormat[filePath] = {
            path: filePath,
            statementMap: generateStatementMap(jsEntry),
            fnMap: {},
            branchMap: {},
            s: generateCoverageArray(jsEntry),
            f: {},
            b: {},
            _coverageSchema: '1a1c01bbd47fc00a2747ee45e0cdc3a8787d1d3a',
            hash: hashCode(filePath),
          };
        }
      }
    }
  }

  return nycFormat;
}

/**
 * Generate statement map from coverage entry
 */
function generateStatementMap(entry: any) {
  const statements: any = {};
  let lineNum = 1;

  entry.ranges.forEach((range: any, idx: number) => {
    statements[idx] = {
      start: { line: lineNum, column: range.startOffset },
      end: { line: lineNum, column: range.endOffset },
    };
  });

  return statements;
}

/**
 * Generate coverage array (count of executions per statement)
 */
function generateCoverageArray(entry: any) {
  const coverage: any = {};

  entry.ranges.forEach((range: any, idx: number) => {
    coverage[idx] = range.count || 0;
  });

  return coverage;
}

/**
 * Generate LCOV format coverage data
 */
function generateLcov(nycFormat: any) {
  let lcov = '';

  for (const [filePath, data] of Object.entries(nycFormat) as any) {
    lcov += `TN:${filePath}\n`;
    lcov += `SF:${filePath}\n`;

    const lines: any = {};
    for (const [idx, range] of Object.entries(data.s) as any) {
      const stmt = data.statementMap[idx];
      if (stmt) {
        const line = stmt.start.line;
        if (!lines[line]) {
          lines[line] = 0;
        }
        lines[line] += range;
      }
    }

    for (const [line, count] of Object.entries(lines) as any) {
      lcov += `DA:${line},${count}\n`;
    }

    lcov += 'end_of_record\n';
  }

  return lcov;
}

/**
 * Normalize URL to file path
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;

    // Remove leading slash and handle .map files
    pathname = pathname.replace(/^\//, '');
    if (pathname.endsWith('.map')) {
      pathname = pathname.slice(0, -4);
    }

    return pathname;
  } catch {
    return url;
  }
}

/**
 * Simple hash function for consistency
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export { coverageTest };
