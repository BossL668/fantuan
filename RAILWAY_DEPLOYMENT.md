# 🚀 Deploy Fantuan on Railway.app

Railway makes deployment super easy! Everything (database + app) in one place.

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Railway.app Account** (free)

## 🚀 Step 1: Upload to GitHub

1. **Create a new GitHub repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `fantuan`
   - Make it public
   - Don't initialize with README

2. **Upload your code**:
   ```bash
   # In your project directory
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fantuan.git
   git push -u origin main
   ```

## 🌐 Step 2: Deploy on Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your `fantuan` repository**
6. **Railway will automatically detect it's a Node.js app**

## 🗄️ Step 3: Add MongoDB Database

1. **In your Railway project dashboard**:
   - Click "New" → "Database" → "MongoDB"
   - Railway will create a MongoDB instance
   - Wait for it to be ready (green status)

2. **Get the connection string**:
   - Click on your MongoDB service
   - Go to "Connect" tab
   - Copy the "MongoDB Connection URL"

## ⚙️ Step 4: Configure Environment Variables

1. **In your Railway project**:
   - Click on your main service (the app)
   - Go to "Variables" tab
   - Add these variables:

   ```
   MONGODB_URI=mongodb://your-railway-mongodb-url
   JWT_SECRET=fantuan-secret-key-2024
   NODE_ENV=production
   PORT=3000
   ```

2. **Replace the MongoDB URI** with the one from Step 3

## 🎉 Step 5: Deploy and Share!

1. **Railway will automatically deploy** when you add the variables
2. **Wait for deployment** (2-3 minutes)
3. **Get your public URL**:
   - Click on your main service
   - Copy the "Domain" URL
   - Example: `https://fantuan-production.up.railway.app`

4. **Share with friends**:
   ```
   https://fantuan-production.up.railway.app
   ```

## ✅ What Your Friends Get

- **Register accounts** with email/password
- **Create fan groups** by category
- **Real-time chat** in groups
- **Add friends** and manage friend requests
- **Modern, responsive design**

## 🔧 Troubleshooting

### If deployment fails:
1. **Check Railway logs** in the dashboard
2. **Verify environment variables** are set
3. **Make sure MongoDB is connected**

### If friends can't access:
1. **Check if the app is running** (green status)
2. **Test the URL yourself first**
3. **Verify the domain is accessible**

## 💡 Railway Benefits

- ✅ **Free tier**: $5 credit monthly
- ✅ **Automatic deployments** from GitHub
- ✅ **Built-in MongoDB** database
- ✅ **Custom domains** available
- ✅ **SSL certificates** included
- ✅ **Easy scaling** if needed

## 🎊 You're Done!

Your friends can now:
1. **Visit your Railway URL**
2. **Register accounts**
3. **Start using Fantuan immediately**

No complex setup needed - Railway handles everything! 🚀 