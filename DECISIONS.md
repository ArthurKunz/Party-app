# Decisions Log

## Language
Decision: TypeScript (strict mode)
Reason: Type safety catches bugs at compile time, better Claude/Cursor
autocomplete, industry standard
Rules:
- Never use `any` type
- Always type component props explicitly
- Always type Supabase query return values
Status: Locked

## Frontend framework
Decision: Next.js 14, App Router
Reason: Modern architecture, server components, good Supabase SSR
integration, Vercel deployment
Rules:
- Always use App Router patterns (app/ folder, layouts, server components)
- Never suggest Pages Router solutions (pages/ folder)
- Default to server components unless client interactivity is required
- Use `use client` only when necessary (event handlers, useState, etc.)
Status: Locked

## Routing
Decision: Next.js App Router built-in routing
Reason: No extra library needed, file-based routing via app/ folder
covers all V1 needs
Rules:
- Routes live in app/ folder
- Dynamic routes use [param] folder syntax
- No react-router-dom or any third-party routing library
Status: Locked

## Backend
Decision: Supabase (Postgres database + Edge Functions if needed)
Reason: Integrated with auth and storage, generous free tier,
excellent Next.js compatibility
Rules:
- All database logic goes through Supabase client
- Write RLS (Row Level Security) policies for every table from day one
- Never expose service role key on the client side
Status: Locked

## Auth
Decision: Supabase Auth via @supabase/ssr package
Reason: Native integration with Supabase DB, no extra dependencies,
handles SSR cookie-based sessions correctly in App Router
Rules:
- Follow official Supabase Next.js App Router guide exactly
- Session handled via middleware.ts at project root
- Never freestyle the auth setup
Status: Locked

## Database access
Decision: Supabase JS client (@supabase/supabase-js)
Reason: Official client, typed with generated types, works in both
server and client components
Rules:
- Use createServerClient for server components and API routes
- Use createBrowserClient for client components
- Generate TypeScript types from Supabase schema regularly
  (supabase gen types typescript)
Status: Locked

## Styling
Decision: Tailwind CSS
Reason: Fast to build with, no context switching, pairs well with
Next.js and component libraries
Status: Locked

## Navigation
- Home → /home — app explainer + manual Leipzig highlights (Stadtfest etc.)
- My parties → /parties — segmented: Hosting | Attending (merged, not separate nav tabs)
- Create (+) → /parties/new — center action
- Profile → /profile — settings, logout, account

## What is NOT in this stack — do not suggest
- Prisma (using Supabase client directly)
- Clerk or NextAuth (using Supabase Auth)
- React Router or any third-party router (using Next.js App Router)
- Firebase or PlanetScale (using Supabase)
- Pages Router patterns (using App Router)
- Redux or Zustand (use React state + Supabase realtime if needed)
- `any` type in TypeScript
