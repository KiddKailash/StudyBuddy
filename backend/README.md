# StudyBuddy Backend API

## Overview

The StudyBuddy Backend is a robust Node.js-based REST API that powers the StudyBuddy learning platform. It provides services for user authentication, flashcard management, AI-powered content generation, subscription management, and integration with third-party services like Notion.

## Tech Stack

- **Runtime**: Node.js with Express.js framework
- **Database**: 
  - Primary: MongoDB (via native driver)
  - Migration support to SQLite
- **Authentication**: JWT-based authentication system
- **Payment Processing**: Stripe integration for subscriptions
- **External Integrations**:
  - Notion API
  - AI services for content generation
- **Hosting**: Cloud deployment on Digital Ocean. Database hosted with MongoDB.

## Project Structure

```
backend/
├── database/          # Database connection and models
├── middleware/        # Express middleware (auth, rate limiting, etc.)
├── routes/            # API route definitions
├── scripts/           # Utility and maintenance scripts
├── server.js          # Main application entry point
└── .env               # Environment configuration (not in repo)
```

## Key Features

- **Authentication System**: User registration, login, password reset
- **Flashcards Management**: Create, update, delete, and organize flashcards
- **Folder Organization**: Group flashcards into folders
- **Subscription Management**: Freemium model with Stripe integration
- **Content Extraction**: Process YouTube videos, websites, and documents
- **AI Functionality**: Generate flashcards, summaries, and quiz questions
- **Notion Integration**: Connect and sync with Notion workspaces
- **User Management**: Profile updates, subscription status tracking

## API Routes

The API is organized into logical route groups:

- `/api/auth` - User authentication endpoints
- `/api/flashcards` - Flashcard management (requires auth)
- `/api/folders` - Folder organization for flashcards (requires auth)
- `/api/users` - User profile management
- `/api/checkout` - Subscription and payment management
- `/api/uploads` - File upload handling
- `/api/notion` - Notion integration endpoints
- `/api/website-transcript` - Website content extraction
- `/api/multiple-choice-quizzes` - Quiz generation and management
- `/api/aichats` - AI chat functionality
- `/api/summaries` - Content summarization

Public (no auth required) versions of select endpoints are available at:
- `/api/flashcards-public`
- `/api/upload-public`
- `/api/transcript-public`
- `/api/website-transcript-public`
- `/api/openai`

## Utility Scripts

The `scripts/` directory contains maintenance utilities:

- `appendFolderID.js` - Add folder organization to existing flashcards
- `userReport.js` - Generate and email user statistics reports
- `migrateMongoToSQLite.js` - Database migration tool

## Environment Setup

Create a `.env` file with the following variables:

```
PORT=8080
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GMAIL_ADDRESS=your_email@gmail.com
GMAIL_APP_PASS=your_app_password
ADMIN_EMAIL=admin@example.com
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file with required variables
4. Start the development server: `npm run dev`
5. For production: `npm start`

## API Documentation

Detailed API documentation is available via:

- Code comments within route files
- Authentication using Bearer tokens in Authorization header
- Error responses follow consistent format: `{ error: "Error message" }`

## Database Architecture

The application uses MongoDB with the following collections:

- `users` - User accounts and profile information
- `flashcards` - Flashcard sets and content
- `notion_authorizations` - Notion integration tokens

SQLite migration support is available for deployments requiring relational database structure.

## Error Handling

The application implements comprehensive error handling with:

- Input validation
- Authentication verification
- Rate limiting protection
- Global error handler for unexpected issues

## Contributing

1. Follow the existing code style and patterns
2. Add appropriate documentation for new features
3. Ensure all existing tests pass
4. Add new tests for new functionality  