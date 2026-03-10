import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  JobDescription,
  AuditReport,
  CVOutput,
  ResearchResults,
  ChatMessage,
} from "@/types";

interface AppStore {
  // Profile
  userProfile: UserProfile | null;
  rawProfileText: string;
  setUserProfile: (profile: UserProfile) => void;
  setRawProfileText: (text: string) => void;

  // Job Description
  jobDescription: JobDescription | null;
  rawJDText: string;
  setJobDescription: (jd: JobDescription) => void;
  setRawJDText: (text: string) => void;

  // Research
  researchResults: ResearchResults | null;
  setResearchResults: (results: ResearchResults) => void;

  // Audit
  auditReport: AuditReport | null;
  setAuditReport: (report: AuditReport) => void;

  // Generated CV + Cover Letter
  cvOutput: CVOutput | null;
  coverLetter: string;
  setCVOutput: (cv: CVOutput) => void;
  setCoverLetter: (letter: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;

  // Reset
  resetAll: () => void;
}

const initialState = {
  userProfile: null,
  rawProfileText: "",
  jobDescription: null,
  rawJDText: "",
  researchResults: null,
  auditReport: null,
  cvOutput: null,
  coverLetter: "",
  chatMessages: [],
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUserProfile: (profile) => set({ userProfile: profile }),
      setRawProfileText: (text) => set({ rawProfileText: text }),

      setJobDescription: (jd) => set({ jobDescription: jd }),
      setRawJDText: (text) => set({ rawJDText: text }),

      setResearchResults: (results) => set({ researchResults: results }),

      setAuditReport: (report) => set({ auditReport: report }),

      setCVOutput: (cv) => set({ cvOutput: cv }),
      setCoverLetter: (letter) => set({ coverLetter: letter }),

      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      clearChatMessages: () => set({ chatMessages: [] }),

      resetAll: () => set(initialState),
    }),
    {
      name: "hada-madrina-session",
    }
  )
);
