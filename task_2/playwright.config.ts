import { defineConfig } from '@playwright/test';

const isDocker = process.env.DOCKER === 'true';
const isCI = process.env.CI === 'true';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    timeout: 60_000,

    reporter: [
        ['html', {
            outputFolder: 'playwright-report',
            open: 'never'
        }]
    ],

    use: {
        baseURL: 'https://infotecs.ru',
        headless: isDocker || isCI,
        viewport: {
            width: 1920,
            height: 1080
        },
        browserName: 'chromium',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        navigationTimeout: 60_000,
        actionTimeout: 15_000
    }
});