# UDIG Website

A modern, fully interactive **React** website built with **TypeScript**, **Vite**, and **Tailwind CSS**, designed to empower citizens to engage in **non-partisan civic action**.  

The site features collapsible sections, dynamic contribution dialogs, responsive layouts, and a modular design system for maintainable and scalable development.  

---

## Tech Stack

- **React 18+** – UI library  
- **TypeScript** – Strongly typed components  
- **Vite** – Fast dev server and bundler  
- **Tailwind CSS** – Utility-first styling  
- **tw-animate-css** – Animations and transitions  
- **ESLint** – TypeScript and React linting  
- **Node.js 18+** – Runtime environment  
- **ConvergePay** – Hosted payments integration  

---

## Features

- **Collapsible content sections** – Reduce cognitive load while keeping information accessible  
- **Interactive contribution dialogs** – Users can select predefined or custom donation amounts  
- **Live previews** – Certain sections (like About) include image previews  
- **Dynamic page & section management** – Admin can manage images for different pages/sections  
- **Responsive layout** – Works seamlessly on desktop, tablet, and mobile  
- **Theme system** – Centralized colors, spacing, and radius tokens  
- **Optional dark mode** – Toggle with `.dark` class  
- **Accessibility-first** – Keyboard-friendly dialogs, buttons, and collapsibles  

---

## Project Structure

```
src/
  assets/           # Static assets and images
  components/       # Reusable UI components (Buttons, Dialogs, CollapsibleSections, Carousels)
  pages/            # Page-level components (Home, About, Contribute, Impact, Programs, GetInvolved)
  styles/           # Tailwind config, theme tokens, global styles
  types/            # Shared TypeScript types/interfaces
  App.tsx           # Root component
  main.tsx          # React entry point
  styles.css        # Global Tailwind imports
```
---

## Pages Overview
  - Home – Hero carousel and featured sections
  - About – Vision, Mission, Our Story with image previews
  - Get Involved – Community gallery, volunteer opportunities
  - Impact – Header image and key accomplishments
  - Programs – Program header and details
  - Contribute – Donation page with collapsible information and contribution dialogs

---
## Getting Started

  **Prerequisites**
  - Node.js 18+
  - npm or yarn

  **1. Clone the repository**
  ```
  git clone <repo-url>
  cd <project-folder>
  ```

  **2. Install dependencies**
  ```
  npm install
  ```
  or
  ```
  yarn
  ```

  **3. Start development server**
  ```
  npm run dev
  ```

  - Dev server runs at http://localhost:5173

---

## Project Structure

```text
src/
  assets/         # images
  styles/         # Tailwind setup, theme tokens, global styles
  components/     # Reusable UI components
  page_components/          # Page-level components
  styles.css
  App.tsx
  main.tsx
```

---

## Admin Functionality
  - Manage images for multiple pages and sections
  - Upload / delete images via an admin interface
  - Live preview of images in About page and galleries
  - Confirmation dialogs for deleting images

---
## Styling & Theming
  - Tailwind CSS with a centralized theme in `src/styles`
  - CSS variables define colors, spacing, and border radii
  - Dark mode via `.dark` class
  - Animations applied with `tw-animate-css`
  - Consistent design tokens for buttons, dialogs, and cards

**Update theme tokens here:**
  ```
  src/styles/theme.css
  ```

---

## Scripts
```
npm run dev             # Start development server
npm run build           # Build production bundle
npm run preview         # Preview production build
npm run lint            # Run ESLint
nodemon src/index.ts    # Run backend
```

---

## ESLint
  - Configured for TypeScript and React
  - Optional stricter linting for production teams
  - Recommended: run `npm run lint` before commits

---

## Contribution Guidelines
  - Follow existing component styling patterns
  - Prefer Tailwind utilities and theme tokens
  - Keep commits small and focused
  - Ensure collapsible sections and dialogs follow existing patterns
  - Run npm run lint before pushing changes

---

## Notes

This project is intended to be easy to set up for new contributors.

If you encounter issues during setup, ensure your Node.js version is up to date and dependencies are installed correctly.

---

## Future Plans

* Admin Page
	- make a general styling across all sections
	- essay competition
	- more moderation features

* General Styling
	- incorporate the gradient form contact page more (mainly on popouts)
	- add information and images from other site
	- have it so that the images are credited
	- update home page to have quotes
	- if possible add copyright free background music
	
* Map Page
	- mobile friendly
