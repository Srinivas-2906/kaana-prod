import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import '@excalidraw/excalidraw/index.css';

const Excalidraw = lazy(async () => {
  const mod = await import('@excalidraw/excalidraw');
  return { default: mod.Excalidraw };
});

type Props = {
  sceneJson: string | null;
  onSave: (sceneJson: string) => void;
};

function parseScene(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function DiagramBoard({ sceneJson, onSave }: Props) {
  const timerRef = useRef<number | null>(null);
  const initialData = parseScene(sceneJson);

  const scheduleSave = useCallback((elements: readonly unknown[], appState: unknown, files: unknown) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const state = appState as { viewBackgroundColor?: string; gridSize?: number };
      const payload = JSON.stringify({
        type: 'excalidraw',
        version: 2,
        source: 'kaana-tracker',
        elements,
        appState: {
          viewBackgroundColor: state.viewBackgroundColor,
          gridSize: state.gridSize,
        },
        files,
      });
      onSave(payload);
    }, 800);
  }, [onSave]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="diagram-board">
      <Suspense fallback={<p className="muted diagram-board-loading">Loading diagram editor…</p>}>
        <Excalidraw
          initialData={initialData || undefined}
          onChange={scheduleSave}
          UIOptions={{ tools: { image: false } }}
        />
      </Suspense>
    </div>
  );
}
