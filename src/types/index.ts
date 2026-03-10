export interface Experience {
  title: string;
  company: string;
  location: string | null;
  start_date: string;
  end_date: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface UserProfile {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  summary: string | null;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  languages: string[];
}

export interface JobDescription {
  job_title: string;
  company_name: string;
  location: string | null;
  employment_type: string | null;
  required_skills: string[];
  preferred_skills: string[];
  key_responsibilities: string[];
  required_experience_years: string | null;
  required_education: string | null;
  keywords: string[];
}

export interface Gap {
  gap: string;
  severity: "High" | "Medium" | "Low";
  workaround: string;
}

export interface AuditReport {
  match_score: string;
  match_summary: string;
  strengths: string[];
  gaps: Gap[];
  company_vibe: string;
  company_red_flags: string[];
  strategy: string[];
}

export interface CVContact {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface CVExperience {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: string[];
}

export interface CVOutput {
  name: string;
  contact: CVContact;
  summary: string;
  core_skills: string[];
  experience: CVExperience[];
  education: Education[];
  certifications: string[];
  languages: string[];
}

export interface AppState {
  userProfile: UserProfile | null;
  rawProfileText: string;
  jobDescription: JobDescription | null;
  rawJDText: string;
  auditReport: AuditReport | null;
  cvOutput: CVOutput | null;
  coverLetter: string;
  researchResults: ResearchResults | null;
}

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface ResearchResults {
  culture: TavilyResult[];
  news: TavilyResult[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
