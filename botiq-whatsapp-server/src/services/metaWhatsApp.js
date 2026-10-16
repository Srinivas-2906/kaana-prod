const DEFAULT_VERSION = process.env.META_API_VERSION || 'v22.0';

function graphUrl(path, params = {}) {
  const url = new URL(`https://graph.facebook.com/${DEFAULT_VERSION}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') url.searchParams.set(key, String(value));
  }
  return url;
}

async function graphJson(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || res.statusText || 'Graph API error';
    const err = new Error(msg);
    err.status = res.status;
    err.graph = body?.error;
    throw err;
  }
  return body;
}

/** Safe Graph API error payload for API responses (no tokens). */
export function graphErrorToClient(err) {
  const graph = err?.graph;
  return {
    error: err?.message || 'Graph API error',
    code: graph?.code ?? null,
    type: graph?.type ?? null,
    error_subcode: graph?.error_subcode ?? null,
    fbtrace_id: graph?.fbtrace_id ?? null,
  };
}

const TEMPLATE_FIELDS = 'name,status,category,language,components,id';

export function normalizeMessageTemplate(row) {
  const components = row?.components ?? [];
  const bodyComp = components.find((c) => String(c.type).toUpperCase() === 'BODY');
  let body = bodyComp?.text ?? '';
  if (!body && bodyComp?.example?.body_text?.[0]) {
    body = bodyComp.example.body_text[0].join(' ');
  }
  return {
    id: row.id ?? null,
    name: row.name ?? '',
    status: row.status ?? 'UNKNOWN',
    category: row.category ?? '',
    language: row.language ?? '',
    body,
  };
}

/** List message templates on the tenant WABA. */
export async function listMessageTemplates(wabaId, accessToken, { limit = 100 } = {}) {
  const url = graphUrl(`${wabaId}/message_templates`, {
    fields: TEMPLATE_FIELDS,
    limit: Math.min(Math.max(limit, 1), 250),
  });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await graphJson(res);
  const data = (body.data ?? []).map(normalizeMessageTemplate);
  return { data, paging: body.paging ?? null };
}

/** Create and submit a message template to Meta for review. */
export async function createMessageTemplate(wabaId, accessToken, { name, language, category, bodyText }) {
  const url = graphUrl(`${wabaId}/message_templates`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      language,
      category,
      components: [{ type: 'BODY', text: bodyText }],
    }),
  });
  const body = await graphJson(res);
  return normalizeMessageTemplate({
    id: body.id,
    name: body.name ?? name,
    status: body.status ?? 'PENDING',
    category: body.category ?? category,
    language: body.language ?? language,
    components: [{ type: 'BODY', text: bodyText }],
  });
}

/** Fetch latest status for a template by name (refreshes from WABA list). */
export async function getMessageTemplateStatus(wabaId, accessToken, name) {
  const url = graphUrl(`${wabaId}/message_templates`, {
    fields: TEMPLATE_FIELDS,
    name,
  });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await graphJson(res);
  const row = (body.data ?? []).find((t) => t.name === name);
  if (!row) {
    const err = new Error('Template not found on WABA');
    err.status = 404;
    throw err;
  }
  return normalizeMessageTemplate(row);
}
