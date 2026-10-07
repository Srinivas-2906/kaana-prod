# Meta WhatsApp Tech Provider — Setup Runbook

**App:** Kaana Platform · **App ID:** `27724398370520714`  
**Branch:** `feature/meta-whatsapp-tech-provider`

This runbook lists exact values to paste into the Meta App Dashboard and the order to complete verification. Code changes in this branch prepare Kaana for Embedded Signup; Meta-side steps require dashboard access.

---

## URLs to paste in App Dashboard → Settings → Basic

| Field | URL |
|-------|-----|
| Privacy policy | `https://kaana.in/privacy-policy` |
| Terms of service | `https://kaana.in/terms-of-service` |
| Data deletion instructions | `https://kaana.in/data-deletion` |
| User data deletion callback | `https://api.kaana.in/meta/data-deletion` |
| Deauthorize callback URL | `https://api.kaana.in/meta/deauthorize` |

> **Deploy note:** `api.kaana.in` must serve `botiq-whatsapp-server` (not the marketing site). If `/health` or `/webhook` return 404, redeploy the API service from `cloudbuild.yaml` before configuring Meta webhooks.

---

## Webhooks (App Dashboard → WhatsApp → Configuration)

| Setting | Value |
|---------|--------|
| Callback URL | `https://api.kaana.in/webhook` |
| Verify token | Same as `WHATSAPP_VERIFY_TOKEN` on the API server |
| Object | `whatsapp_business_account` |

**Subscribe fields:**

- `messages`
- `message_template_status_update`
- `account_update`
- `phone_number_quality_update`

Test verification locally:

```bash
cd botiq-whatsapp-server
WHATSAPP_VERIFY_TOKEN=your_token ./scripts/verify-webhook.sh https://api.kaana.in
```

---

## Facebook Login for Business (Embedded Signup)

**App Dashboard → Facebook Login for Business → Configurations → Create**

| Setting | Value |
|---------|--------|
| Asset | **WhatsApp accounts** only |
| Permissions | `whatsapp_business_management`, `whatsapp_business_messaging` |

Save the **Configuration ID** → set as `META_ES_CONFIG_ID` on the API server.

**App domains / JS SDK host domains:**

- `app.kaana.in`
- `kaana.in` (if ES is launched from marketing pages)

**Valid OAuth redirect URIs:** add any redirect URIs required by your Login for Business config (often `https://app.kaana.in/`).

---

## API server environment (`botiq-whatsapp-server`)

Add to production secrets / Cloud Run env:

```env
META_APP_ID=27724398370520714
META_APP_SECRET=<from App Dashboard → Settings → Basic → App secret>
META_ES_CONFIG_ID=<from Login for Business configuration>
META_API_VERSION=v22.0
WHATSAPP_VERIFY_TOKEN=<strong random string — same in Meta webhook config>
KAANA_SITE_URL=https://kaana.in
WHATSAPP_PROVIDER=meta
```

---

## Manual dashboard checklist (in order)

### Phase 1 — Do now

- [ ] **Verify contact email** — App Dashboard → Settings → Basic → `navyateja919@gmail.com`
- [ ] **Deploy kaana.in** with `/data-deletion` page (this branch)
- [ ] **Deploy api.kaana.in** with `/meta/data-deletion` and `/webhook` endpoints
- [ ] Paste **privacy**, **terms**, **data deletion** URLs in Basic settings
- [ ] **Cancel stuck App Review submission** — App Review → withdraw draft blocking new submit
- [ ] **Complete Data Use Checkup** — [data-use-checkup](https://developers.facebook.com/apps/27724398370520714/data-use-checkup/)
- [ ] **Configure webhooks** (callback URL + verify token + fields above)
- [ ] **Create Embedded Signup configuration** and set `META_ES_CONFIG_ID`

### Phase 2 — Business Verification

- [ ] App Dashboard → Use cases → WhatsApp → **Tech Provider onboarding** → Start verification
- [ ] Submit business documents in Meta Business Manager

### Phase 3 — API precheck (before App Review submit)

Using **App Dashboard → WhatsApp → API Setup** (or your dev WABA):

1. **whatsapp_business_messaging** — send test message to a registered test recipient:
   ```http
   POST /v22.0/{PHONE_NUMBER_ID}/messages
   ```
2. **whatsapp_business_management** — create a message template on your WABA:
   ```http
   POST /v22.0/{WABA_ID}/message_templates
   ```

### Phase 4 — App Review

Submit **Advanced Access** for:

- `whatsapp_business_messaging` — separate screencast: send message from Kaana/API Setup → received on phone
- `whatsapp_business_management` — separate screencast: create template in Kaana or WhatsApp Manager

**Written use cases** — see `META_APP_REVIEW.md`.

Do **not** request: `business_management`, `manage_app_solution`, Ads, Instagram, or Pages permissions.

### Phase 5 — After App Review approval

- [ ] Switch app to **Live** mode
- [ ] Complete **Access Verification** — Settings → Basic → Verifications → Access verification
- [ ] Claim **sandbox account** for dev testing (WhatsApp → Quickstart → Testing Integrations)

### Phase 6 — First real customer

- [ ] Customer completes Embedded Signup on `app.kaana.in` dashboard
- [ ] Kaana exchanges code → stores business token → registers phone → subscribes WABA webhooks
- [ ] Customer adds **payment method** to their WABA (Tech Provider billing — Meta bills customer directly)
- [ ] Send + receive first production message

---

## Onboarding limits

| Stage | Limit |
|-------|-------|
| Before BV + App Review + Access Verification | 10 new customers / 7 days |
| After all three complete | 200 new customers / 7 days |

---

## MCP quick status check

Use Meta Developer Tools MCP in Cursor:

```
devtools_app_review → privileges, requirements
devtools_compliance → status
devtools_webhook_list → list_subscriptions
devtools_api_usage → call_volume (api_precheck)
```

---

## Related files in this branch

| Path | Purpose |
|------|---------|
| `kaana/src/app/data-deletion/` | Public deletion instructions + status page |
| `botiq-whatsapp-server/src/routes/meta.js` | Meta data deletion + deauthorize callbacks |
| `botiq-whatsapp-server/src/services/metaWhatsApp.js` | ES token exchange, register, subscribe |
| `kaana-platform/src/components/WhatsAppEmbeddedSignup.tsx` | Dashboard ES button |
| `META_APP_REVIEW.md` | Reviewer instructions and use case text |
