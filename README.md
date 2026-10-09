# AI Workplace Productivity Assistant

A modern, responsive web dashboard that helps professionals automate repetitive workplace tasks using AI. Draft emails, summarise meetings, plan your day or week, research topics and chat with an assistant, all from one application.

Built as a project for the **CAPACITI AI Skill Accelerator Programme**.

> **No sign-in. No backend.** The app opens straight to the dashboard and runs entirely in your browser. All data is stored locally on your own device.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features Implemented](#features-implemented)
- [Connecting Your Own AI API (ChatGPT or Gemini)](#connecting-your-own-ai-api-chatgpt-or-gemini)
- [Technologies and Tools Used](#technologies-and-tools-used)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Prompt Engineering Approach](#prompt-engineering-approach)
- [Responsible AI](#responsible-ai)
- [Known Limitations](#known-limitations)

---

## Project Overview

Professionals spend a large part of their day on repetitive tasks such as writing emails, summarising information, planning schedules and conducting research. The **AI Workplace Productivity Assistant** brings these tasks together in a single SaaS-style dashboard so they can be done faster and more consistently.

The application is **one integrated project** with five AI-powered tools, a shared layout, and built-in responsible-AI safeguards.

It works in two modes:

| Mode | Description |
|---|---|
| **Demo Mode** (default) | Realistic, template-driven simulated responses. No API key or setup needed, so the whole app works out of the box. |
| **Live AI Mode** (optional) | Add your own **OpenAI (ChatGPT)** or **Google Gemini** API key in Settings and the app sends requests directly from your browser to the provider for real AI responses. |

---

## Features Implemented

### AI Tools

1. **Smart Email Generator**
   - Generates a subject line and email body from a short description
   - Tone options: Formal, Friendly, Persuasive
   - Audience options: Client, Manager, Team, Colleague
   - Length options: Short, Medium, Detailed
   - Editable output, plus Regenerate, Make shorter and Make more formal buttons

2. **Meeting Notes Summarizer**
   - Converts raw notes (pasted or uploaded as `.txt`) into structured minutes
   - Sections: Concise Summary, Key Discussion Points, Decisions Made, Action Items table (Task, Owner, Deadline, Priority) and Upcoming Deadlines
   - Shows "Not specified" instead of inventing owners or deadlines
   - Built-in sample notes for quick testing

3. **AI Task Planner / Scheduler**
   - Add multiple tasks with duration, deadline, urgency and importance
   - Daily or weekly plans within your chosen working hours
   - Visual **Eisenhower Matrix** (Do first, Schedule, Delegate, Eliminate)
   - Time-blocked schedule with automatic breaks and editable block labels
   - AI-generated time-optimisation tips
   - Warns when tasks do not fit in the available hours

4. **AI Research Assistant**
   - Accepts pasted article or report text, or just a topic
   - Detail level: Quick or Detailed
   - "Explain like I'm" level: Beginner, Professional or Expert
   - Output: simplified summary, 5 key insights, recommendations, glossary and a "Things to Verify" section

5. **AI Chatbot Interface**
   - Chat bubbles, typing indicator, timestamps and auto-scroll
   - Conversation memory saved in your browser
   - Quick-prompt chips (for example "Draft a follow-up email")
   - Copy button on each response and a Clear chat button

### Platform Features

- **Dashboard** with quick stats (emails generated, meetings summarised, plans created, estimated time saved), recent activity and tips
- **Sidebar navigation** that collapses on desktop and becomes a drawer on mobile
- **Responsive design** for desktop, tablet and mobile
- **Light and dark mode** toggle
- **Prompt Details panel** on every tool showing the exact prompt template used
- **Rate this output** (thumbs up / down) and a **Refine** box to iterate on results
- **History page** with search, filter by tool, and delete
- **Export options**: Copy, Download as `.txt` or `.md`, and Print
- **First-visit onboarding** modal
- **Settings page** to switch modes, choose a provider, add an API key and clear all data
- Loading skeletons, empty states, toast notifications and friendly error handling
- Accessibility: labelled inputs, focus states, ARIA attributes and keyboard navigation

---

## Connecting Your Own AI API (ChatGPT or Gemini)

The app is designed so you can plug in a real AI provider at any time, without changing any code.

1. Get an API key from one of the supported providers:
   - **OpenAI (ChatGPT):** <https://platform.openai.com/api-keys>
   - **Google Gemini:** <https://aistudio.google.com/app/apikey>
2. Open the app and go to **Settings** in the sidebar.
3. Choose your **Provider** (OpenAI or Google Gemini).
4. Paste your **API key**.
5. Check the **Model** field. It is pre-filled with a default and you can change it to any model your key has access to.
6. Switch on **Live AI mode**. The badge in the top bar changes from *Demo Mode* to *Live AI*.

| Provider | Default model | Notes |
|---|---|---|
| OpenAI (ChatGPT) | `gpt-4o-mini` | Uses the Chat Completions API |
| Google Gemini | `gemini-1.5-flash` | Uses the `generateContent` API. Model names change over time, so check Google's documentation and update the Model field if you see a "Model not found" error. |

**Good to know**

- Your API key is stored **only in your browser's localStorage** and is sent **only to the AI provider you chose**. It never passes through any server of ours, because there isn't one.
- Use a **personal or test key** with a spending limit, and never share or commit your key.
- If a request fails (invalid key, rate limit or network error), the app shows a message and offers to switch back to Demo Mode so you can keep working.
- You can remove your key and all saved data at any time with **Settings > Clear all data and key**.

---

## Technologies and Tools Used

**Front end**

- [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [TanStack Start](https://tanstack.com/start) and [TanStack Router](https://tanstack.com/router) for routing
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/) for accessible components
- [Lucide React](https://lucide.dev/) for icons
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications
- [react-markdown](https://github.com/remarkjs/react-markdown) with `remark-gfm` to render AI output (tables, lists)

**AI**

- OpenAI API (ChatGPT models), optional
- Google Gemini API, optional
- Built-in Demo Mode with simulated responses

**Tooling**

- [Vite](https://vitejs.dev/) for development and builds
- [Vitest](https://vitest.dev/) for testing
- ESLint and Prettier for code quality
- [Lovable](https://lovable.dev/) for AI-assisted development
- Browser `localStorage` for all persistence (no database)

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (a current LTS version is recommended) and npm
- A modern web browser
- *(Optional)* An OpenAI or Google Gemini API key for Live AI mode

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2. Install dependencies

```bash
npm install
```

> The project also includes a `bun.lock` file, so [Bun](https://bun.sh/) works too: `bun install`.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal (usually `http://localhost:5173`). The app opens directly on the dashboard in **Demo Mode**.

### 4. (Optional) Enable Live AI

Follow [Connecting Your Own AI API](#connecting-your-own-ai-api-chatgpt-or-gemini) above. No `.env` file is needed, because the key is entered in the app's Settings page.

### Other useful commands

| Command | Description |
|---|---|
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the test suite |
| `npm run lint` | Check code with ESLint |
| `npm run format` | Format code with Prettier |

---

## Project Structure

```
src/
├── components/
│   ├── app-sidebar.tsx      # Sidebar navigation and tool list
│   ├── shell-extras.tsx     # Theme toggle, mode badge, onboarding modal
│   ├── tool/shared.tsx      # Shared layout, review gate, rate/refine, prompt details
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── aiService.ts         # Single AI service: Demo Mode + Live Mode (OpenAI / Gemini)
│   ├── prompts.ts           # System prompt for each tool
│   ├── demo.ts              # Simulated responses for Demo Mode
│   └── storage.ts           # localStorage helpers: settings, history
└── routes/
    ├── index.tsx            # Dashboard
    ├── email.tsx            # Smart Email Generator
    ├── meetings.tsx         # Meeting Notes Summarizer
    ├── planner.tsx          # AI Task Planner
    ├── research.tsx         # AI Research Assistant
    ├── chat.tsx             # AI Chatbot
    ├── history.tsx          # History
    ├── settings.tsx         # Settings
    └── responsible-ai.tsx   # Responsible AI information
```

---

## Prompt Engineering Approach

Every tool has its own carefully structured system prompt in `src/lib/prompts.ts`, built from the same parts:

- **Role / persona:** for example "expert executive assistant" or "productivity coach"
- **Task and context:** what the model must do and what inputs it receives
- **Constraints:** never fabricate facts, owners or deadlines; state uncertainty instead of guessing; avoid biased or discriminatory language; do not request sensitive personal data
- **Output format:** defined sections and tables so results are consistent
- **Tone:** matched to the tool and the user's selection
- **Few-shot example:** included where it improves accuracy

Users can open the **Prompt Details** panel on any tool to see the exact template, and use **Refine** to iterate on a result (the previous output is sent back as context).

---

## Responsible AI

This project treats responsible use as a core feature, not an afterthought:

- A **persistent disclaimer** on every page: *"AI-generated content may contain errors or bias. Always review and verify before use."*
- A **privacy warning** above every input area, advising users not to paste confidential or personal information
- A **human-in-the-loop review step**: Copy, Download and Print stay disabled until the user ticks "I have reviewed this output"
- A dedicated **Responsible AI page** covering limitations, bias and hallucination risks, privacy, human review and transparency
- **Transparency** through visible prompts and a clear "Demo Mode is simulated" notice
- **Privacy by design**: no accounts, no server, and all data stays in the user's browser

---

## Known Limitations

- **Demo Mode is simulated.** Responses are generated from templates and your input, not by a real AI model.
- **API keys live in the browser.** Because there is no backend, a key stored in localStorage can be viewed by anyone with access to your browser's developer tools. Use a personal or test key with a spending limit.
- **Live responses are not truly streamed.** The full response is received first and then displayed with a typing effect.
- **Data is device-specific.** History, chat and settings are stored in your browser and are not synced across devices. Clearing browser data removes them.
- **AI can be wrong.** Always review and verify outputs before using or sharing them.

---

## Built with Lovable

This project was built with [Lovable](https://lovable.dev). You can continue developing it in the [Lovable editor](https://lovable.dev/projects/b318d26c-d404-43d3-ac6b-11023bb3b364). Changes made in Lovable are committed to this repository, and changes pushed to `main` on GitHub sync back into Lovable.

---

## Disclaimer

This project is for educational and demonstration purposes. AI-generated content may contain errors or bias and should always be reviewed by a human before use.
