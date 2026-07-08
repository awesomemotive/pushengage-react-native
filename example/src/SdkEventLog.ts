// Lightweight in-memory event log used by the demo home screen to surface
// SDK call results without forcing users to wire up logcat / Console.app.
// Pattern mirrors the native demos' SdkEventLog (Android Java, iOS Swift).

export type SdkEventLevel = 'info' | 'success' | 'error';

export interface SdkEvent {
  id: number;
  timestamp: number;
  level: SdkEventLevel;
  title: string;
  detail?: string;
}

type Listener = (events: SdkEvent[]) => void;

const MAX_EVENTS = 50;

let nextId = 1;
let events: SdkEvent[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(events);
}

export const SdkEventLog = {
  log(level: SdkEventLevel, title: string, detail?: string) {
    const event: SdkEvent = {
      id: nextId++,
      timestamp: Date.now(),
      level,
      title,
      detail,
    };
    events = [event, ...events].slice(0, MAX_EVENTS);
    emit();
  },

  info(title: string, detail?: string) {
    this.log('info', title, detail);
  },

  success(title: string, detail?: string) {
    this.log('success', title, detail);
  },

  error(title: string, detail?: string) {
    this.log('error', title, detail);
  },

  clear() {
    events = [];
    emit();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(events);
    return () => {
      listeners.delete(listener);
    };
  },

  snapshot(): SdkEvent[] {
    return events;
  },
};
