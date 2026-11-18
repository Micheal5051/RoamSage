# RoamSage – AI-Powered Travel Planning Platform

RoamSage is an AI-powered travel planning platform that helps users explore destinations, discover attractions and hotels, and create personalized multi-day travel itineraries.

Built with the MERN stack and a separate Python AI service, RoamSage combines full-stack development, Generative AI, and Retrieval-Augmented Generation (RAG) to provide context-aware travel assistance.

## Features

- **Destination Exploration:** Browse destinations and discover travel information and experiences.
- **Attraction Discovery:** Explore tourist attractions and places of interest.
- **Hotel Discovery:** Browse accommodation options and hotel information.
- **Journey Builder:** Generate multi-day itineraries with scheduled sightseeing, lunch breaks, and flexible days.
- **AI Travel Assistant:** Ask travel-related questions and receive context-aware answers using Gemini and RAG.
- **User Authentication:** Register and log in using JWT-based authentication.
- **Trip Management:** Access and manage trips and booking-related information.
- **Map and Location Features:** Explore location-related information using integrated mapping and location services.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- React Router
- Leaflet and React-Leaflet

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### AI Service
- Python
- Flask
- Google Gemini API
- Retrieval-Augmented Generation (RAG)
- ChromaDB

### External Services
- Geoapify
- MongoDB Atlas
- Vercel
- Render

## System Architecture

RoamSage uses a modular architecture consisting of three main services:

1. **React Frontend:** Handles the user interface, navigation, and interactions.
2. **Node.js and Express Backend:** Handles application APIs, authentication, and database operations.
3. **Python Flask AI Service:** Handles AI-powered travel assistance and knowledge retrieval.

The frontend communicates with the Express backend. The backend connects to MongoDB and communicates with the separate AI service when AI functionality is required.

The AI service combines knowledge retrieval with Gemini to generate context-aware responses.

## Live Demo

- **Frontend:** https://roamsage.vercel.app/
- **Backend API:** https://roamsage-api.onrender.com/
- **AI Service:** https://roamsage-ai.onrender.com/

## Running Locally

### Prerequisites

- Node.js and npm
- Python
- MongoDB database
- Google Gemini API key
- Geoapify API key

### 1. Clone the repository

```bash
git clone https://github.com/Micheal5051/RoamSage.git
cd RoamSage
```

### 2. Configure and start the frontend

Open a terminal:

```bash
cd client
npm install
```

Create your local environment file from the template:

```powershell
copy .env.example .env
```

Configure `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 3. Configure and start the backend

Open another terminal from the project root:

```bash
cd server
npm install
```

Create your environment file:

```powershell
copy .env.example .env
```

Configure `server/.env` with your own values:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secure_random_secret
GEOAPIFY_API_KEY=your_geoapify_api_key
AI_SERVICE_URL=http://127.0.0.1:5001
```

Start the backend:

```bash
npm start
```

### 4. Configure and start the AI service

Open another terminal from the project root:

```bash
cd ai-service
py -m venv venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```powershell
copy .env.example .env
```

Configure `ai-service/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=5001
```

Start the AI service:

```bash
python app.py
```

Keep all three services running in separate terminals.

**Note:** Never commit actual `.env` files or API keys. Use the `.env.example` templates for configuration guidance.

## Project Highlights

- Full-stack application built using the MERN stack.
- Separate Python-based AI microservice.
- RAG-based knowledge retrieval using ChromaDB.
- Hybrid retrieval combining semantic search and keyword-based matching.
- Gemini-powered conversational travel assistance.
- Multi-day itinerary generation with flexible-day handling.
- Integration with external APIs and cloud deployment.

## Author

**Micheal**

GitHub: https://github.com/Micheal5051
