# ImgBB Setup Guide

## Image Upload Setup
✅ **NOW**: Images uploaded to ImgBB cloud storage

## Steps to Setup ImgBB

### 1. Create ImgBB Account
1. Go to [imgbb.com](https://imgbb.com)
2. Sign up for a free account
3. Go to your API settings

### 2. Get Your API Key
From your ImgBB account:
1. Go to "About" > "API"
2. Copy your **API Key**

### 3. Update Environment Variables
Update your `.env` file:

```bash
IMGBB_API_KEY=your_api_key_here
```

### 4. Deploy to Vercel
```bash
npm install
npm run build
git add .
git commit -m "🚀 Switch to ImgBB for image storage"
git push origin main
```

### 5. Set Environment Variable in Vercel
1. Go to your Vercel project
2. Settings > Environment Variables
3. Add `IMGBB_API_KEY`
4. Redeploy

## What Changed

### ✅ Files Updated:
- `/api/upload.ts` - Now uploads to ImgBB
- `package.json` - Removed cloudinary, added form-data and node-fetch
- `.env` - Updated to use IMGBB_API_KEY

### ✅ Files Removed:
- `/server/cloudinary.ts` - Deleted Cloudinary service
- `CLOUDINARY_SETUP.md` - Deleted Cloudinary documentation

## ImgBB Free Plan Limits
- Max file size: 32 MB
- Unlimited uploads
- Images stored permanently
