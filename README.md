# ClipCard

ClipCard is a flashcard generation platform that allows users to create study cards from uploaded files, and pasted text. This frontend repository connects with a backend server to process files and text into structured flashcards using the OpenAI API.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)

## Overview

ClipCard's frontend is a React-based application that serves as an intuitive interface for creating flashcards. Users can log in, upload documents, paste text, or (in the future) provide a YouTube URL to generate a flashcard session using the OpenAI API. The app's design emphasizes accessibility, ease of use, and performance.

## Features

- **User Authentication**: Allows users to create accounts and securely log in.
- **Flashcard Generation**: Generate flashcards by uploading a document or pasting text.
- **Flashcard Management**: View, rename, or delete existing flashcard sessions.
- **Responsive Design**: Optimized for various screen sizes and devices.

## Tech Stack

### Frontend
- **React** with **Vite**: Fast, modern JavaScript framework for building user interfaces.
- **Material UI (MUI)**: React component library for a consistent, accessible, and responsive design.
- **Axios**: For handling API requests to the backend server.
- **React Router**: Enables navigation across different routes and tabs.

### Backend Integration
The frontend connects to a Node.js backend server (see the backend repository for details), which manages:
- **OpenAI API**: Processes document or text input to generate structured flashcards.
- **Database**: Stores user sessions and flashcard data.

### Database
User information and ascociated flashcards are stored from the front end, through a backend server, and onto a MongoDB database.

## Getting Started

To get a local copy of the project up and running, follow these steps.

### Prerequisites
- Node.js and npm installed on your machine
- Backend server URL (required for connecting with APIs)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/clipcard-frontend.git
   cd clipcard-frontend
    ```
2. Install Dependencies
    ```bash
    npm install
    ```
3. Create a .env file in the root directory with the following variable:
    ```plaintext
    VITE_LOCAL_BACKEND_URL=<backend_server_url>
    ```
    Replace <backend_server_url> with the URL of your backend server.

### Running the Project
```bash
npm run dev
```