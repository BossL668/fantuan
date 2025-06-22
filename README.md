# Fantuan - Fan Community Platform

A modern web application designed for fans to form groups, chat with each other, and build communities around their favorite content.

## Features

- **User Authentication**: Secure registration and login system
- **Group Management**: Create and join fan groups
- **Real-time Chat**: Live messaging within groups using Socket.io
- **Friend System**: Search and add other users as friends
- **User Profiles**: Customizable profiles with interests and favorites
- **Modern UI**: Beautiful, responsive interface built with React
- **Real-time Notifications**: Stay updated with group activities

## Tech Stack

- **Frontend**: React.js with modern hooks and context
- **Backend**: Node.js with Express
- **Real-time**: Socket.io for live chat
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt
- **Styling**: CSS3 with modern design principles

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Create a `.env` file in the root directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Render.com

### Prerequisites
- MongoDB Atlas account (free tier)
- Render.com account (free tier)

### Step 1: Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/fantuan`)

### Step 2: Deploy to Render
1. **Fork/Upload to GitHub**:
   - Create a GitHub repository
   - Upload your Fantuan code
   
2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   
3. **Configure Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random secret string (e.g., `fantuan-secret-key-2024`)
   - `NODE_ENV`: `production`
   
4. **Deploy**:
   - Render will automatically build and deploy both frontend and backend
   - Get your public URLs (e.g., `https://fantuan.onrender.com`)

### Step 3: Share with Friends
- Share the frontend URL with your friends
- They can register and start using Fantuan!

## Usage

- **Local**: The application will run on `http://localhost:3000`
- **Deployed**: Access via your Render URL
- Register a new account to start creating fan groups
- Join existing groups or create your own
- Start chatting with fellow fans in real-time
- Search and add friends

## Project Structure

```
fantuan/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Main dependencies
├── render.yaml      # Render deployment config
└── README.md        # This file
```

## Contributing

This is a fan community platform. Feel free to contribute and make it better for fans worldwide! 