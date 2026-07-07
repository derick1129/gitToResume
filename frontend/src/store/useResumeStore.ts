import { create } from 'zustand';
import type { ResumeData, Project, WorkExperience, Education, Certification, OpenSourceContribution } from '../types';

interface ResumeState {
  resumeData: ResumeData | null;
  isLoading: boolean;
  error: string | null;
  loadingStep: number;
  
  // Actions
  setResumeData: (data: ResumeData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLoadingStep: (step: number) => void;
  
  // Field-level updates
  updateField: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  
  // Item-level updates
  updateProject: (index: number, project: Partial<Project>) => void;
  addProject: () => void;
  deleteProject: (index: number) => void;
  
  updateContribution: (index: number, contribution: Partial<OpenSourceContribution>) => void;
  addContribution: () => void;
  deleteContribution: (index: number) => void;

  updateExperience: (index: number, experience: Partial<WorkExperience>) => void;
  addExperience: () => void;
  deleteExperience: (index: number) => void;
  
  updateEducation: (index: number, education: Partial<Education>) => void;
  addEducation: () => void;
  deleteEducation: (index: number) => void;
  
  updateCertification: (index: number, certification: Partial<Certification>) => void;
  addCertification: () => void;
  deleteCertification: (index: number) => void;
  
  // API triggers
  generateResume: (username: string) => Promise<void>;
  exportPdf: () => Promise<void>;
}

const BACKEND_URL = 'http://localhost:8000';

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumeData: null,
  isLoading: false,
  error: null,
  loadingStep: 0,

  setResumeData: (data) => set({ resumeData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLoadingStep: (step) => set({ loadingStep: step }),

  updateField: (field, value) => set((state) => {
    if (!state.resumeData) return {};
    return {
      resumeData: {
        ...state.resumeData,
        [field]: value
      }
    };
  }),

  // Projects Actions
  updateProject: (index, updatedProject) => set((state) => {
    if (!state.resumeData) return {};
    const projects = [...state.resumeData.projects];
    projects[index] = { ...projects[index], ...updatedProject };
    return { resumeData: { ...state.resumeData, projects } };
  }),

  addProject: () => set((state) => {
    if (!state.resumeData) return {};
    const newProject: Project = {
      name: 'New Project',
      description: 'Describe your project here...',
      technologies: [],
      url: ''
    };
    return {
      resumeData: {
        ...state.resumeData,
        projects: [...state.resumeData.projects, newProject]
      }
    };
  }),

  deleteProject: (index) => set((state) => {
    if (!state.resumeData) return {};
    const projects = state.resumeData.projects.filter((_, i) => i !== index);
    return { resumeData: { ...state.resumeData, projects } };
  }),

  // Contributions Actions
  updateContribution: (index, updatedContrib) => set((state) => {
    if (!state.resumeData) return {};
    const contributions = [...state.resumeData.contributions];
    contributions[index] = { ...contributions[index], ...updatedContrib };
    return { resumeData: { ...state.resumeData, contributions } };
  }),

  addContribution: () => set((state) => {
    if (!state.resumeData) return {};
    const newContrib: OpenSourceContribution = {
      repoName: 'New Contribution',
      repoUrl: '',
      description: 'Describe your contribution details...'
    };
    return {
      resumeData: {
        ...state.resumeData,
        contributions: [...state.resumeData.contributions, newContrib]
      }
    };
  }),

  deleteContribution: (index) => set((state) => {
    if (!state.resumeData) return {};
    const contributions = state.resumeData.contributions.filter((_, i) => i !== index);
    return { resumeData: { ...state.resumeData, contributions } };
  }),

  // Experience Actions
  updateExperience: (index, updatedExp) => set((state) => {
    if (!state.resumeData) return {};
    const experience = [...state.resumeData.experience];
    experience[index] = { ...experience[index], ...updatedExp };
    return { resumeData: { ...state.resumeData, experience } };
  }),

  addExperience: () => set((state) => {
    if (!state.resumeData) return {};
    const newExp: WorkExperience = {
      company: 'New Company',
      position: 'Software Engineer',
      startDate: 'Jan 2024',
      endDate: 'Present',
      description: ['Accomplished task A using tech B, resulting in X% improvement.']
    };
    return {
      resumeData: {
        ...state.resumeData,
        experience: [...state.resumeData.experience, newExp]
      }
    };
  }),

  deleteExperience: (index) => set((state) => {
    if (!state.resumeData) return {};
    const experience = state.resumeData.experience.filter((_, i) => i !== index);
    return { resumeData: { ...state.resumeData, experience } };
  }),

  // Education Actions
  updateEducation: (index, updatedEdu) => set((state) => {
    if (!state.resumeData) return {};
    const education = [...state.resumeData.education];
    education[index] = { ...education[index], ...updatedEdu };
    return { resumeData: { ...state.resumeData, education } };
  }),

  addEducation: () => set((state) => {
    if (!state.resumeData) return {};
    const newEdu: Education = {
      institution: 'University Name',
      degree: 'B.S. in Computer Science',
      startDate: '2020',
      endDate: '2024'
    };
    return {
      resumeData: {
        ...state.resumeData,
        education: [...state.resumeData.education, newEdu]
      }
    };
  }),

  deleteEducation: (index) => set((state) => {
    if (!state.resumeData) return {};
    const education = state.resumeData.education.filter((_, i) => i !== index);
    return { resumeData: { ...state.resumeData, education } };
  }),

  // Certification Actions
  updateCertification: (index, updatedCert) => set((state) => {
    if (!state.resumeData) return {};
    const certifications = [...state.resumeData.certifications];
    certifications[index] = { ...certifications[index], ...updatedCert };
    return { resumeData: { ...state.resumeData, certifications } };
  }),

  addCertification: () => set((state) => {
    if (!state.resumeData) return {};
    const newCert: Certification = {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      date: '2024'
    };
    return {
      resumeData: {
        ...state.resumeData,
        certifications: [...state.resumeData.certifications, newCert]
      }
    };
  }),

  deleteCertification: (index) => set((state) => {
    if (!state.resumeData) return {};
    const certifications = state.resumeData.certifications.filter((_, i) => i !== index);
    return { resumeData: { ...state.resumeData, certifications } };
  }),

  // Async API actions
  generateResume: async (username: string) => {
    set({ isLoading: true, error: null, loadingStep: 0, resumeData: null });
    
    // Animate loading steps sequentially
    const stepInterval = setInterval(() => {
      set((state) => {
        if (state.loadingStep < 4) {
          return { loadingStep: state.loadingStep + 1 };
        }
        return {};
      });
    }, 4500);

    try {
      const response = await fetch(`${BACKEND_URL}/api/resume/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate resume.');
      }

      const data = await response.json();
      set({ resumeData: data });
    } catch (err: any) {
      logger.error('Generation error:', err);
      set({ error: err.message || 'An error occurred during resume generation.' });
    } finally {
      clearInterval(stepInterval);
      set({ isLoading: false });
    }
  },

  exportPdf: async () => {
    const { resumeData } = get();
    if (!resumeData) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/resume/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF.');
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume_${resumeData.name.toLowerCase().replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF export error:', err);
      alert('Error exporting PDF: ' + err.message);
    }
  }
}));

// Simple logger helper for TS compilation
const logger = {
  error: (...args: any[]) => console.error('[Store]', ...args)
};
