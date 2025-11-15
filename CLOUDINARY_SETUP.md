# Cloudinary Setup Guide

## Problem Fixed
❌ **BEFORE**: `EROFS: read-only file system` error when uploading images
✅ **AFTER**: Images uploaded to Cloudinary cloud storage

## Steps to Setup Cloudinary

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your Dashboard

### 2. Get Your Credentials
From your Cloudinary Dashboard, copy:
- **Cloud Name** 
- **API Key**
- **API Secret**

### 3. Update Environment Variables
Update your `.env` file (or add environment variables in Vercel):

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Deploy to Vercel
```bash
npm install cloudinary
npm run build
git add .
git commit -m "🚀 Add Cloudinary cloud storage for images"
git push origin main
```

### 5. Set Environment Variables in Vercel
1. Go to your Vercel project
2. Settings > Environment Variables
3. Add the three Cloudinary variables
4. Redeploy

## What Changed

### ✅ Files Updated:
- `/api/upload.ts` - Now uploads to Cloudinary instead of local filesystem
- `/server/cloudinary.ts` - New service for Cloudinary operations
- `package.json` - Added cloudinary dependency

### ✅ Benefits:
- ✅ No more read-only filesystem errors
- ✅ Images stored in cloud (reliable & fast)
- ✅ Automatic image optimization
- ✅ CDN delivery worldwide
- ✅ Works on all deployment platforms

### ✅ Features Added:
- Auto image optimization (quality: auto, format: auto)
- Proper error handling and logging
- Organized folder structure (`gallery-images/`)
- Support for image deletion (for future use)

## Next Steps
1. Install cloudinary: `npm install cloudinary`
2. Set up your Cloudinary credentials
3. Deploy and test image uploads
4. Images will now be stored at `https://res.cloudinary.com/your_cloud/...` URLs

## Testing
After setup, try uploading an image. You should see:
- ✅ Console log: "📁 Uploading to Cloudinary..."
- ✅ Console log: "✅ Cloudinary upload successful: https://..."
- ✅ Image displays properly
- ❌ No more "read-only file system" errors!