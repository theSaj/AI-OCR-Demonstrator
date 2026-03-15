# AI OCR Demonstrator

## Overview
Antigravity is a file management and OCR processing application.

## Prerequisites
- Node.js installed

## How to Launch

The application consists of a backend server and a frontend client. You need to run them in separate terminal windows.

### 1. Start the Backend Server
This handles file operations and the SQLite database.
```bash
node server/index.js
```
The server will start on `http://localhost:3001`.

### 2. Start the Frontend Application
This launches the React interface.
```bash
npm run dev
```
The application will be accessible at the URL provided by Vite (usually `http://localhost:5173`).

## Project Structure
- `/server`: Express backend and database logic
- `/src`: React frontend
- `/unprocessed`: Directory for uploaded files
- `/processed`: Directory for files after OCR processing
