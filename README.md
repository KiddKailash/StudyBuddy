# StudyCards Backend

## Overview

The StudyCards Backend is a Node.js API for fetching YouTube video transcripts, supporting the StudyCards application. It retrieves and serves video transcripts in various languages based on a provided YouTube URL.

## Tech Stack

- **Node.js** with **Express**: Backend server and API framework.
- **youtube-captions-scraper**: Retrieves captions from YouTube videos.
- **Render**: Cloud platform for hosting.
- **CORS**: Middleware to allow cross-origin requests from the frontend.

## Features

- **Fetch Transcripts**: Retrieves captions for a given YouTube video URL.
- **Supports Multiple Languages**: Default is English, customizable via query parameters.
- **Error Handling**: Returns clear messages for invalid requests or unavailable transcripts.  