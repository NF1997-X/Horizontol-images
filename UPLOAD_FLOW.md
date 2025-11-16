# Image Upload & Database Save Flow

## 📋 Complete Upload Process

The image upload system works in 2 main steps:

### Step 1: File Upload to Server
**Endpoint**: `POST /api/upload`
**File**: `api/upload.ts`

1. User selects image file in `AddImageDialog`
2. File uploaded via `uploadImage()` function in `client/src/lib/upload.ts`
3. Server receives file via Busboy parser
4. File saved to `/uploads/` directory with unique filename
5. Returns: `{ url: "/uploads/filename.jpg", message: "Image uploaded successfully" }`

### Step 2: Save Image Metadata to Database  
**Endpoint**: `POST /api/rows/[rowId]/images`
**File**: `api/rows/[rowId]/images.ts`

1. `AddImageDialog` calls `onSubmit()` with image data
2. `Gallery.tsx` calls `createImageMutation.mutate()`
3. Makes POST request to `/api/rows/{rowId}/images` 
4. Server calls `storage.createImage()` to save to database
5. Returns: Image record with auto-generated ID and order

## 🔗 Data Flow

```
AddImageDialog (frontend)
    ↓ uploadImage()
api/upload.ts (file storage)  
    ↓ returns URL
AddImageDialog onSubmit()
    ↓ 
Gallery.tsx createImageMutation
    ↓ POST /api/rows/{rowId}/images
api/rows/[rowId]/images.ts
    ↓ storage.createImage()
server/storage.ts (database)
    ↓ saves to images table
✅ Image appears in gallery
```

## 🎯 Key Components

**Frontend:**
- `AddImageDialog.tsx` - Upload form with file picker
- `Gallery.tsx` - Handles image creation mutation
- `lib/upload.ts` - File upload utility function

**Backend:**
- `api/upload.ts` - File upload endpoint (saves to disk)
- `api/rows/[rowId]/images.ts` - Database save endpoint
- `server/storage.ts` - Database operations
- `server/index.ts` - Static file serving for `/uploads`

## 🚀 Testing Upload

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:5000`
3. Click "Add Image" button on any row
4. Upload image file or enter URL
5. Fill title and subtitle
6. Click "Add Image" to save

Files will be:
- 💾 **Saved to**: `/uploads/filename-timestamp-uuid.jpg`
- 🗄️ **Database**: Images table with metadata
- 🌐 **Accessible**: Via `/uploads/filename.jpg` URL

## 🔧 Troubleshooting

**Upload fails**: Check server logs for file write permissions
**Image not appearing**: Verify database save succeeded  
**404 on images**: Ensure static file serving is enabled
**CORS errors**: Check CORS headers in API endpoints