# Meta App Review — Bot IQ by Kaana

**App ID:** `27724398370520714` (Meta app display name: **Kaana Platform**)  
**Product shown to customers:** **Bot IQ** (WhatsApp inbox, templates, automation) — operated by Kaana  
**Partner type:** WhatsApp Tech Provider  
**Permissions requested:** `whatsapp_business_messaging`, `whatsapp_business_management` only

Provisioning details (no credentials in repo): see **`BOTIQ_META_REVIEWER_SETUP.md`**.

---

## Reviewer instructions

1. Log in to **Bot IQ** at `https://app.kaana.in/login` with the provisioned review account (Meta app role: Admin/Developer/Tester on `27724398370520714`).
2. Open `https://app.kaana.in/dashboard` — confirm WhatsApp is connected.
3. **Inbox:** Open Bot IQ Inbox, send/receive a real WhatsApp message on the connected number.
4. **Templates:** Open `https://app.kaana.in/templates`, create and submit a template, refresh Meta status.
5. Each permission has its **own screencast** — do not combine into one video.

**Test credentials:** Contact `kaana.srinivas@gmail.com` for a reviewer test account if needed.

---

## whatsapp_business_messaging

### Written use case

Kaana is a WhatsApp Tech Provider. Independent businesses connect their own WhatsApp Business Accounts through Meta Embedded Signup. After authorization, Kaana sends automated and agent-initiated messages on behalf of each business — appointment reminders, booking confirmations, lead follow-ups, and two-way customer support — using the WhatsApp Cloud API (`POST /{phone-number-id}/messages`). Kaana also receives inbound messages and delivery/read status webhooks for the connected business phone number.

### Screencast must show

1. A message composed and sent from **Bot IQ Inbox** (or API Setup cURL).
2. The same message appearing in the WhatsApp client (mobile or web) on the recipient device.

### API precheck

```bash
POST https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {token-with-whatsapp_business_messaging}

{
  "messaging_product": "whatsapp",
  "to": "{TEST_RECIPIENT}",
  "type": "text",
  "text": { "body": "Kaana App Review — messaging precheck" }
}
```

---

## whatsapp_business_management

### Written use case

After Embedded Signup, Kaana accesses each customer’s WhatsApp Business Account to manage automation assets: list phone numbers, create and submit message templates, subscribe webhooks on the customer WABA, and read WABA settings required for multi-tenant operation. Kaana does not access unrelated Meta Business portfolios — only WABAs explicitly granted by the customer during Embedded Signup.

### Screencast must show

1. Creating a message template via **Bot IQ → Dashboard → WhatsApp templates** (`/templates`), or WhatsApp Manager / API.
2. Template visible in pending/approved state on the WABA (use **Refresh status** in the UI).

### API precheck

```bash
POST https://graph.facebook.com/v22.0/{WABA_ID}/message_templates
Authorization: Bearer {token-with-whatsapp_business_management}

{
  "name": "kaana_app_review_precheck",
  "language": "en",
  "category": "UTILITY",
  "components": [
    {
      "type": "BODY",
      "text": "Kaana App Review template precheck."
    }
  ]
}
```

---

## Permissions NOT requested (and why)

| Permission | Why not |
|------------|---------|
| `business_management` | Tech Providers use business tokens from Embedded Signup; not needed for portfolio API or credit-line sharing |
| `manage_app_solution` | Kaana is not joining a Multi-Partner Solution with another Solution Partner |
| `ads_read` | Not using Marketing Messages Lite Insights API |
| Facebook Pages / Instagram / Ads | Out of scope for WhatsApp automation |

---

## Data handling summary (Data Use Checkup)

- **Data collected:** Business account info, WhatsApp message content, phone numbers, conversation metadata, template definitions.
- **Purpose:** Provide WhatsApp automation, inbox, and CRM services to business customers.
- **Sharing:** Meta (WhatsApp Cloud API), cloud hosting provider, payment processor (Razorpay) where applicable.
- **Deletion:** `https://kaana.in/data-deletion` and automated callback at `https://api.kaana.in/meta/data-deletion`
- **Retention:** While account is active + legal/compliance period after deletion request.

---

## Embedded Signup configuration

Facebook Login for Business configuration includes:

- Asset: **WhatsApp accounts**
- Permissions: `whatsapp_business_management`, `whatsapp_business_messaging`

Both permissions appear on the authorization screen only after **Advanced Access** approval and app is in **Live** mode (except for app role holders in Development mode).

---

## Branding (reviewer-facing)

| Surface | Label today | Reviewer guidance |
|---------|-------------|-------------------|
| Customer product | **Bot IQ** | Use in screencasts and written use cases |
| Legal / company | **Kaana** | Privacy, terms, data deletion on `kaana.in` |
| Meta Developer app | **Kaana Platform** | App ID `27724398370520714`; do not rename without Meta dashboard approval |
| Login / dashboard host | `app.kaana.in` | OK — state “Bot IQ by Kaana” in App Review notes |

**Confusing gaps to fix before submission (dashboard URLs, not code):** Meta **basic settings** currently show null `privacy_policy_url`, `terms_of_service_url`, and `data_deletion_url` — point these to `https://kaana.in/privacy-policy`, terms page, and `https://kaana.in/data-deletion` in App Dashboard → Settings → Basic.
