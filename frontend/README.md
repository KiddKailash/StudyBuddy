# StudyBuddy Frontend

The StudyBuddy Frontend is a modern React application that provides an intuitive interface for creating and managing AI-powered study materials.

## Overview

StudyBuddy's frontend offers a responsive and accessible user interface for:
- Generating and managing flashcards from various content sources
- Creating and taking multiple-choice quizzes
- Viewing AI-generated summaries of learning materials
- Interacting with AI assistants for content clarification
- Managing folders and study sessions
- Handling user authentication and subscriptions

## Features

- **User Authentication**: Secure login, registration, and password management
- **AI-Powered Content Generation**: Create study materials from:
  - Uploaded documents (PDF, DOCX, etc.)
  - Pasted text
  - Website content
  - YouTube videos (future)
- **Study Organization**:
  - Folder-based organization system
  - Rename and manage study sessions
  - Filter and search functionality
- **Multiple Study Formats**:
  - Flashcards with interactive review
  - Multiple-choice quizzes
  - AI-generated summaries
  - AI chat assistance
- **User Management**:
  - Profile settings
  - Subscription management
  - Theme preferences
- **Internationalization**: Support for multiple languages via i18next
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 18** with **Vite** for fast, modern development
- **Material UI (MUI)** for a consistent, accessible component library
- **React Router** for navigation and routing
- **Axios** for API communication
- **Stripe** integration for subscription payments
- **JWT** for secure authentication
- **React Dropzone** for file uploads
- **i18next** for internationalization

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React context providers
│   ├── layouts/      # Page layout components
│   ├── pages/        # Page components
│   ├── services/     # API and service integrations
│   ├── styles/       # Global styles and themes
│   ├── translation/  # i18n translations
│   └── main.jsx      # Application entry point
├── index.html        # HTML entry point
└── package.json      # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server (see backend README)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```
   VITE_LOCAL_BACKEND_URL=http://localhost:8080
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Development Guidelines

- Follow existing component patterns and code style
- Use Material UI components for UI consistency
- Maintain responsive design for all screen sizes
- Use context providers for global state
- Implement proper error handling for API calls

## Authentication Flow

The application uses JWT tokens for authentication:
1. User logs in via email/password or social providers
2. JWT token is stored in local storage
3. Token is included in authorized API requests
4. Authentication context handles token validation and refresh

## Routing Structure

- Public routes: landing page, login, registration
- Protected routes: study materials, settings, subscription management
- Local (ephemeral) routes: for non-authenticated temporary content

## Contact

For more information, contact the development team at [kiddkailash@gmail.com](mailto:kiddkailash@gmail.com).