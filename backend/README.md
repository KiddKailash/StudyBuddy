# StudyBuddy Backend API

## Overview

The StudyBuddy Backend is a robust Node.js-based REST API that powers the StudyBuddy learning platform. It provides services for user authentication, flashcard management, AI-powered content generation, subscription management, and integration with third-party services like Notion.

## Tech Stack

- **Runtime**: Node.js (v16+) with Express.js framework
- **Database**: 
  - Primary: MongoDB (via native driver)
  - Migration support to SQLite
- **Authentication**: JWT-based authentication system
- **Payment Processing**: Stripe integration for subscriptions
- **AI Integration**: OpenAI API for content generation
- **External Integrations**:
  - Notion API
  - Web content extraction
- **File Processing**: 
  - PDF parsing with pdf-parse
  - DOCX parsing with mammoth
  - CSV parsing with csv-parser
- **Email**: Nodemailer for transactional emails

## Project Structure

```
backend/
├── controllers/       # Business logic for routes
├── database/          # Database connection and models
├── middleware/        # Express middleware (auth, rate limiting, etc.)
├── routes/            # API route definitions
├── scripts/           # Utility and maintenance scripts
├── cron/              # Scheduled tasks
├── environment/       # Environment-specific configurations
├── server.js          # Main application entry point
└── .env               # Environment configuration (not in repo)
```

## Key Features

- **Authentication System**: 
  - User registration and login
  - Password reset functionality
  - JWT token management
  - Rate limiting protection

- **Content Management**:
  - Flashcard creation and organization
  - Multiple-choice quiz generation
  - Summary generation
  - AI chat conversations
  - Folder organization system

- **AI Integration**:
  - Automatic flashcard generation from content
  - Quiz question creation
  - Content summarization
  - Interactive AI chatbot

- **Content Processing**:
  - Document parsing (PDF, DOCX, etc.)
  - Website content extraction
  - Text processing and analysis

- **Subscription System**:
  - Freemium model implementation
  - Stripe payment integration
  - Webhook handling for payment events
  - Subscription status tracking

- **External Integrations**:
  - Notion workspace connection
  - Notion content synchronization

## API Routes

The API is organized into logical route groups:

### Public Routes (No Auth)
- `/api/openai` - Limited AI functionality for non-authenticated users
- `/api/flashcards-public` - Public flashcard access
- `/api/upload-public` - File upload for public users
- `/api/transcript-public` - Transcript processing for public users
- `/api/website-transcript-public` - Website content extraction (public)

### Protected Routes (Auth Required)
- `/api/auth` - User authentication endpoints
- `/api/flashcards` - Flashcard management
- `/api/folders` - Folder organization for flashcards
- `/api/users` - User profile management
- `/api/checkout` - Subscription and payment management
- `/api/uploads` - File upload handling
- `/api/notion` - Notion integration endpoints
- `/api/website-transcript` - Website content extraction
- `/api/multiple-choice-quizzes` - Quiz generation and management
- `/api/aichats` - AI chat functionality
- `/api/summaries` - Content summarization
- `/api/feature-request` - User feature requests
- `/api/transcript` - Transcript processing

### Webhooks
- `/api/webhook` - Stripe webhook endpoint for payment events

## Authentication

The API uses JWT (JSON Web Token) for authentication:
- Tokens are issued at login and include user ID and permissions
- Protected routes require a valid token in the Authorization header
- Tokens expire and require refresh for security

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Request limits are applied to sensitive endpoints
- Different limits for authenticated vs. non-authenticated users

## Environment Setup

Create a `.env` file with the following variables:

```
PORT=8080
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
GMAIL_ADDRESS=your_email@gmail.com
GMAIL_APP_PASS=your_app_password
ADMIN_EMAIL=admin@example.com
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env` file with required variables

3. Start the development server:
   ```bash
   npm start
   ```

4. For development with auto-restart:
   ```bash
   npx nodemon server.js
   ```

## Error Handling

The API implements comprehensive error handling:
- Input validation with appropriate error messages
- Authentication verification with proper status codes
- Global error handler for unexpected issues
- Consistent error response format: `{ error: "Error message" }`

## Database Operations

- **MongoDB Connection**: Automatic connection management with retry logic
- **Collections**:
  - `users`: User accounts and profile information
  - `flashcards`: Flashcard sets and content
  - `folders`: Organizational structure for flashcards
  - `quizzes`: Multiple-choice quiz questions
  - `summaries`: Generated content summaries
  - `aichats`: AI chat conversation history
  - `notion_authorizations`: Notion integration tokens

## Testing

For manual API testing, you can use tools like:
- Postman
- Insomnia
- curl commands

For example:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Deployment

The application is designed for deployment on:
- Digital Ocean App Platform
- MongoDB Atlas for database hosting

## Maintenance

The `scripts/` directory contains utilities for maintaining the application:
- `appendFolderID.js`: Add folder organization to existing flashcards
- `userReport.js`: Generate and email user statistics reports
- `migrateMongoToSQLite.js`: Database migration tool

## Contact

For backend-related inquiries, contact [your-email@example.com](mailto:your-email@example.com)  