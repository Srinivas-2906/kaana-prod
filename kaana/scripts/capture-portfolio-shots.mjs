/**
 * Capture portfolio UI screenshots — one case study at a time.
 *
 * Credentials (priority order):
 *   1. kaana/.env.local
 *   2. GCP Secret Manager (kaana-prod) when gcloud is available
 *
 * Usage: npm run capture:portfolio
 */
import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public/portfolio");
const envPath = path.join(root, ".env.local");
const API_LOGIN = "https://api.kaana.in/api/platform/login";
const GCP_PROJECT = "kaana-prod";

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

function readGcpSecret(name) {
  try {
    return execSync(
      `gcloud secrets versions access latest --secret=${name} --project=${GCP_PROJECT}`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return "";
  }
}

loadEnvFile(envPath);

const cfg = {
  adminEmail:
    process.env.PORTFOLIO_LOGIN_EMAIL?.trim() ||
    readGcpSecret("kaana-admin-email") ||
    "admin@kaana.ai",
  adminPassword:
    process.env.PORTFOLIO_LOGIN_PASSWORD?.trim() ||
    readGcpSecret("kaana-admin-password") ||
    "",
  adminPasswordAlt: process.env.PORTFOLIO_LOGIN_PASSWORD_ALT?.trim() || "",
  tenantSlug: process.env.PORTFOLIO_TENANT_SLUG?.trim() || "dentacare",
  tenantEmail:
    process.env.PORTFOLIO_TENANT_EMAIL?.trim() || "ajitdentacare@gmail.com",
  tenantPassword:
    process.env.PORTFOLIO_TENANT_PASSWORD?.trim() || "Dentacare@123",
  tenantEmailAlt:
    process.env.PORTFOLIO_TENANT_EMAIL_ALT?.trim() || "admin@dentacare.in",
  tenantPasswordAlt:
    process.env.PORTFOLIO_TENANT_PASSWORD_ALT?.trim() || "Dentacare@2024",
  clinicUser:
    process.env.PORTFOLIO_CLINIC_USER?.trim() || "ajitdentacare@gmail.com",
  clinicPassword:
    process.env.PORTFOLIO_CLINIC_PASSWORD?.trim() || "Dentacare@123",
  aquafarmPhone: process.env.AQUAFARM_PHONE?.trim() || "9985533376",
  aquafarmPin: process.env.AQUAFARM_PIN?.trim() || "123456",
  remindersName: process.env.REMINDERS_DEMO_NAME?.trim() || "PortfolioDemo",
  remindersPassword:
    process.env.REMINDERS_DEMO_PASSWORD?.trim() || "PortfolioDemo1!",
  remindersRecoveryEmail:
    process.env.REMINDERS_DEMO_RECOVERY_EMAIL?.trim() || "portfolio.demo@kaana.ai",
  inventoryWmsUrl:
    process.env.INVENTORY_WMS_URL?.trim() || "http://127.0.0.1:5177",
};

async function tryApiLogin(request, body) {
  const res = await request.post(API_LOGIN, {
    data: body,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok()) throw new Error(data.error || `HTTP ${res.status()}`);
  if (!data.token) throw new Error("No token in login response");
  return data;
}

async function resolveKaanaAuth(request) {
  const passwords = [
    cfg.adminPassword,
    cfg.adminPasswordAlt,
    cfg.tenantPassword,
    cfg.tenantPasswordAlt,
    "kaanaadmin",
    "Kaana@2024",
  ].filter(Boolean);

  const attempts = [];
  for (const password of [...new Set(passwords)]) {
    if (cfg.adminEmail) {
      attempts.push({
        label: `platform ${cfg.adminEmail}`,
        body: { email: cfg.adminEmail, password },
      });
    }
    attempts.push({
      label: `tenant ${cfg.tenantEmail} @ ${cfg.tenantSlug}`,
      body: {
        email: cfg.tenantEmail,
        password,
        tenantSlug: cfg.tenantSlug,
      },
    });
    attempts.push({
      label: `tenant ${cfg.tenantEmailAlt} @ ${cfg.tenantSlug}`,
      body: {
        email: cfg.tenantEmailAlt,
        password,
        tenantSlug: cfg.tenantSlug,
      },
    });
    attempts.push({
      label: `Admin @ ${cfg.tenantSlug}`,
      body: {
        identifier: "Admin",
        password,
        tenantSlug: cfg.tenantSlug,
      },
    });
  }

  let lastError = "No login attempts";
  for (const attempt of attempts) {
    try {
      const auth = await tryApiLogin(request, attempt.body);
      console.log("  AUTH OK:", attempt.label);
      return auth;
    } catch (err) {
      lastError = err.message;
    }
  }
  throw new Error(lastError);
}

async function saveKaanaAuth(page, auth) {
  await page.evaluate((payload) => {
    localStorage.setItem("kaana_token", payload.token);
    if (payload.user) localStorage.setItem("kaana_user", JSON.stringify(payload.user));
    if (payload.tenant) localStorage.setItem("kaana_tenant", JSON.stringify(payload.tenant));
  }, auth);
}

async function captureWithKaanaAuth(page, url, file, auth, wait = 3500, action) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await saveKaanaAuth(page, auth);
  await page.reload({ waitUntil: "networkidle", timeout: 90000 });
  if (action) await action(page);
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  console.log("  OK", file);
}

async function loginPlatformUi(page) {
  const passwords = [
    cfg.adminPassword,
    cfg.tenantPassword,
    cfg.tenantPasswordAlt,
    "kaanaadmin",
    "Kaana@2024",
  ].filter(Boolean);
  for (const password of [...new Set(passwords)]) {
    try {
      await page.goto("https://app.kaana.in/login", {
        waitUntil: "networkidle",
        timeout: 90000,
      });
      await page.fill('input[type="email"]', cfg.adminEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/dashboard|admin|onboarding/, { timeout: 30000 });
      await page.waitForTimeout(2500);
      console.log("  UI login OK:", cfg.adminEmail);
      return true;
    } catch {
      /* try next password */
    }
  }
  return false;
}

async function aquafarmApiAuth(request, page) {
  const phones = [cfg.aquafarmPhone, "9008747926", "9111111111"];
  for (const phone of phones) {
    try {
      const res = await request.post("https://api.aquafarm.kaana.in/auth/login", {
        data: { phoneNumber: phone, pin: cfg.aquafarmPin },
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });
      const data = await res.json();
      if (!res.ok()) throw new Error(data.message || "login failed");
      const farmId =
        data.user?.farms?.find((f) => f.status !== "INACTIVE")?.farmId ||
        data.user?.farms?.[0]?.farmId;
      await page.goto("https://aquafarm.kaana.in", { waitUntil: "domcontentloaded" });
      await page.evaluate(({ token, farmId: fid }) => {
        localStorage.setItem("accessToken", token);
        if (fid) localStorage.setItem("selectedFarmId", fid);
      }, { token: data.accessToken, farmId });
      await page.reload({ waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(3000);
      console.log("  Aquafarm auth OK:", phone, farmId ? `farm ${farmId}` : "no farm");
      return !!farmId;
    } catch (err) {
      console.warn("  Aquafarm login try", phone, err.message);
    }
  }
  return false;
}

async function captureLocalBotiq(page, file) {
  await page.goto("http://127.0.0.1:5174", { waitUntil: "domcontentloaded", timeout: 15000 });
  await injectKaanaToken(page, "portfolio-local-capture-token");
  await page.reload({ waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector(".inbox-shell", { timeout: 15000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  console.log("  OK", file, "(local botiq)");
}

async function capture(page, url, file, wait = 3000, action) {
  const filePath = path.join(outDir, file);
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  if (action) await action(page);
  await page.waitForTimeout(wait);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log("  OK", file);
}

async function injectKaanaToken(page, token) {
  await page.evaluate((t) => {
    localStorage.setItem("kaana_token", t);
  }, token);
}

async function captureWithToken(page, url, file, token, wait = 3500, action) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await injectKaanaToken(page, token);
  await page.reload({ waitUntil: "networkidle", timeout: 90000 });
  if (action) await action(page);
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  console.log("  OK", file);
}

async function loginAquafarm(page) {
  await page.goto("https://aquafarm.kaana.in/login", {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.fill("#phone", cfg.aquafarmPhone);
  await page.fill("#pin", cfg.aquafarmPin);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  if (page.url().includes("/select-farm")) {
    const farmBtn = page.locator("button").filter({ hasText: /farm|tank|vijay/i }).first();
    if (await farmBtn.count()) {
      await farmBtn.click();
      await page.waitForTimeout(3000);
    } else {
      await page.locator("button").nth(1).click().catch(() => {});
      await page.waitForTimeout(3000);
    }
  }
}

async function loginClinicForm(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  if (!(await page.locator("#lUser").count())) return true;
  await page.fill("#lUser", cfg.clinicUser);
  await page.fill("#lPass", cfg.clinicPassword);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4500);
  return !(await page.locator("#lUser").isVisible().catch(() => false));
}

async function captureLocalPropcrm(page, file) {
  await page.goto("http://127.0.0.1:5175", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await injectKaanaToken(page, "portfolio-local-capture");
  await page.reload({ waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  console.log("  OK", file, "(local propcrm)");
}

async function ensureRemindersAuth(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1500);

  const dashboard = page.locator('h1:has-text("Dashboard")');
  if (await dashboard.count()) {
    console.log("  Reminders already signed in");
    return true;
  }

  await page.locator('button[role="tab"]:has-text("Sign in")').click();
  await page.fill("#auth-name", cfg.remindersName);
  await page.fill("#auth-password", cfg.remindersPassword);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3500);

  if (await dashboard.count()) {
    console.log("  Reminders sign-in OK");
    return true;
  }

  await page.locator('button[role="tab"]:has-text("Sign up")').click();
  await page.waitForTimeout(500);
  await page.fill("#auth-name", cfg.remindersName);
  await page.fill("#auth-recovery-email", cfg.remindersRecoveryEmail);
  await page.fill("#auth-password", cfg.remindersPassword);
  await page.locator('button[type="submit"]:has-text("Create account")').click();
  await page.waitForTimeout(5000);

  if (await dashboard.count()) {
    console.log("  Reminders account created");
    return true;
  }

  throw new Error("Reminders auth failed — check Firebase config on Cloud Run");
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

async function captureRemindersTab(page, tabLabel, file) {
  await page.locator('nav[aria-label="Primary navigation"] button').filter({ hasText: tabLabel }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, file), fullPage: false });
  console.log("  OK", file);
}

async function captureInventoryWms(page) {
  const base = cfg.inventoryWmsUrl;
  await page.goto(base, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "inventory-wms-dashboard.png"), fullPage: false });
  console.log("  OK inventory-wms-dashboard.png");

  await page.locator(".nav-item").filter({ hasText: "Inventory" }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "inventory-wms-stock.png"), fullPage: false });
  console.log("  OK inventory-wms-stock.png");

  const firstRow = page.locator(".tbl-row").first();
  if (await firstRow.count()) {
    await firstRow.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, "inventory-wms-detail.png"), fullPage: false });
    console.log("  OK inventory-wms-detail.png");
  }

  await page.locator(".nav-item").filter({ hasText: "Reports" }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "inventory-wms-reports.png"), fullPage: false });
  console.log("  OK inventory-wms-reports.png");

  await page.locator(".nav-item").filter({ hasText: "Purchase Orders" }).click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "inventory-wms-orders.png"), fullPage: false });
  console.log("  OK inventory-wms-orders.png");
}

