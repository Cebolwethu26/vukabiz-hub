# VukaBiz Hub

Act as a Principal Full-Stack Engineer and Senior UI/UX Designer. Build a production-ready Web App for the "VukaBiz / Enterprise Hub" platform. 

### 1. Visual & UI System

- Modern, clean, and accessible UI using Shadcn UI components and Tailwind CSS.

- Color Palette: Deep Slate Navy, Emerald Green (for verified status and funding metrics), and crisp white/neutral slate backgrounds.

- High-contrast typography, card layouts with subtle drop shadows, and responsive desktop/mobile views.

### 2. Core Navigation & Layout

Build a responsive sidebar navigation containing:

- Dashboard (Overview metrics & activity feed)

- Verification & Onboarding Hub

- Grant & Micro-Fund Portal

- Transparency & Audit Public Ledger

- Settings & Profile

### 3. Key Pages & Features to Build

1. Dashboard Overview:

   - Summary cards: Total Capital Raised, Approved Grants, Verified Entities, Active Mentors.

   - Interactive charts showing monthly pool contributions vs. distributions.

2. Onboarding & Automated Route Engine:

   - Dynamic Multi-Step Form for SME registration (CIPC Number, SARS Tax Pin, Business Stage, Location).

   - Instant Automated Pathing: Tag business as "Early Stage/Unregistered" (triggers mandatory upskilling modules) or "Growth Stage/Registered" (unlocks grant applications).

3. Community Micro-Fund & Governance Portal:

   - Display a live R10/month micro-contribution progress bar.

   - Grant Application Form: Direct vendor line-item request (e.g., equipment supplier, stock, licenses).

   - Trustee Approval Panel: Multi-signature approval status workflow (3/3 approvals required).

4. Public Transparency Ledger:

   - Searchable, filterable table listing all disbursements, recipient business names, amounts funded, and direct vendor names.

   - Live bank feed summary showing total inflows vs. operational overheads.

### 4. Database & Auth Integration Setup

- Integrate with our connected Supabase backend.

- Create database tables for: `profiles`, `businesses`, `grant_applications`, `fund_transactions`, and `trustee_approvals`.

- Set up Supabase Auth (Email/Password & Magic Link) on a `/login` route, protecting private dashboard routes while leaving the Public Transparency Ledger publicly accessible.

- Enable Row Level Security (RLS) policies so users can only view and edit their own business profiles, while Trustees can view pending applications.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/312459b3-a67c-47b0-83c2-5b6712478aab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
