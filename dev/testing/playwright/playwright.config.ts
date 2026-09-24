import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Port 4200 is not reliably HMS2's own ng serve on this machine - a sibling
  // project (Active/HMS, no "2") runs its dev server on the same default port,
  // and its component structure is similar enough that tests against it look
  // plausible while testing the wrong app entirely. Use a dedicated port so
  // this suite only ever talks to HMS2.
  use: { baseURL: 'http://localhost:4300' },

  webServer: {
    command: 'cd ../../../hms-pom/hms-webb/angular && npm start -- --port 4300',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  globalTeardown: require.resolve('./global-teardown'),
});