async function runCaseStudy(name, fn) {
  console.log(`\n=== ${name} ===`);
  try {
    await fn();
  } catch (err) {
    console.error(`  FAIL ${name}:`, err.message);
  }
}

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

// ── 1. Kaana Business Automation Suite ─────────────────────────────────────
await runCaseStudy("Kaana Business Automation Suite", async () => {
  let auth;
  try {
    auth = await resolveKaanaAuth(context.request);
  } catch (err) {
    console.error("  Auth failed:", err.message);
  }

  const uiOk = await loginPlatformUi(page);
  if (uiOk) {
    await page.screenshot({ path: path.join(outDir, "kaana-app-ui.png"), fullPage: false });
    console.log("  OK kaana-app-ui.png (UI login)");
  } else if (auth) {
    await captureWithKaanaAuth(
      page,
      "https://app.kaana.in/dashboard",
      "kaana-app-ui.png",
      auth,
      4000,
    );
  }

  if (auth) {
    try {
      await captureWithKaanaAuth(
        page,
        "https://inbox.kaana.in",
        "botiq-inbox-ui.png",
        auth,
        4500,
      );
      if (await page.locator(".login-gate").count()) throw new Error("inbox still gated");
      if (!(await page.locator(".inbox-shell, .inbox-list").count())) {
        throw new Error("inbox UI not rendered");
      }
    } catch (inboxErr) {
      console.warn("  Inbox live capture failed:", inboxErr.message);
      try {
        await captureLocalBotiq(page, "botiq-inbox-ui.png");
      } catch (localErr) {
        console.error("  FAIL local botiq:", localErr.message);
      }
    }

    try {
      await captureWithKaanaAuth(
        page,
        "https://crm.kaana.in",
        "propcrm-ui.png",
        auth,
        4500,
      );
    } catch {
      await captureLocalPropcrm(page, "propcrm-ui.png");
    }
  } else {
    await captureLocalPropcrm(page, "propcrm-ui.png");
    await captureLocalBotiq(page, "botiq-inbox-ui.png");
  }

  const clinicOk = await loginClinicForm(
    page,
    "https://crm.dentacare.kaana.in",
  );
  if (clinicOk) {
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: path.join(outDir, "clinic-crm-ui.png"),
      fullPage: false,
    });
    console.log("  OK clinic-crm-ui.png");
  } else {
    const altOk = await loginClinicForm(
      page,
      "https://clinic.kaana.in/?tenant=dentacare",
    );
    if (altOk) {
      await page.waitForTimeout(2500);
      await page.screenshot({
        path: path.join(outDir, "clinic-crm-ui.png"),
        fullPage: false,
      });
      console.log("  OK clinic-crm-ui.png (clinic.kaana.in)");
    }
  }
});

