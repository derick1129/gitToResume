import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  ChevronLeft, 
  PlusCircle, 
  Briefcase, 
  GraduationCap, 
  Award,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useResumeStore } from './store/useResumeStore';

// Custom GitHub icon component
const Github = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide ${className}`}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Custom inline editable text component
interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit...',
  multiline = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== value) {
      onChange(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          className={`w-full bg-neutral-50 px-1 py-0.5 rounded outline-none border border-neutral-200 text-foreground resize-y ${className}`}
          rows={3}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-neutral-50 px-1 py-0.5 rounded outline-none border border-neutral-200 text-foreground ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-neutral-50 hover:shadow-[0_0_0_2px_#F9F9F9] focus:bg-neutral-50 rounded px-1 transition duration-150 inline-block min-w-[20px] ${
        !value ? 'text-neutral-300 italic' : ''
      } ${className}`}
    >
      {value || placeholder}
    </span>
  );
};

export default function App() {
  const [githubInput, setGithubInput] = useState('');
  
  const {
    resumeData,
    isLoading,
    error,
    loadingStep,
    generateResume,
    exportPdf,
    setResumeData,
    updateField,
    updateProject,
    addProject,
    deleteProject,
    updateContribution,
    addContribution,
    deleteContribution,
    updateExperience,
    addExperience,
    deleteExperience,
    updateEducation,
    addEducation,
    deleteEducation,
    updateCertification,
    addCertification,
    deleteCertification,
  } = useResumeStore();

  const loadingSteps = [
    'Connecting to GitHub API...',
    'Fetching public repositories and profile README...',
    'Extracting technology stack and parsing repository metadata...',
    'Analyzing project quality and structure with Gemini 2.5 Flash...',
    'Compiling final professional resume schema...'
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = githubInput.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (cleanUsername) {
      generateResume(cleanUsername);
    }
  };

  // Helper to update experience bullet points
  const handleUpdateExperienceBullet = (expIndex: number, bulletIndex: number, newValue: string) => {
    if (!resumeData) return;
    const exp = resumeData.experience[expIndex];
    const newDescription = [...exp.description];
    if (newValue.trim() === '') {
      // Remove empty bullet
      newDescription.splice(bulletIndex, 1);
    } else {
      newDescription[bulletIndex] = newValue;
    }
    updateExperience(expIndex, { description: newDescription });
  };

  const handleAddExperienceBullet = (expIndex: number) => {
    if (!resumeData) return;
    const exp = resumeData.experience[expIndex];
    const newDescription = [...exp.description, 'New bullet point summarizing accomplishment...'];
    updateExperience(expIndex, { description: newDescription });
  };

  // Render Section Header for the resume preview
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="w-full border-b border-neutral-900 pb-1 mb-3 mt-4">
      <h2 className="text-[10pt] font-bold tracking-wider text-neutral-900 uppercase">
        {title}
      </h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans select-text">
      
      {/* 1. WELCOME VIEW */}
      {!isLoading && !resumeData && (
        <div className="flex-1 flex flex-col justify-between max-w-[1200px] w-full mx-auto px-6 py-12">
          {/* Header */}
          <header className="flex justify-between items-center border-b border-neutral-100 pb-6">
            <div className="flex items-center gap-2 font-semibold tracking-tight text-lg text-neutral-900">
              <FileText className="w-5 h-5" />
              <span>GitToResume</span>
            </div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-900 text-sm flex items-center gap-1.5 transition"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </header>

          {/* Main Hero */}
          <main className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            
            {/* Pill Badge */}
            <div className="border border-neutral-200 rounded-full px-4 py-1.5 text-[10px] uppercase font-bold tracking-[0.15em] text-neutral-500 mb-8 select-none">
              OUTPUT: VECTOR_PDF | POWERED BY GEMINI 2.5
            </div>

            {/* Three-line Hero Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.08] mb-8 select-none">
              GitHub Profile.<br />
              Into Professional.<br />
              Software Resume.
            </h1>

            {/* Subheading */}
            <p className="text-neutral-500 text-base md:text-lg max-w-[650px] leading-relaxed mb-12 select-none">
              Transform any public GitHub profile into a beautiful, ATS-friendly, professional software engineering resume. Powered by AI, editable in-browser, and exported as a true vector PDF.
            </p>

            {/* Input Form */}
            <form onSubmit={handleGenerate} className="w-full max-w-[550px] mb-6">
              <div className="flex flex-col sm:flex-row items-stretch border border-neutral-200 rounded-2xl p-2 bg-white focus-within:border-neutral-900 transition gap-2 sm:gap-0">
                <div className="flex items-center pl-3 pr-1 text-neutral-400 text-sm font-medium select-none">
                  github.com/
                </div>
                <input
                  type="text"
                  placeholder="username"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  className="flex-1 px-2 py-3 text-neutral-900 text-sm outline-none bg-transparent"
                  required
                />
                <button
                  type="submit"
                  className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  Generate
                </button>
              </div>
            </form>

            {/* Technology Labels */}
            <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1 text-[10px] font-bold tracking-[0.12em] text-neutral-400 select-none">
              <span>REACT PDF ENGINE</span>
              <span className="text-neutral-300">•</span>
              <span>GEMINI AI SERVICE</span>
              <span className="text-neutral-300">•</span>
              <span>LETTER/A4 FORMAT</span>
              <span className="text-neutral-300">•</span>
              <span>ATS COMPLIANT</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2 max-w-[500px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </main>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {isLoading && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-[500px] w-full mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-8" />
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 mb-6">Analyzing GitHub Profile</h2>
          
          <div className="w-full space-y-4 text-left">
            {loadingSteps.map((step, idx) => {
              const isCurrent = idx === loadingStep;
              const isPassed = idx < loadingStep;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm transition duration-300 ${
                    isCurrent 
                      ? 'border-neutral-900 bg-neutral-50 text-neutral-900 font-medium' 
                      : isPassed 
                        ? 'border-neutral-200 text-neutral-500 bg-neutral-50/50' 
                        : 'border-neutral-100 text-neutral-300'
                  }`}
                >
                  <div className="mt-0.5">
                    {isCurrent && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isPassed && (
                      <span className="flex w-4 h-4 items-center justify-center rounded-full bg-neutral-950 text-[10px] text-white font-bold">✓</span>
                    )}
                    {!isCurrent && !isPassed && (
                      <span className="flex w-4 h-4 items-center justify-center rounded-full border border-neutral-200 text-[10px] text-neutral-300 font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-neutral-400 mt-8">This process analyzes repository details and README structures. It might take up to a minute.</p>
        </div>
      )}

      {/* 3. RESUME EDITOR VIEW */}
      {!isLoading && resumeData && (
        <div className="flex-1 flex flex-col bg-neutral-50/50">
          
          {/* Sticky Editor Header */}
          <header className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex justify-between items-center z-10 select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => setResumeData(null)}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 text-sm font-medium transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 font-bold tracking-tight text-neutral-900">
              <FileText className="w-4 h-4" />
              <span>Resume Editor</span>
              <span className="text-xs font-normal text-neutral-400">({resumeData.name})</span>
            </div>
            <button
              onClick={exportPdf}
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </header>

          {/* Editor Workspace */}
          <div className="flex-1 flex flex-col lg:flex-row items-start max-w-[1250px] w-full mx-auto p-4 sm:p-8 gap-8">
            
            {/* Left Sidebar Toolbar (Add sections / settings) */}
            <aside className="w-full lg:w-[280px] space-y-6 lg:sticky lg:top-[90px] select-none">
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-4">Add Elements</h3>
                <div className="space-y-2">
                  <button 
                    onClick={addExperience}
                    className="w-full btn-secondary text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Add Work Experience</span>
                  </button>
                  <button 
                    onClick={addProject}
                    className="w-full btn-secondary text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Featured Project</span>
                  </button>
                  <button 
                    onClick={addContribution}
                    className="w-full btn-secondary text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Add OS Contribution</span>
                  </button>
                  <button 
                    onClick={addEducation}
                    className="w-full btn-secondary text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                  <button 
                    onClick={addCertification}
                    className="w-full btn-secondary text-xs font-medium py-2 px-3 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-xs text-neutral-500 space-y-3">
                <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[10px]">Editing Guide</h3>
                <p>• Click directly on any text inside the sheet to edit it.</p>
                <p>• Delete list items or bullet points by hovering over them and using the controls.</p>
                <p>• Skills are comma-separated. Edit the skills line to automatically group them.</p>
                <p>• Leave fields empty to exclude them from the compiled PDF.</p>
              </div>
            </aside>

            {/* Centered A4 Sheet Preview */}
            <main className="flex-1 w-full flex justify-center">
              <div 
                id="resume-document"
                className="w-full max-w-[820px] bg-white border border-neutral-200 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] rounded-2xl text-[9.5pt] leading-[1.45] text-[#111111]"
                style={{ minHeight: '1056px' }} // Approx Letter aspect ratio height
              >
                {/* Resume Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase">
                    <EditableText 
                      value={resumeData.name} 
                      onChange={(val) => updateField('name', val)} 
                      placeholder="YOUR FULL NAME"
                      className="font-extrabold"
                    />
                  </h1>
                  <div className="text-neutral-500 text-[10pt] font-medium mt-1">
                    <EditableText 
                      value={resumeData.headline} 
                      onChange={(val) => updateField('headline', val)} 
                      placeholder="Professional Title / Headline"
                    />
                  </div>
                  
                  {/* Contact Info List */}
                  <div className="text-neutral-500 text-[8.5pt] mt-3 flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
                    <EditableText 
                      value={resumeData.email} 
                      onChange={(val) => updateField('email', val)} 
                      placeholder="email@address.com"
                    />
                    <span className="text-neutral-200">|</span>
                    <EditableText 
                      value={resumeData.phone} 
                      onChange={(val) => updateField('phone', val)} 
                      placeholder="Phone Number"
                    />
                    <span className="text-neutral-200">|</span>
                    <EditableText 
                      value={resumeData.website} 
                      onChange={(val) => updateField('website', val)} 
                      placeholder="Portfolio / Website URL"
                    />
                    <span className="text-neutral-200">|</span>
                    <EditableText 
                      value={resumeData.githubUrl} 
                      onChange={(val) => updateField('githubUrl', val)} 
                      placeholder="github.com/username"
                    />
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="mb-5">
                  <SectionHeader title="Professional Summary" />
                  <div className="text-neutral-700 text-justify">
                    <EditableText 
                      value={resumeData.summary} 
                      onChange={(val) => updateField('summary', val)} 
                      placeholder="Write a concise professional summary highlighting your key achievements and core competencies..."
                      multiline={true}
                    />
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="mb-5">
                  <SectionHeader title="Technical Skills" />
                  <div className="text-neutral-700">
                    <span className="font-bold text-neutral-900">Technologies & Languages: </span>
                    <EditableText 
                      value={resumeData.skills.join(', ')} 
                      onChange={(val) => {
                        const skillsArray = val.split(',').map(s => s.trim()).filter(Boolean);
                        updateField('skills', skillsArray);
                      }} 
                      placeholder="React, TypeScript, Node.js, Python, PostgreSQL..."
                    />
                  </div>
                </div>

                {/* Professional Experience */}
                {resumeData.experience && resumeData.experience.length > 0 && (
                  <div className="mb-5">
                    <SectionHeader title="Professional Experience" />
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="group relative border-l border-neutral-100 pl-4 hover:border-neutral-300 transition duration-150">
                          {/* Hover Item Delete Control */}
                          <button
                            onClick={() => deleteExperience(idx)}
                            className="absolute -left-3 top-0 bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer z-10"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="flex justify-between items-baseline flex-wrap">
                            <div className="font-bold text-neutral-900 text-[10pt]">
                              <EditableText 
                                value={exp.position} 
                                onChange={(val) => updateExperience(idx, { position: val })} 
                                placeholder="Position Title"
                              />
                              <span className="font-normal text-neutral-400 mx-1">at</span>
                              <EditableText 
                                value={exp.company} 
                                onChange={(val) => updateExperience(idx, { company: val })} 
                                placeholder="Company Name"
                              />
                            </div>
                            <div className="text-neutral-500 text-[9pt]">
                              <EditableText 
                                value={exp.startDate} 
                                onChange={(val) => updateExperience(idx, { startDate: val })} 
                                placeholder="Start Date"
                              />
                              <span className="mx-1">&ndash;</span>
                              <EditableText 
                                value={exp.endDate} 
                                onChange={(val) => updateExperience(idx, { endDate: val })} 
                                placeholder="End Date"
                              />
                            </div>
                          </div>

                          {/* Bullet description */}
                          <ul className="list-square list-inside pl-2 mt-1.5 space-y-1">
                            {exp.description.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-neutral-700 text-[9pt] list-item group/bullet relative pr-6">
                                <EditableText 
                                  value={bullet} 
                                  onChange={(val) => handleUpdateExperienceBullet(idx, bIdx, val)} 
                                  placeholder="Summarize accomplishment..."
                                />
                                <button
                                  onClick={() => handleUpdateExperienceBullet(idx, bIdx, '')}
                                  className="inline-block opacity-0 group-hover/bullet:opacity-100 text-neutral-300 hover:text-red-500 transition ml-2 cursor-pointer align-middle"
                                  title="Remove Bullet"
                                >
                                  <Trash2 className="w-3 h-3 inline" />
                                </button>
                              </li>
                            ))}
                          </ul>

                          {/* Add Bullet Action */}
                          <button
                            onClick={() => handleAddExperienceBullet(idx)}
                            className="mt-2 text-[8pt] text-neutral-400 hover:text-neutral-950 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Bullet</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Projects */}
                {resumeData.projects && resumeData.projects.length > 0 && (
                  <div className="mb-5">
                    <SectionHeader title="Featured Projects" />
                    <div className="space-y-4">
                      {resumeData.projects.map((proj, idx) => (
                        <div key={idx} className="group relative border-l border-neutral-100 pl-4 hover:border-neutral-300 transition duration-150">
                          {/* Delete project button */}
                          <button
                            onClick={() => deleteProject(idx)}
                            className="absolute -left-3 top-0 bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer z-10"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex justify-between items-baseline flex-wrap">
                            <div className="font-bold text-neutral-900 text-[10pt]">
                              <EditableText 
                                value={proj.name} 
                                onChange={(val) => updateProject(idx, { name: val })} 
                                placeholder="Project Name"
                              />
                              {proj.url && (
                                <a 
                                  href={proj.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-neutral-400 hover:text-neutral-900 ml-1.5 inline-block align-middle"
                                >
                                  <ExternalLink className="w-3 h-3 inline" />
                                </a>
                              )}
                              {proj.stars !== undefined && proj.stars > 0 && (
                                <span className="text-[8pt] text-neutral-400 font-normal ml-2">★ {proj.stars}</span>
                              )}
                            </div>
                            
                            {/* Project Tech Stack */}
                            <div className="text-[8.5pt] text-neutral-500 font-medium">
                              <EditableText 
                                value={proj.technologies.join(', ')} 
                                onChange={(val) => {
                                  const techArray = val.split(',').map(s => s.trim()).filter(Boolean);
                                  updateProject(idx, { technologies: techArray });
                                }} 
                                placeholder="React, Vite, CSS..."
                              />
                            </div>
                          </div>

                          <div className="text-neutral-700 text-[9pt] mt-1.5 pl-2 border-l border-neutral-50">
                            <EditableText 
                              value={proj.description} 
                              onChange={(val) => updateProject(idx, { description: val })} 
                              placeholder="Project description detailing architecture and implementation..."
                              multiline={true}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Open Source Contributions */}
                {resumeData.contributions && resumeData.contributions.length > 0 && (
                  <div className="mb-5">
                    <SectionHeader title="Open Source Contributions" />
                    <div className="space-y-3">
                      {resumeData.contributions.map((contrib, idx) => (
                        <div key={idx} className="group relative border-l border-neutral-100 pl-4 hover:border-neutral-300 transition duration-150">
                          {/* Delete contrib button */}
                          <button
                            onClick={() => deleteContribution(idx)}
                            className="absolute -left-3 top-0 bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer z-10"
                            title="Delete Contribution"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex justify-between items-baseline flex-wrap">
                            <div className="font-bold text-neutral-900 text-[9.5pt]">
                              <EditableText 
                                value={contrib.repoName} 
                                onChange={(val) => updateContribution(idx, { repoName: val })} 
                                placeholder="Repository Name"
                              />
                              {contrib.repoUrl && (
                                <a 
                                  href={contrib.repoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-neutral-400 hover:text-neutral-900 ml-1.5 inline-block align-middle"
                                >
                                  <ExternalLink className="w-3 h-3 inline" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="text-neutral-700 text-[9pt] mt-1 pl-2">
                            <EditableText 
                              value={contrib.description} 
                              onChange={(val) => updateContribution(idx, { description: val })} 
                              placeholder="Describe your role or what you contributed to this repository..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                  <div className="mb-5">
                    <SectionHeader title="Education" />
                    <div className="space-y-3">
                      {resumeData.education.map((edu, idx) => (
                        <div key={idx} className="group relative border-l border-neutral-100 pl-4 hover:border-neutral-300 transition duration-150">
                          {/* Delete edu button */}
                          <button
                            onClick={() => deleteEducation(idx)}
                            className="absolute -left-3 top-0 bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer z-10"
                            title="Delete Education"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex justify-between items-baseline flex-wrap">
                            <div className="font-bold text-neutral-900 text-[10pt]">
                              <EditableText 
                                value={edu.institution} 
                                onChange={(val) => updateEducation(idx, { institution: val })} 
                                placeholder="University / School Name"
                              />
                            </div>
                            <div className="text-neutral-500 text-[9pt]">
                              <EditableText 
                                value={edu.startDate || ''} 
                                onChange={(val) => updateEducation(idx, { startDate: val })} 
                                placeholder="Start Year"
                              />
                              <span className="mx-1">&ndash;</span>
                              <EditableText 
                                value={edu.endDate || ''} 
                                onChange={(val) => updateEducation(idx, { endDate: val })} 
                                placeholder="End Year"
                              />
                            </div>
                          </div>
                          <div className="text-neutral-600 text-[9.5pt] mt-0.5">
                            <EditableText 
                              value={edu.degree} 
                              onChange={(val) => updateEducation(idx, { degree: val })} 
                              placeholder="Degree (e.g., B.S. in Computer Science)"
                            />
                            {edu.fieldOfStudy && (
                              <>
                                <span className="mx-1">in</span>
                                <EditableText 
                                  value={edu.fieldOfStudy} 
                                  onChange={(val) => updateEducation(idx, { fieldOfStudy: val })} 
                                  placeholder="Field of Study"
                                />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications && resumeData.certifications.length > 0 && (
                  <div className="mb-5">
                    <SectionHeader title="Certifications" />
                    <div className="space-y-3">
                      {resumeData.certifications.map((cert, idx) => (
                        <div key={idx} className="group relative border-l border-neutral-100 pl-4 hover:border-neutral-300 transition duration-150">
                          {/* Delete cert button */}
                          <button
                            onClick={() => deleteCertification(idx)}
                            className="absolute -left-3 top-0 bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm cursor-pointer z-10"
                            title="Delete Certification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex justify-between items-baseline flex-wrap">
                            <div className="font-bold text-neutral-900 text-[10pt]">
                              <EditableText 
                                value={cert.name} 
                                onChange={(val) => updateCertification(idx, { name: val })} 
                                placeholder="Certification Name"
                              />
                              <span className="font-normal text-neutral-400 mx-1">by</span>
                              <EditableText 
                                value={cert.issuer} 
                                onChange={(val) => updateCertification(idx, { issuer: val })} 
                                placeholder="Issuer Organization"
                              />
                            </div>
                            <div className="text-neutral-500 text-[9pt]">
                              <EditableText 
                                value={cert.date || ''} 
                                onChange={(val) => updateCertification(idx, { date: val })} 
                                placeholder="Date"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
