# SkillConnect Platform

SkillConnect is a scalable web platform built to connect students with real-world tasks, internships, and short-term opportunities posted by organizations.  
The goal of SkillConnect is to bridge the gap between learning and practical experience by enabling organizations to easily discover and work with talented students.

This is an early but fully functional version of the product. The platform is actively being developed and will continue to evolve into a full-scale production system with payments, subscriptions, and advanced matching features.

> This is not a demo or college project — this is a startup product under active development and iteration.

---

## 🚀 Current Features

- Role-based authentication (Student, Organization, Admin)
- Student & Organization profile management
- Task / Internship posting system for organizations
- Application system for students
- Applicant management for organizations
- Dashboards for students and organizations
- Role-based access control across the platform
- Production deployment with real database and auth

---

## 🛠 Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL, Authentication, Storage)
- Deployment: Vercel

---

## 🧑‍💻 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/avsa-codes/SkillConnect-Platform.git
cd SkillConnect-Platform

## Install Dependencies
   npm install

Setup environment variables
Create a .env.local file in the root of the project:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Run the development server
npm run dev

Then open :
http://localhost:3000


***🗺 Product Roadmap

The platform is under active development. Planned features include:

1. Google OAuth login
2. Payments integration
3. Automatic invoice generation
4. Organization subscriptions & billing
5. Notifications & communication system
6. Smarter matching between students and tasks
7. Verification systems for organizations and profiles
8. Analytics dashboards

🎯 Vision

SkillConnect is being built as a long-term, scalable product — not a one-off project.
The vision is to create a trusted ecosystem where:
Students can find meaningful real-world work easily
Organizations can discover and work with talent efficiently
Colleges and institutions can integrate practical work into learning

🤝 Contributions

At this stage, the product is being developed by the core team.
Contributions, suggestions, and feedback may be opened up in the future as the platform grows.
