import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageTabs } from "@/components/PageTabs";
import { HorizontalScrollRow, ImageItem } from "@/components/HorizontalScrollRow";
import { AddImageDialog } from "@/components/AddImageDialog";
import { EditImageDialog } from "@/components/EditImageDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { AddRowDialog } from "@/components/AddRowDialog";
import { EditRowDialog } from "@/components/EditRowDialog";
import { AddPageDialog } from "@/components/AddPageDialog";
import { EditPageDialog } from "@/components/EditPageDialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Page, Row, GalleryImage, ShareLink } from "@shared/schema";
import LightGallery from "lightgallery/react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-zoom.css";

interface RowWithImages extends Row {
  images: GalleryImage[];
}

export default function Gallery() {
  const { toast } = useToast();
  const [activePage, setActivePage] = useState<string>("");
  
  const [addImageDialog, setAddImageDialog] = useState<{ open: boolean; rowId?: string }>({ open: false });
  const [editImageDialog, setEditImageDialog] = useState<{ open: boolean; rowId?: string; imageId?: string }>({ open: false });
  const [deleteImageDialog, setDeleteImageDialog] = useState<{ open: boolean; rowId?: string; imageId?: string }>({ open: false });
  const [addRowDialog, setAddRowDialog] = useState(false);
  const [editRowDialog, setEditRowDialog] = useState<{ open: boolean; rowId?: string }>({ open: false });
  const [deleteRowDialog, setDeleteRowDialog] = useState<{ open: boolean; rowId?: string }>({ open: false });
  const [addPageDialog, setAddPageDialog] = useState(false);
  const [editPageDialog, setEditPageDialog] = useState<{ open: boolean; pageId?: string }>({ open: false });
  const [deletePageDialog, setDeletePageDialog] = useState<{ open: boolean; pageId?: string }>({ open: false });
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string; thumb: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: pages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const { data: rows = [], isLoading: rowsLoading } = useQuery<Row[]>({
    queryKey: ["/api/pages", activePage, "rows"],
    queryFn: async () => {
      if (!activePage) return [];
      const response = await fetch(`/api/pages/${activePage}/rows`);
      if (!response.ok) throw new Error("Failed to fetch rows");
      return response.json();
    },
    enabled: !!activePage,
  });

  const { data: allImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/images", activePage],
    queryFn: async () => {
      const imagePromises = rows.map((row) =>
        fetch(`/api/rows/${row.id}/images`).then((res) => res.json())
      );
      const imageArrays = await Promise.all(imagePromises);
      return imageArrays.flat();
    },
    enabled: rows.length > 0,
  });

  const rowsWithImages: RowWithImages[] = rows.map((row) => ({
    ...row,
    images: allImages.filter((img) => img.rowId === row.id),
  }));

  useEffect(() => {
    if (!activePage && pages.length > 0 && !pagesLoading) {
      setActivePage(pages[0].id);
    }
  }, [activePage, pages, pagesLoading]);

  const createPageMutation = useMutation({
    mutationFn: async (name: string): Promise<Page> => {
      const response = await apiRequest("/api/pages", "POST", { name });
      return response;
    },
    onSuccess: (newPage: Page) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      setActivePage(newPage.id);
      toast({ title: "Page created successfully" });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ pageId, name }: { pageId: string; name: string }): Promise<Page> => {
      const response = await apiRequest(`/api/pages/${pageId}`, "PATCH", { name });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "Page renamed successfully" });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return apiRequest(`/api/pages/${pageId}`, "DELETE");
    },
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      if (activePage === pageId) {
        queryClient.invalidateQueries({ queryKey: ["/api/pages", pageId, "rows"] });
        queryClient.invalidateQueries({ queryKey: ["/api/images", pageId] });
      }
      toast({ title: "Page deleted successfully" });
    },
  });

  const createRowMutation = useMutation({
    mutationFn: async (title: string) => {
      return apiRequest("/api/rows", "POST", { pageId: activePage, title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages", activePage, "rows"] });
      toast({ title: "Row created successfully" });
    },
  });

  const updateRowMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      return apiRequest(`/api/rows/${id}`, "PATCH", { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages", activePage, "rows"] });
      toast({ title: "Row updated successfully" });
    },
  });

  const deleteRowMutation = useMutation({
    mutationFn: async (rowId: string) => {
      return apiRequest(`/api/rows/${rowId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages", activePage, "rows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/images", activePage] });
      toast({ title: "Row deleted successfully" });
    },
  });

  const createImageMutation = useMutation({
    mutationFn: async (data: { rowId: string; url: string; title: string; subtitle?: string }) => {
      console.log('Creating image with data:', data);
      return apiRequest("/api/images", "POST", {
        rowId: data.rowId,
        url: data.url,
        title: data.title,
        subtitle: data.subtitle || null,
      });
    },
    onSuccess: (newImage) => {
      console.log('Image created successfully:', newImage);
      // Invalidate all related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rows"] });
      setAddImageDialog({ open: false });
      toast({ title: "✅ Image added successfully", variant: "default" });
    },
    onError: (error: any) => {
      console.error('Failed to create image:', error);
      toast({ 
        title: "❌ Failed to add image", 
        description: error?.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async (data: { id: string; url: string; title: string; subtitle?: string }) => {
      return apiRequest(`/api/images/${data.id}`, "PATCH", {
        url: data.url,
        title: data.title,
        subtitle: data.subtitle || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images", activePage] });
      toast({ title: "Image updated successfully" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return apiRequest(`/api/images/${imageId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images", activePage] });
      toast({ title: "Image deleted successfully" });
    },
  });

  const handleAddImage = (rowId: string, data: { url: string; title: string; subtitle?: string }) => {
    console.log('handleAddImage called with:', { rowId, data });
    if (!rowId) {
      toast({ title: "❌ Error", description: "No row selected", variant: "destructive" });
      return;
    }
    createImageMutation.mutate({ rowId, ...data });
  };

  const handleEditImage = (imageId: string, data: { url: string; title: string; subtitle?: string }) => {
    updateImageMutation.mutate({ id: imageId, ...data });
  };

  const handleDeleteImage = (imageId: string) => {
    deleteImageMutation.mutate(imageId);
  };

  const handleAddRow = (title: string) => {
    createRowMutation.mutate(title);
  };

  const handleEditRow = (rowId: string, title: string) => {
    updateRowMutation.mutate({ id: rowId, title });
  };

  const handleDeleteRow = (rowId: string) => {
    deleteRowMutation.mutate(rowId);
  };

  const handleAddPage = (name: string) => {
    createPageMutation.mutate(name);
  };

  const handleEditPage = (name: string) => {
    if (editPageDialog.pageId) {
      updatePageMutation.mutate({ pageId: editPageDialog.pageId, name });
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length === 1) {
      toast({ title: "Cannot delete the last page", variant: "destructive" });
      return;
    }
    if (activePage === pageId) {
      const newActivePage = pages.find((p) => p.id !== pageId);
      if (newActivePage) {
        setActivePage(newActivePage.id);
      }
    }
    deletePageMutation.mutate(pageId);
  };

  const sharePageMutation = useMutation({
    mutationFn: async (pageId: string): Promise<ShareLink> => {
      const response = await apiRequest(`/api/share-links/${pageId}`, "POST");
      return response;
    },
    onSuccess: async (shareLink: ShareLink) => {
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/preview/${shareLink.shortCode}`;
      
      // REAL COPY FUNCTION - INI YANG BETUL!
      const realCopyToClipboard = async (text: string): Promise<boolean> => {
        console.log('🔥 REAL COPY attempt for:', text);
        
        // Method 1: Modern clipboard (try multiple times)
        if (navigator.clipboard && window.isSecureContext) {
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              await navigator.clipboard.writeText(text);
              console.log(`✅ Modern clipboard SUCCESS on attempt ${attempt}`);
              return true;
            } catch (error) {
              console.log(`❌ Modern clipboard failed attempt ${attempt}:`, error);
              if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }

        // Method 2: Focus + select + copy (aggressive version)
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-1000px';
            textarea.style.top = '-1000px';
            
            document.body.appendChild(textarea);
            
            // Force focus and selection
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            
            // Try copy command
            const copyResult = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            if (copyResult) {
              console.log(`✅ execCommand SUCCESS on attempt ${attempt}`);
              return true;
            }
            console.log(`❌ execCommand failed attempt ${attempt}`);
          } catch (error) {
            console.log(`❌ execCommand error attempt ${attempt}:`, error);
          }
        }

        // Method 3: Fallback with user interaction
        try {
          // Create a visible input for user to copy manually
          const input = document.createElement('input');
          input.type = 'text';
          input.value = text;
          input.style.position = 'fixed';
          input.style.left = '50%';
          input.style.top = '50%';
          input.style.transform = 'translate(-50%, -50%)';
          input.style.zIndex = '999999';
          input.style.padding = '10px';
          input.style.fontSize = '14px';
          input.style.border = '2px solid #007acc';
          input.style.borderRadius = '8px';
          input.style.background = 'white';
          input.style.color = 'black';
          input.style.width = '400px';
          
          document.body.appendChild(input);
          
          // Auto select the text
          input.focus();
          input.select();
          
          // Show instruction
          alert('Link is selected below. Press Ctrl+C (or Cmd+C on Mac) to copy, then press OK.');
          
          // Clean up
          document.body.removeChild(input);
          console.log('✅ Manual copy assistance provided');
          return true;
        } catch (error) {
          console.log('❌ Manual copy failed:', error);
          return false;
        }
      };

      const copySuccess = await realCopyToClipboard(shareUrl);
      
      if (copySuccess) {
        toast({ 
          title: "✅ Link copied!", 
          description: "Share link has been copied to clipboard",
          variant: "default"
        });
      } else {
        // Fallback - show the URL for manual copying
        toast({ 
          title: "📋 Share Link Created", 
          description: shareUrl,
          variant: "default",
          duration: 10000
        });
      }
    },
    onError: (error) => {
      console.error('Share link error:', error);
      toast({ 
        title: "❌ Failed to create share link", 
        description: "Sila cuba lagi",
        variant: "destructive" 
      });
    },
  });

  const handleCopyLink = (pageId: string) => {
    console.log('Copy link clicked for pageId:', pageId);
    sharePageMutation.mutate(pageId);
  };

  const handleOpenPreview = async (pageId: string) => {
    try {
      console.log('🔍 Opening preview for pageId:', pageId);
      const shareLink: ShareLink = await apiRequest(`/api/share-links/${pageId}`, "POST");
      console.log('✅ Share link created:', shareLink);
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/preview/${shareLink.shortCode}`;
      console.log('🌐 Opening URL:', shareUrl);
      window.open(shareUrl, '_blank');
    } catch (error) {
      console.error('❌ Preview error:', error);
      toast({ 
        title: "Failed to open preview", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleImageClick = (rowImages: GalleryImage[], index: number) => {
    const images = rowImages.map((img) => ({ src: img.url, thumb: img.url }));
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const currentEditImage = editImageDialog.imageId
    ? allImages.find((i) => i.id === editImageDialog.imageId)
    : undefined;

  const currentEditRow = editRowDialog.rowId
    ? rows.find((r) => r.id === editRowDialog.rowId)
    : undefined;

  if (pagesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <h1 className="title-text font-bold" data-testid="text-app-title">Gallery Manager</h1>
          <ThemeToggle />
        </div>
      </header>

      <PageTabs
        pages={pages}
        activePage={activePage}
        onPageChange={setActivePage}
        onAddPage={() => setAddPageDialog(true)}
        onEditPage={(pageId) => setEditPageDialog({ open: true, pageId })}
        onDeletePage={(pageId) => setDeletePageDialog({ open: true, pageId })}
        onCopyLink={handleCopyLink}
        onOpenPreview={handleOpenPreview}
      />

      <main className="max-w-7xl mx-auto">
        {rowsLoading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading rows...</p>
          </div>
        ) : rowsWithImages.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No rows yet</h2>
            <p className="text-muted-foreground mb-6">Create your first row to start adding images</p>
            <Button onClick={() => setAddRowDialog(true)} data-testid="button-create-first-row">
              <Plus className="w-4 h-4 mr-2" />
              Create Row
            </Button>
          </div>
        ) : (
          <>
            {rowsWithImages.map((row) => (
              <HorizontalScrollRow
                key={row.id}
                title={row.title}
                images={row.images}
                onImageClick={(_, index) => handleImageClick(row.images, index)}
                onEditRow={() => setEditRowDialog({ open: true, rowId: row.id })}
                onDeleteRow={() => setDeleteRowDialog({ open: true, rowId: row.id })}
                onAddImage={() => setAddImageDialog({ open: true, rowId: row.id })}
                onEditImage={(imageId) => setEditImageDialog({ open: true, rowId: row.id, imageId })}
                onDeleteImage={(imageId) => setDeleteImageDialog({ open: true, rowId: row.id, imageId })}
              />
            ))}
            <div className="py-8 px-8">
              <Button onClick={() => setAddRowDialog(true)} variant="outline" className="w-full" data-testid="button-add-row">
                <Plus className="w-4 h-4 mr-2" />
                Add New Row
              </Button>
            </div>
          </>
        )}
      </main>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100]">
          <LightGallery
            dynamic
            dynamicEl={lightboxImages}
            index={lightboxIndex}
            plugins={[lgThumbnail, lgZoom]}
            onAfterClose={() => setLightboxOpen(false)}
            speed={300}
            mode="lg-fade"
          />
        </div>
      )}

      <AddImageDialog
        open={addImageDialog.open}
        onOpenChange={(open) => setAddImageDialog({ open, rowId: open ? addImageDialog.rowId : undefined })}
        onSubmit={(data) => addImageDialog.rowId && handleAddImage(addImageDialog.rowId, data)}
        isLoading={createImageMutation.isPending}
      />

      <EditImageDialog
        open={editImageDialog.open}
        onOpenChange={(open) => setEditImageDialog({ open })}
        onSubmit={(data) => editImageDialog.imageId && handleEditImage(editImageDialog.imageId, data)}
        initialData={currentEditImage}
      />

      <DeleteConfirmDialog
        open={deleteImageDialog.open}
        onOpenChange={(open) => setDeleteImageDialog({ open })}
        onConfirm={() => {
          if (deleteImageDialog.imageId) {
            handleDeleteImage(deleteImageDialog.imageId);
            setDeleteImageDialog({ open: false });
          }
        }}
        title="Delete Image?"
        description="This action cannot be undone. This will permanently delete the image from the gallery."
      />

      <AddRowDialog
        open={addRowDialog}
        onOpenChange={setAddRowDialog}
        onSubmit={handleAddRow}
      />

      <EditRowDialog
        open={editRowDialog.open}
        onOpenChange={(open) => setEditRowDialog({ open })}
        onSubmit={(title) => {
          if (editRowDialog.rowId) {
            handleEditRow(editRowDialog.rowId, title);
          }
        }}
        initialTitle={currentEditRow?.title}
      />

      <DeleteConfirmDialog
        open={deleteRowDialog.open}
        onOpenChange={(open) => setDeleteRowDialog({ open })}
        onConfirm={() => {
          if (deleteRowDialog.rowId) {
            handleDeleteRow(deleteRowDialog.rowId);
            setDeleteRowDialog({ open: false });
          }
        }}
        title="Delete Row?"
        description="This will permanently delete the row and all its images. This action cannot be undone."
      />

      <AddPageDialog
        open={addPageDialog}
        onOpenChange={setAddPageDialog}
        onSubmit={handleAddPage}
      />

      <EditPageDialog
        open={editPageDialog.open}
        onOpenChange={(open) => setEditPageDialog({ ...editPageDialog, open })}
        onSubmit={handleEditPage}
        currentName={pages.find((p) => p.id === editPageDialog.pageId)?.name || ""}
      />

      <DeleteConfirmDialog
        open={deletePageDialog.open}
        onOpenChange={(open) => setDeletePageDialog({ open })}
        onConfirm={() => {
          if (deletePageDialog.pageId) {
            handleDeletePage(deletePageDialog.pageId);
            setDeletePageDialog({ open: false });
          }
        }}
        title="Delete Page?"
        description="This will permanently delete the page and all its rows and images. This action cannot be undone."
      />
    </div>
  );
}
