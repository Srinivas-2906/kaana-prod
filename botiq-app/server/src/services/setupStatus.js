/**
 * Customer-facing setup progress — scales from concierge to self-serve.
 * Each step: complete | current | pending
 */

const STEPS = [
  { id: 'signup', label: 'Signup complete' },
  { id: 'questionnaire', label: 'Questionnaire complete' },
  { id: 'meta_setup', label: 'Meta setup' },
  { id: 'whatsapp_connection', label: 'WhatsApp connection' },
  { id: 'activation', label: 'Activation' },
  { id: 'live', label: 'Live' },
];

function daysUntil(iso) {
  if (!iso) return null;
  const end = new Date(iso);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * @param {object} row - tenants row
 * @param {object|null} intake - parsed intake
 */
export function getSetupStatus(row, intake) {
  if (!row) {
    return { steps: STEPS.map((s) => ({ ...s, status: 'pending' })), currentStep: 'signup' };
  }

  const questionnaireDone = intake?.status === 'submitted' || intake?.status === 'reviewed';
  const isLive = row.status === 'active';
  const waDone = !!(row.whatsapp_phone_id && row.whatsapp_token);

  let currentStep = 'signup';
  if (!questionnaireDone) currentStep = 'questionnaire';
  else if (!isLive) currentStep = 'meta_setup';
  else if (!waDone) currentStep = 'whatsapp_connection';
  else currentStep = 'live';

  const steps = STEPS.map(({ id, label }) => {
    let status = 'pending';

    switch (id) {
      case 'signup':
        status = 'complete';
        break;
      case 'questionnaire':
        if (questionnaireDone) status = 'complete';
        else if (currentStep === 'questionnaire') status = 'current';
        break;
      case 'meta_setup':
        if (isLive) status = 'complete';
        else if (questionnaireDone && currentStep === 'meta_setup') status = 'current';
        else if (questionnaireDone) status = 'pending';
        break;
      case 'whatsapp_connection':
        if (waDone) status = 'complete';
        else if (isLive && currentStep === 'whatsapp_connection') status = 'current';
        break;
      case 'activation':
        if (isLive) status = 'complete';
        else if (questionnaireDone && currentStep === 'meta_setup') status = 'current';
        break;
      case 'live':
        if (isLive && waDone) status = 'complete';
        else if (isLive && currentStep === 'whatsapp_connection') status = 'current';
        break;
      default:
        break;
    }

    return { id, label, status };
  });

  const trialDaysLeft = daysUntil(row.trial_ends_at);

  return {
    steps,
    currentStep,
    questionnaireDone,
    isLive,
    whatsappConnected: waDone,
    trialEndsAt: row.trial_ends_at || null,
    trialEndsAtFormatted: fmtDate(row.trial_ends_at),
    trialDaysLeft,
    trialStarted: isLive && !!row.trial_ends_at,
    intakeSubmittedAt: intake?.submittedAt || null,
  };
}
