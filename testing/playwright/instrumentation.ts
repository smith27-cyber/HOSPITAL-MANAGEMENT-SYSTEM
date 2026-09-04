import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Coverage Instrumentation Helper
 * Collects and merges coverage data from browser and server
 */

export interface CoverageData {
  url: string;
  ranges: Array<{
    startOffset: number;
    endOffset: number;
    count: number;
  }>;
  text: string;
}

export class CoverageInstrumentor {
  private coverageData: Map<string, CoverageData> = new Map();
  private outputDir = './coverage/instrumented';

  constructor() {
    this.ensureOutputDir();
  }

  /**
   * Enable coverage collection for a page
   */
  async enableCoverage(page: any) {
    // Start JavaScript coverage
    await page.context().startJSCoverage({
      resetOnNavigation: false,
    });

    // Start CSS coverage
    await page.context().startCSSCoverage({
      resetOnNavigation: false,
    });
  }

  /**
   * Collect coverage data from page
   */
  async collectCoverage(page: any, testName: string) {
    try {
      // Collect JS coverage
      const jsCoverage = await page.context().stopJSCoverage();

      // Collect CSS coverage
      const cssCoverage = await page.context().stopCSSCoverage();

      // Save coverage data
      this.saveCoverageData(jsCoverage, testName, 'js');
      this.saveCoverageData(cssCoverage, testName, 'css');

      // Merge coverage
      this.mergeCoverage(jsCoverage);

      return {
        js: jsCoverage.length,
        css: cssCoverage.length,
      };
    } catch (error) {
      console.error('Error collecting coverage:', error);
      return { js: 0, css: 0 };
    }
  }

  /**
   * Save coverage data to file for inspection
   */
  private saveCoverageData(coverage: CoverageData[], testName: string, type: string) {
    const filename = path.join(
      this.outputDir,
      `${testName}-${type}-${Date.now()}.json`
    );

    fs.writeFileSync(filename, JSON.stringify(coverage, null, 2));
  }

  /**
   * Merge coverage data from multiple runs
   */
  private mergeCoverage(coverage: CoverageData[]) {
    for (const entry of coverage) {
      if (this.coverageData.has(entry.url)) {
        const existing = this.coverageData.get(entry.url)!;
        // Merge ranges
        existing.ranges.push(...entry.ranges);
      } else {
        this.coverageData.set(entry.url, entry);
      }
    }
  }

  /**
   * Generate Istanbul/nyc compatible coverage report
   */
  generateReport() {
    const nycFormat: any = {};

    for (const [url, data] of this.coverageData.entries()) {
      const filePath = this.urlToFilePath(url);

      if (!nycFormat[filePath]) {
        nycFormat[filePath] = {
          path: filePath,
          statementMap: this.generateStatementMap(data),
          fnMap: {},
          branchMap: {},
          s: this.generateStatementCoverage(data),
          f: {},
          b: {},
        };
      }
    }

    // Save in NYC format
    const outputFile = path.join(this.outputDir, 'coverage.json');
    fs.writeFileSync(outputFile, JSON.stringify(nycFormat, null, 2));

    return nycFormat;
  }

  /**
   * Convert browser coverage URL to file path
   */
  private urlToFilePath(url: string): string {
    // Extract path from localhost URL
    const match = url.match(/localhost:\d+(.+)/);
    if (match) {
      return path.join('/hms-frontend', match[1]);
    }
    return url;
  }

  /**
   * Generate statement map from coverage data
   */
  private generateStatementMap(data: CoverageData) {
    const statements: any = {};
    data.ranges.forEach((range, index) => {
      statements[index] = {
        start: { line: 1, column: range.startOffset },
        end: { line: 1, column: range.endOffset },
      };
    });
    return statements;
  }

  /**
   * Generate statement coverage array
   */
  private generateStatementCoverage(data: CoverageData) {
    const coverage: any = {};
    data.ranges.forEach((range, index) => {
      coverage[index] = range.count;
    });
    return coverage;
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Get coverage summary
   */
  getSummary() {
    let totalEntries = 0;
    let coveredEntries = 0;

    for (const data of this.coverageData.values()) {
      for (const range of data.ranges) {
        totalEntries++;
        if (range.count > 0) {
          coveredEntries++;
        }
      }
    }

    return {
      total: totalEntries,
      covered: coveredEntries,
      percentage: totalEntries > 0 ? ((coveredEntries / totalEntries) * 100).toFixed(2) : '0',
    };
  }
}

/**
 * Fixture for coverage instrumentation
 */
export const instrumentationFixture = test.extend({
  instrumentor: async ({}, use) => {
    const instrumentor = new CoverageInstrumentor();
    await use(instrumentor);
  },
});
