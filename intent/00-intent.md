# GitToResume

## Overview

GitToResume is an AI-powered web application that transforms any public GitHub profile into a beautiful, ATS-friendly, professional resume.

The application analyzes a developer's public GitHub profile, repositories, README files, technologies, commit activity, topics, and project quality, then uses AI to generate a truthful, well-written resume that can be edited and exported as a high-quality vector PDF.

The application is designed to feel like a premium developer tool rather than a resume builder.

The entire experience should be clean, fast, minimal, and highly polished.

---

# Product Vision

A developer should be able to visit the website, enter a GitHub username, and receive a professional software engineering resume in under a minute.

The generated resume should accurately represent the developer's work without inventing experience or information.

The application should become the fastest way for developers to create resumes directly from their GitHub portfolio.

---

# Core User Flow

User visits homepage.

↓

User enters a GitHub username.

↓

Backend fetches public GitHub data.

↓

Repositories are analyzed.

↓

README files are processed.

↓

Languages, technologies, topics, stars, activity, and project metadata are collected.

↓

AI analyzes the complete profile.

↓

A structured ATS-friendly resume is generated.

↓

User reviews the generated resume.

↓

Every section remains editable.

↓

Resume is exported as a vector PDF.

---

# Resume Generation Rules

The AI must only use information that exists publicly.

Never fabricate:

- companies
- work experience
- education
- certifications
- achievements
- projects
- skills that cannot reasonably be inferred

If information is unavailable, leave the section empty or allow the user to fill it manually.

Accuracy is more important than completeness.

---

# Resume Sections

The generated resume should support:

- Name
- Professional Headline
- Summary
- Technical Skills
- Featured Projects
- Open Source Contributions
- GitHub Links
- Portfolio Links
- Experience (editable)
- Education (editable)
- Certifications (editable)
- Contact Information

Every section should be editable before exporting.

---

# AI Responsibilities

The AI should:

- understand repository purpose
- summarize README files
- identify technologies
- detect programming languages
- identify backend/frontend/mobile projects
- rank repositories by quality
- write concise ATS-friendly bullet points
- generate a professional summary
- organize projects logically

The AI should never exaggerate or invent.

---

# Export

The final resume should be exported as a true vector PDF.

The PDF must:

- contain selectable text
- be ATS friendly
- print perfectly
- remain sharp at any zoom level
- have a clean professional layout

Future exports may include:

- Markdown
- JSON
- HTML

---

# Architecture

Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui

Backend

- FastAPI
- Python
- Gemini API
- GitHub REST API

The application is **not** fully client-side.

The backend is responsible for GitHub data collection, AI processing, resume generation, and business logic.

---

# Design Philosophy

The application should feel inspired by products like:

- Linear
- Vercel
- Raycast
- Notion
- Apple

The interface should prioritize:

- simplicity
- whitespace
- typography
- speed
- clarity
- accessibility

Every interaction should feel intentional.

---

# UI Principles

The interface should contain only essential elements.

Avoid visual clutter.

Prefer large typography over decorative graphics.

Use subtle animations.

Keep spacing generous.

Maintain a monochrome color palette with minimal accents.

The application should look premium without feeling complicated.

---

# Performance Goals

The application should feel extremely responsive.

Progress should be clearly communicated while GitHub data is being analyzed.

Loading states should reassure users without overwhelming them.

Animations should remain subtle and smooth.

---

# Future Features

The architecture should be designed to support future additions such as:

- Multiple resume templates
- Cover letter generation
- Portfolio website generation
- Job description matching
- AI resume optimization
- Resume version history
- Shareable resume links
- LinkedIn profile import
- Personal branding suggestions

These features should not affect the simplicity of the core experience.

---

# Project Goal

Build a modern AI-powered developer tool that converts a GitHub profile into a polished, ATS-friendly, vector PDF resume with minimal effort while maintaining complete accuracy, excellent design, and a premium user experience.


---

# Technology Stack

The project should be built using a modern, scalable, and modular architecture.

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- React Hook Form
- Zod
- TanStack Query
- Zustand
- React Router
- Lucide React

The frontend should prioritize performance, responsiveness, accessibility, and reusable components.

---

## Backend

- FastAPI
- Python 3.13+
- Uvicorn
- Pydantic
- HTTPX
- Jinja2
- WeasyPrint (or another vector PDF generation library)
- Python Markdown
- Pillow (if image processing is required)

The backend should expose clean REST APIs and keep AI, GitHub, and PDF logic separated into independent services.

---

## AI

- Google Gemini 2.5 Flash
- Structured JSON generation
- Prompt engineering
- Function calling (future)
- Resume optimization prompts

AI should always return structured JSON instead of raw text whenever possible.

---

## APIs

- GitHub REST API
- GitHub GraphQL API (future support)

The application should collect:

- User profile
- Repositories
- README files
- Languages
- Topics
- Stars
- Forks
- Contribution statistics
- Organizations
- Pinned repositories

---

## PDF Generation

The exported resume should be:

- Vector PDF
- ATS Friendly
- Printable
- Selectable text
- High quality
- Small file size

Never generate image-based PDFs.

---

## State Management

- Zustand for global state
- TanStack Query for server state
- React Hook Form for forms

State should remain simple and predictable.

---

## Styling

- TailwindCSS
- CSS Variables
- Responsive Design
- Mobile First
- Dark mode support (future)

No component library should override the clean visual identity of the application.

---

## Development Tools

- pnpm
- ESLint
- Prettier
- Biome (optional)
- Husky
- GitHub Actions (future)

The project should maintain clean formatting and consistent code quality.

---

## Deployment

Frontend

- Vercel

Backend

- Railway
or
- Render

The architecture should allow frontend and backend to be deployed independently.

---

## Folder Architecture

The codebase should follow a feature-based modular architecture.

Each feature should own:

- components
- hooks
- services
- API calls
- types
- utilities

The project should remain easy to maintain and scale as more AI features are introduced.