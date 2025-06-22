# 🚀 Deploy Fantuan to Share with Friends

Follow these steps to deploy Fantuan so your friends can join from anywhere!

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Render.com Account** (free)
3. **MongoDB Atlas Account** (free)

## 🗄️ Step 1: Set up MongoDB Atlas

1. **Go to [MongoDB Atlas](https://mongodb.com/atlas)**
2. **Create a free account**
3. **Create a new cluster** (choose the free tier)
4. **Set up database access**:
   - Create a database user with username/password
   - Remember these credentials!
5. **Set up network access**:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. **Get your connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://fantuan:yourpassword@cluster0.mongodb.net/fantuan`

## 📤 Step 2: Upload to GitHub

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

## 🌐 Step 3: Deploy to Render

1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New +" → "Blueprint"**
4. **Connect your GitHub repository**:
   - Select your `fantuan` repository
   - Render will detect the `render.yaml` file
5. **Configure environment variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random secret (e.g., `fantuan-secret-key-2024`)
   - `NODE_ENV`: `production`
6. **Click "Apply"**
7. **Wait for deployment** (5-10 minutes)

## 🎉 Step 4: Share with Friends!

1. **Get your URLs**:
   - Backend: `https://fantuan-backend.onrender.com`
   - Frontend: `https://fantuan-frontend.onrender.com`

2. **Share the frontend URL** with your friends:
   ```
   https://fantuan-frontend.onrender.com
   ```

3. **Your friends can**:
   - Register new accounts
   - Create and join groups
   - Chat in real-time
   - Add each other as friends

## 🔧 Troubleshooting

### If deployment fails:
1. **Check the logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Make sure MongoDB Atlas** is accessible

### If friends can't connect:
1. **Check if the app is running** in Render dashboard
2. **Verify the URLs** are correct
3. **Test registration** yourself first

## 💡 Tips

- **Free tier limits**: Render free tier has some limitations but works great for small groups
- **Database**: MongoDB Atlas free tier gives you 512MB storage
- **Custom domain**: You can add a custom domain later if needed

## 🆘 Need Help?

If you encounter issues:
1. Check the Render logs
2. Verify all environment variables
3. Test locally first
4. Check MongoDB Atlas connection

Your friends will love Fantuan! 🎊 