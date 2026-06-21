import type { IndustryConfig } from '../data/industries';

export type HeroJourneyData = {
  businessName: string;
  botName: string;
  botAvatar: string;
  customerName: string;
  customerInitial: string;
  agentName: string;
  enquiry: string;
  botPrompt: string;
  quickReplies: [string, string, string];
  customerPick: string;
  handoffMessage: string;
  agentReply: string;
  crmStageNew: string;
  crmStageQualified: string;
  crmTag: string;
  crmScore: number;
  inboxPreviewIdle: string;
  inboxPreviewHandoff: string;
};

/** Scripted hero journey — derived from industry demo data */
export function getHeroJourney(industry: IndustryConfig): HeroJourneyData {
  const thread = industry.inboxThreads.find((t) => t.active) ?? industry.inboxThreads[0];
  const qualified =
    industry.crmColumns.flatMap((col) =>
      col.cards.map((card) => ({ ...card, stage: col.title })),
    ).find((c) => c.score != null)
    ?? { name: thread.name, tag: thread.preview, score: 78, stage: 'Qualified' };

  const picks = industry.botQuick;
  /* Short hero-only labels — must fit one line inside the phone mock */
  const browse = heroQuickLabel(picks[0] ?? 'Browse', 'Browse', 14);
  const done = heroQuickLabel(picks[1] ?? picks[2] ?? 'Other', 'Other', 14);
  const talkAgent = 'Talk to agent';
  const quickReplies: [string, string, string] = [browse, talkAgent, done];

  const customerOut = industry.heroMessages.find((m) => m.out)?.text
    ?? industry.inboxChat.find((m) => m.type === 'user')?.text
    ?? 'Hi, I wanted to check availability';

  const agentLine = industry.inboxChat.find((m) => m.type === 'agent')?.text
    ?? "She'll WhatsApp you shortly 👋";

  const agentName = 'Priya';

  return {
    businessName: industry.businessName,
    botName: industry.botName,
    botAvatar: industry.botAvatar,
    customerName: thread.name,
    customerInitial: thread.initial,
    agentName,
    enquiry: customerOut.length > 48 ? `${customerOut.slice(0, 45)}…` : customerOut,
    botPrompt: 'Anything else?',
    quickReplies,
    customerPick: talkAgent,
    handoffMessage: `Connecting you with ${agentName}. She'll reach you shortly. 👤`,
    agentReply: agentLine.length > 56 ? `${agentLine.slice(0, 53)}…` : agentLine,
    crmStageNew: industry.crmColumns[0]?.title ?? 'New',
    crmStageQualified: qualified.stage ?? industry.crmColumns[1]?.title ?? 'Qualified',
    crmTag: qualified.tag,
    crmScore: qualified.score ?? 78,
    inboxPreviewIdle: thread.preview,
    inboxPreviewHandoff: 'Agent assigned — needs a call',
  };
}

export const HERO_LOOP_MS = 5400;

export type HeroBeat = 0 | 1 | 2 | 3 | 4 | 5;

/** Short labels for the hero phone — avoids wrapped quick-reply buttons */
function heroQuickLabel(raw: string, fallback: string, maxLen = 16): string {
  const text = raw.replace(/^[^\w\s]+/u, '').trim() || fallback;
  if (text.length <= maxLen) return text;

  const words = text.split(/\s+/);
  const twoWord = words.slice(0, 2).join(' ');
  if (twoWord.length <= maxLen) return twoWord;

  return `${text.slice(0, maxLen - 1)}…`;
}