// ── 2. Offline Aquaculture Operations ────────────────────────────────────────
await runCaseStudy("Offline Aquaculture Operations", async () => {
  await capture(page, "https://aquafarm.kaana.in/login", "aquafarm-ui.png", 3500);
  const authed = await aquafarmApiAuth(context.request, page);
  if (authed) {
    await capture(page, "https://aquafarm.kaana.in/dashboard", "aquafarm-dashboard.png", 3500);
    await capture(page, "https://aquafarm.kaana.in/feeding/entry", "aquafarm-feeding.png", 3500);
    await capture(page, "https://aquafarm.kaana.in/inventory", "aquafarm-inventory.png", 3500);
    await capture(page, "https://aquafarm.kaana.in/approvals", "aquafarm-approvals.png", 3500);
  } else {
    console.warn("  SKIP authenticated aquafarm shots — API login failed");
  }
});

// ── 3. Student Recognition Platform (Faralin) ────────────────────────────────
await runCaseStudy("Student Recognition Platform", async () => {
  await capture(page, "https://faralin.kaana.in", "faralin-web-ui.png", 4000);
  await capture(
    page,
    "https://university.faralin.kaana.in",
    "faralin-university-ui.png",
    4000,
    undefined,
  ).catch(() => console.warn("  SKIP faralin-university-ui.png (Clerk auth)"));
});

