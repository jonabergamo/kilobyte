import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://localhost:3400" },
  webServer: { command: "pnpm dev -p 3400", url: "http://localhost:3400/login", reuseExistingServer: true, timeout: 180_000 },
})
