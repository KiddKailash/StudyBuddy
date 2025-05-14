# StudyBuddy - Smart Flashcard Learning Platform

StudyBuddy is a comprehensive learning platform that helps students and professionals create AI-powered study materials from various content sources. This monorepo contains both the frontend and backend components of the application.

## Overview

StudyBuddy enables users to:
- Generate flashcards automatically from uploaded documents, pasted text, YouTube videos, and websites
- Organize study materials in folders
- Generate multiple-choice quizzes based on content
- Create AI-powered summaries of learning materials
- Interact with AI assistants for content clarification
- Connect with Notion for seamless integration

## Repository Structure

```
studybuddy/
├── frontend/       # React-based user interface
├── backend/        # Node.js API server
└── README.md       # This file
```

## Tech Stack

### Frontend
- React with Vite
- Material UI (MUI)
- React Router
- Axios for API requests
- i18next for internationalization
- Stripe integration for payments

### Backend
- Node.js with Express
- MongoDB for database
- JWT authentication
- OpenAI API integration
- Stripe for payment processing
- Notion API integration

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB instance
- Various API keys (OpenAI, Stripe, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/studybuddy.git
   cd studybuddy
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   # Create .env file with required environment variables
   npm start
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   # Create .env file with required environment variables
   npm run dev
   ```

For detailed setup instructions and environment variables, please refer to the README files in the respective subfolders.

## Features

- **User Authentication**: Secure login and registration system
- **Flashcard Generation**: AI-powered creation of study cards
- **Multiple Choice Quizzes**: Automatically generated test questions
- **Content Summaries**: AI-generated summaries of learning materials
- **AI Chat**: Interactive Q&A with AI assistants
- **Folder Organization**: Organize study materials logically
- **Notion Integration**: Connect and sync with Notion
- **Subscription Management**: Freemium model with Stripe

## License

This project is proprietary software. All rights reserved.

## Contact

For any inquiries, please contact [kiddkailash@gmail.com](mailto:kiddkailash@gmail.com).