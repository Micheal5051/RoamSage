# RoamSage – AI-Powered Travel Planning Platform

RoamSage is an AI-powered travel planning platform designed to help users discover destinations, explore attractions, find hotels, and generate personalized multi-day travel itineraries.

Built using the MERN stack, Python, and Generative AI, RoamSage combines full-stack web development with Retrieval-Augmented Generation (RAG) to deliver intelligent travel assistance.

## Features

- **Destination Exploration:** Browse destinations and discover travel information, attractions, and experiences.
- **Attractions:** Explore places of interest with relevant details and images.
- **Hotel Discovery:** Browse hotels and explore accommodation options.
- **Journey Builder:** Generate personalized multi-day itineraries with scheduled sightseeing, lunch breaks, and flexible days.
- **AI Travel Assistant:** Ask travel-related questions and receive context-aware responses using RAG.
- **User Authentication:** Register and log in securely.
- **Trip Management:** Access and manage saved trips and booking-related information.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### AI Service
- Python
- Flask
- Google Gemini
- Retrieval-Augmented Generation (RAG)
- ChromaDB

### External Services
- Geoapify
- Google Maps (where configured)

## Architecture

RoamSage uses a modular architecture with three main services:

1. **Frontend:** React application responsible for the user interface and interactions.
2. **Backend API:** Express server responsible for application APIs, authentication, and database operations.
3. **AI Service:** Flask application responsible for AI-powered travel assistance and retrieval from the travel knowledge base.

The frontend communicates with the backend API, which can communicate with the separate AI service when AI functionality is requested.

## Live Demo

- **Frontend:** https://roamsage.vercel.app
- **Backend API:** https://roamsage-api.onrender.com
- **AI Service:** https://roamsage-ai.onrender.com

## Running Locally

### Prerequisites
- Node.js and npm
- Python
- MongoDB database
- Gemini API key
- Geoapify API key

### 1. Clone the repository

```bash
https://github.com/Micheal5051/RoamSage.git
cd travel-explorer
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

Configure the frontend environment using the provided environment example, including the backend API URL.

Start the frontend:

```bash
npm run dev
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

Configure the backend environment variables using the project's `.env.example` file.

Start the backend:

```bash
node index.js
```

### 4. Set up the AI service

Open another terminal:

```bash
cd ai-service
```

Create and activate a Python virtual environment, then install the dependencies listed in `requirements.txt`.

Configure the required AI environment variables and start the Flask application using the project's configured startup command.

## Project Highlights

- Full-stack application development using the MERN stack.
- Integration of a separate Python-based AI service.
- RAG-based retrieval from a structured travel knowledge base.
- AI-powered personalized travel assistance.
- Multi-day itinerary generation with scheduling and flexible-day handling.
- Integration with external APIs and cloud deployment.

## Author

Developed as a full-stack and AI-powered travel technology project.