// ── 4. Healthcare Clinic Digital Suite ───────────────────────────────────────
await runCaseStudy("Healthcare Clinic Digital Suite", async () => {
  await capture(page, "https://dentacare.kaana.in", "dental-clinic-ui.png", 3500);
  const ok = await loginClinicForm(page, "https://crm.dentacare.kaana.in");
  if (ok) {
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: path.join(outDir, "clinic-crm-ui.png"),
      fullPage: false,
    });
    console.log("  OK clinic-crm-ui.png");
    await capture(page, page.url(), "clinic-desk-today.png", 3500);
  }
});

// ── 5. Restaurant QR Digital Menu ────────────────────────────────────────────
await runCaseStudy("Restaurant QR Digital Menu", async () => {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();

  await capture(
    mobilePage,
    "https://newramsai.menu.kaana.in",
    "qr-menu-hero.png",
    3000,
  );
  await capture(
    mobilePage,
    "https://newramsai.menu.kaana.in",
    "qr-menu-app.png",
    3500,
    async (p) => {
      const menuBtn = p.locator("button").filter({ hasText: /menu/i }).first();
      if (await menuBtn.count()) await menuBtn.click().catch(() => {});
    },
  );
  await capture(
    mobilePage,
    "https://newramsai.menu.kaana.in",
    "qr-menu-ui.png",
    3500,
    async (p) => {
      const addBtn = p.locator("button").filter({ hasText: /add|\+/i }).first();
      if (await addBtn.count()) await addBtn.click().catch(() => {});
    },
  );
  await capture(
    mobilePage,
    "https://newramsai.menu.kaana.in",
    "qr-menu-cart.png",
    2500,
    async (p) => {
      const cartBtn = p.locator("button, a").filter({ hasText: /cart|view order/i }).first();
      if (await cartBtn.count()) await cartBtn.click().catch(() => {});
    },
  );

  await mobile.close();
});

