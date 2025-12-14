# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Oposiciones Archivo** - an interactive quiz application for studying archival science (Archivística) exam preparation in Spanish. Built with React 19, TypeScript, and Vite.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server on port 3000
npm run build     # Production build
npm run preview   # Preview production build
```

## Architecture

### Core Structure

- **Entry**: `index.tsx` → `App.tsx` (main state management)
- **Components**: `components/` - React functional components with TypeScript
- **Data**: `data/questions.ts` - Quiz questions array (archival science terminology)
- **Types**: `types.ts` - TypeScript interfaces for Question, QuizState, QuizResult

### State Management

All quiz state lives in `App.tsx` using React hooks:
- User session (name, timer, pause state)
- Quiz progress (current question, answers, finished state)
- History tracking (past quiz results)

State persists to localStorage using keys defined in `StorageKeys` enum (`types.ts`).

### Key Components

- `WelcomeScreen.tsx` - Initial user name input
- `QuizCard.tsx` - Question display with answer options and feedback
- `Summary.tsx` - Results display with retry options and history table

### Styling

Uses Tailwind CSS via CDN (inline classes). Colors: indigo (primary), emerald (correct), rose (incorrect), slate (neutral).

### Path Alias

`@` maps to project root (configured in `vite.config.ts`).

## Language

UI and quiz content are in Spanish. The app is designed for Spanish civil service exam preparation for archive/documentation positions.
