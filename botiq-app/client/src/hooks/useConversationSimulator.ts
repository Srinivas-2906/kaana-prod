import { useCallback, useEffect, useRef, useState } from 'react';
import { demoFlow } from '../data/mockData';
import type { ChannelId, ChatMessage, FlowStep, SpeedId } from '../types';
import { nowTime } from '../utils/format';

const SPEED_MS: Record<SpeedId, number> = {
  '1x': 800,
  '2x': 400,
  fast: 150,
};

const STEP_LABELS: Record<string, string> = {
  bot: 'Bot responding',
  quickReplies: 'Waiting for user choice',
  user: 'User message',
  propertyCards: 'Showing listings',
  finalButtons: 'Conversation complete',
};

function stepToMessages(step: FlowStep, id: string): ChatMessage[] {
  const ts = nowTime();
  if (step.kind === 'bot') {
    return [{ id, role: 'bot', text: step.text, timestamp: ts, delivered: true, read: true }];
  }
  if (step.kind === 'user') {
    return [{ id, role: 'user', text: step.text, timestamp: ts }];
  }
  if (step.kind === 'quickReplies') {
    return [{ id, role: 'bot', quickReplies: step.options, timestamp: ts }];
  }
  if (step.kind === 'propertyCards') {
    return [{ id, role: 'bot', propertyCards: step.cards, timestamp: ts, delivered: true }];
  }
  if (step.kind === 'finalButtons') {
    return [{ id, role: 'bot', actionButtons: step.options, timestamp: ts, delivered: true, read: true }];
  }
  return [];
}

function typingDelay(text: string | undefined, base: number) {
  if (!text) return base * 0.6;
  return Math.min(base * 2, base + text.length * 12);
}

export function useConversationSimulator(channel: ChannelId, speed: SpeedId) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedReply, setHighlightedReply] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('Starting…');

  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);
  const pausedRef = useRef(false);

  const totalSteps = demoFlow.length;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const wait = (ms: number, runId: number) =>
    new Promise<void>((resolve) => {
      const tick = () => {
        if (runId !== runIdRef.current) return resolve();
        if (pausedRef.current) {
          timerRef.current = setTimeout(tick, 100);
          return;
        }
        timerRef.current = setTimeout(resolve, ms);
      };
      tick();
    });

  const reset = useCallback(() => {
    clearTimer();
    runIdRef.current += 1;
    stepRef.current = 0;
    setMessages([]);
    setIsTyping(false);
    setHighlightedReply(null);
    setIsComplete(false);
    setProgress(0);
    setStepLabel('Starting…');
    setIsPaused(false);
    pausedRef.current = false;
  }, []);

  const replay = useCallback(() => reset(), [reset]);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  }, []);

  useEffect(() => {
    reset();
    const runId = runIdRef.current;
    const baseDelay = SPEED_MS[speed];

    const runFlow = async () => {
      await wait(500, runId);

      while (stepRef.current < demoFlow.length) {
        if (runId !== runIdRef.current) return;
        const step = demoFlow[stepRef.current];
        setProgress(Math.round((stepRef.current / totalSteps) * 100));
        setStepLabel(STEP_LABELS[step.kind] ?? 'Processing…');

        if (step.kind === 'bot') {
          setIsTyping(true);
          await wait(typingDelay(step.text, baseDelay), runId);
          if (runId !== runIdRef.current) return;
          setIsTyping(false);
          setMessages((m) => [...m, ...stepToMessages(step, `msg-${stepRef.current}`)]);
          stepRef.current += 1;
          await wait(baseDelay * 0.5, runId);
          continue;
        }

        if (step.kind === 'quickReplies') {
          setMessages((m) => [...m, ...stepToMessages(step, `qr-${stepRef.current}`)]);
          const selected = step.options?.[step.autoSelect ?? 0] ?? '';
          setHighlightedReply(selected);
          await wait(baseDelay * 1.8, runId);
          if (runId !== runIdRef.current) return;
          setHighlightedReply(null);
          setMessages((m) => [
            ...m,
            { id: `u-${stepRef.current}`, role: 'user', text: selected, timestamp: nowTime() },
          ]);
          stepRef.current += 1;
          await wait(baseDelay * 0.4, runId);
          continue;
        }

        if (step.kind === 'user') {
          setMessages((m) => [...m, ...stepToMessages(step, `u-${stepRef.current}`)]);
          stepRef.current += 1;
          await wait(baseDelay * 0.35, runId);
          continue;
        }

        if (step.kind === 'propertyCards') {
          setIsTyping(true);
          await wait(baseDelay * 1.2, runId);
          if (runId !== runIdRef.current) return;
          setIsTyping(false);
          setMessages((m) => [...m, ...stepToMessages(step, `pc-${stepRef.current}`)]);
          stepRef.current += 1;
          await wait(baseDelay * 1.5, runId);
          continue;
        }

        if (step.kind === 'finalButtons') {
          setMessages((m) => [...m, ...stepToMessages(step, `fb-${stepRef.current}`)]);
          stepRef.current += 1;
          setProgress(100);
          setStepLabel('Booking confirmed ✓');
          setIsComplete(true);
          return;
        }

        stepRef.current += 1;
      }
    };

    runFlow();
    return clearTimer;
  }, [channel, speed, reset, totalSteps]);

  return {
    messages,
    isTyping,
    highlightedReply,
    isComplete,
    isPaused,
    progress,
    stepLabel,
    replay,
    togglePause,
  };
}
