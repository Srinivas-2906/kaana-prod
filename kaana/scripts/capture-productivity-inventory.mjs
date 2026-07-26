/**
 * Capture reminders PWA + inventory WMS portfolio shots only.
 * Usage: node scripts/capture-productivity-inventory.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public/portfolio");
const envPath = path.join(root, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(envPath);

const cfg = {
  remindersName: process.env.REMINDERS_DEMO_NAME?.trim() || "PortfolioDemo",
  remindersPassword: process.env.REMINDERS_DEMO_PASSWORD?.trim() || "PortfolioDemo1!",
  remindersRecoveryEmail:
    process.env.REMINDERS_DEMO_RECOVERY_EMAIL?.trim() || "portfolio.demo@kaana.ai",
  inventoryWmsUrl: process.env.INVENTORY_WMS_URL?.trim() || "http://127.0.0.1:5177",
};

async function ensureRemindersAuth(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1500);
  const dashboard = page.locator('h1:has-text("Dashboard")');
  if (await dashboard.count()) {
    console.log("  Already signed in");
    return;
  }

  await page.locator('button[role="tab"]:has-text("Sign in")').click();
  await page.fill("#auth-name", cfg.remindersName);
  await page.fill("#auth-password", cfg.remindersPassword);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3500);
  if (await dashboard.count()) {
    console.log("  Sign-in OK");
    return;
  }

  await page.locator('button[role="tab"]:has-text("Sign up")').click();
  await page.waitForTimeout(500);
  await page.fill("#auth-name", cfg.remindersName);
  await page.fill("#auth-recovery-email", cfg.remindersRecoveryEmail);
  await page.fill("#auth-password", cfg.remindersPassword);
  await page.locator('button[type="submit"]:has-text("Create account")').click();
  await page.waitForTimeout(5000);
  if (!(await dashboard.count())) {
    throw new Error("Reminders auth failed");
  }
  console.log("  Account created");
}

async function seedRemindersDemo(page) {
  const samples = [
    "Pay electricity bill next Friday",
    "Team standup tomorrow 9am",
    "Buy groceries today",
    "Rent due on the 1st",
  ];
  const input = page.locator("textarea").first();
  for (const text of samples) {
    if (!(await input.count())) break;
    await input.fill(text);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1500);
    const confirm = page.locator("button").filter({ hasText: /^Save$|^Add$|^Confirm$/i }).first();
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click();
      await page.waitForTimeout(1500);
    }
  }
}

async function captureTab(page, tab, file) {
  await page.locator('nav[aria-label="Primary navigation"] button').filter({ hasText: tab }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  console.log("  OK", file);
}

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();

console.log("\n=== Firebase Productivity PWA ===");
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await mobile.newPage();
await ensureRemindersAuth(mp, "https://reminders-bills-pwa-wtba53dhka-el.a.run.app");
await seedRemindersDemo(mp);
await mp.screenshot({ path: path.join(outDir, "reminders-pwa-ui.png"), fullPage: false });
console.log("  OK reminders-pwa-ui.png");
await captureTab(mp, "Today", "reminders-pwa-today.png");
await captureTab(mp, "Upcoming", "reminders-pwa-upcoming.png");
await captureTab(mp, "Inbox", "reminders-pwa-inbox.png");
await mp.locator('button[aria-label="Voice settings"]').click();
await mp.waitForTimeout(1500);
await mp.screenshot({ path: path.join(outDir, "reminders-pwa-settings.png"), fullPage: false });
console.log("  OK reminders-pwa-settings.png");
await mobile.close();

console.log("\n=== Inventory Operations Demo ===");
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(cfg.inventoryWmsUrl, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(outDir, "inventory-wms-dashboard.png"), fullPage: false });
console.log("  OK inventory-wms-dashboard.png");

for (const [label, file] of [
  ["Inventory", "inventory-wms-stock.png"],
  ["Reports", "inventory-wms-reports.png"],
  ["Purchase Orders", "inventory-wms-orders.png"],
]) {
  await page.locator(".nav-item").filter({ hasText: label }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  console.log("  OK", file);
}

await page.locator(".nav-item").filter({ hasText: "Inventory" }).click();
await page.waitForTimeout(1500);
await page.locator(".tbl-row").first().click();
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, "inventory-wms-detail.png"), fullPage: false });
console.log("  OK inventory-wms-detail.png");

await browser.close();
console.log("\nDone. Test login for reminders PWA:");
console.log(`  Name: ${cfg.remindersName}`);
console.log(`  Password: ${cfg.remindersPassword}`);
console.log(`  Recovery email: ${cfg.remindersRecoveryEmail}`);