// ── 6. ONLY GODS Storefront ──────────────────────────────────────────────────
await runCaseStudy("ONLY GODS Storefront", async () => {
  await capture(
    page,
    "https://clothing.onlygods.kaana.in",
    "only-gods-ui.png",
    4000,
  ).catch(async () => {
    await capture(page, "http://127.0.0.1:5176", "only-gods-ui.png", 3000);
  });

  await capture(
    page,
    "https://clothing.onlygods.kaana.in",
    "only-gods-product.png",
    3500,
    async (p) => {
      const product = p.locator("a[href*='/product'], a[href*='/products']").first();
      if (await product.count()) await product.click().catch(() => {});
    },
  ).catch(() => console.warn("  SKIP only-gods-product.png"));

  await capture(
    page,
    "https://clothing.onlygods.kaana.in",
    "only-gods-cart.png",
    2500,
    async (p) => {
      const cart = p.locator("button").filter({ hasText: /cart|bag/i }).first();
      if (await cart.count()) await cart.click().catch(() => {});
    },
  ).catch(() => console.warn("  SKIP only-gods-cart.png"));
});

// ── 7. Firebase Productivity PWA ─────────────────────────────────────────────
await runCaseStudy("Firebase Productivity PWA", async () => {
  const url = "https://reminders-bills-pwa-wtba53dhka-el.a.run.app";
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();

  await ensureRemindersAuth(mobilePage, url);
  await seedRemindersDemo(mobilePage);

  await mobilePage.screenshot({
    path: path.join(outDir, "reminders-pwa-ui.png"),
    fullPage: false,
  });
  console.log("  OK reminders-pwa-ui.png");

  await captureRemindersTab(mobilePage, "Today", "reminders-pwa-today.png");
  await captureRemindersTab(mobilePage, "Upcoming", "reminders-pwa-upcoming.png");
  await captureRemindersTab(mobilePage, "Inbox", "reminders-pwa-inbox.png");

  await mobilePage.locator('button[aria-label="Voice settings"]').click();
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({
    path: path.join(outDir, "reminders-pwa-settings.png"),
    fullPage: false,
  });
  console.log("  OK reminders-pwa-settings.png");

  await mobile.close();
});

// ── 8. Inventory Operations Demo (StockFlow WMS) ─────────────────────────────
await runCaseStudy("Inventory Operations Demo", async () => {
  try {
    await captureInventoryWms(page);
  } catch (err) {
    console.warn("  Local inventory-wms failed:", err.message);
    console.warn("  Start: cd inventory-wms && npm run dev -- --port 5177 --host 127.0.0.1");
  }
});

await browser.close();
console.log("\nDone. Output:", outDir);
