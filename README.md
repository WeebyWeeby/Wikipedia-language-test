# Running Playwright Tests

**Prerequisites**
- **Node**: Node.js 16+ installed.
- **Working dir**: open the workspace root and run commands there.

**Install dependencies**
- **Install npm packages:**
  - `npm install`
- **Install Playwright browsers (normal):**
  - `npx playwright install`
- **Install with system deps (Linux CI):**
  - `npx playwright install --with-deps`

**Quick commands**
- **Run all tests:** `npx playwright test`
- **Run a single file:** `npx playwright test e2e/auth.spec.ts`
- **Run tests by title (grep):** `npx playwright test -g "Registration - validations"`
- **Run headed (visible) browser:** add `--headed` e.g. `npx playwright test --headed`
- **Open Playwright UI:** `npx playwright test --ui`
- **Show HTML report:** `npx playwright show-report`

**Use system Google Chrome**
- If you don't want Playwright to download browsers, use the `chrome` channel in your tests or project config (already used in tests):
  - Set `test.use({ channel: 'chrome' })` in tests or run a project with `--project=GoogleChrome`.
- Alternatively set `executablePath` when launching the browser.

**CI / offline / network workaround**
- Skip automatic browser download in CI and supply browsers manually:
  - `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci`
  - Copy a prepared browser cache to the runner and set `PLAYWRIGHT_BROWSERS_PATH` (e.g. `%LOCALAPPDATA%\ms-playwright` on Windows).
- Use an internal mirror for Playwright downloads:
  - `PLAYWRIGHT_DOWNLOAD_HOST="https://my-mirror.example.com" npx playwright install chromium`
- If behind a proxy set these env vars for the session:
  - `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`

**Environment variables used by tests**
- `TEST_USER_EMAIL` — email for login tests
- `TEST_USER_PASSWORD` — password for login tests

**Troubleshooting network / timeouts**
- If navigation times out or you see `ETIMEDOUT` / `ERR_CONNECTION_TIMED_OUT`, check reachability from the machine/CI:
```
nslookup qa-lab.dev.dnc.pp.ua
Test-NetConnection qa-lab.dev.dnc.pp.ua -Port 443   # PowerShell
curl -v https://qa-lab.dev.dnc.pp.ua/login
```
- You can increase test/navigation timeouts in tests:
  - `test.setTimeout(60000)` or `page.setDefaultNavigationTimeout(60000)`

**Test artifacts**
- Playwright outputs reports and attachments to `playwright-report/` by default. Use `npx playwright show-report` to open them.

If you want, I can run the tests here and collect the report, or produce a small script to prepare an offline browser cache for CI.
