export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  stars?: number;
  forks?: number;
}

export interface OpenSourceContribution {
  repoName: string;
  repoUrl: string;
  description: string;
  stars?: number;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface ResumeData {
  name: string;
  headline: string;
  summary: string;
  email: string;
  phone: string;
  website: string;
  githubUrl: string;
  skills: string[];
  projects: Project[];
  contributions: OpenSourceContribution[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
}
