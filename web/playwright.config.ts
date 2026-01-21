import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  webServer: { command: "pnpm run build && pnpm run preview", port: 4173 },
  testDir: "e2e",
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
