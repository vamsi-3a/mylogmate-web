import { create } from 'zustand';
import type { ContextType } from '@/types/context';
import type { DateType } from '@/types/log';

interface LogFlowState {
  contextType: ContextType | null;
  contextId: string | null;   // selected context UUID
  contextName: string | null; // display label

  dateType: DateType | null;
  dateStart: Date | null;
  dateEnd: Date | null;

  // Actions
  setContext: (type: ContextType, id: string, name: string) => void;
  setDate: (type: DateType, start: Date, end: Date) => void;
  reset: () => void;
}

export const useLogFlowStore = create<LogFlowState>((set) => ({
  contextType: null,
  contextId: null,
  contextName: null,
  dateType: null,
  dateStart: null,
  dateEnd: null,

  setContext: (type, id, name) =>
    set({ contextType: type, contextId: id, contextName: name }),

  setDate: (type, start, end) =>
    set({ dateType: type, dateStart: start, dateEnd: end }),

  reset: () =>
    set({
      contextType: null,
      contextId: null,
      contextName: null,
      dateType: null,
      dateStart: null,
      dateEnd: null,
    }),
}));
