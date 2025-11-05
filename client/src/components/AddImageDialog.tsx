import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
});

interface AddImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { url: string; title: string; subtitle?: string }) => void;
  isLoading?: boolean;
}

export function AddImageDialog({ open, onOpenChange, onSubmit, isLoading = false }: AddImageDialogProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Reset form when dialog closes (transitions from open to closed)
  useEffect(() => {
    if (!open && !isLoading) {
      setUrl("");
      setTitle("");
      setSubtitle("");
      setPreviewUrl(null);
      setErrors({});
    }
  }, [open, isLoading]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    try {
      new URL(value);
      setPreviewUrl(value);
      setErrors((prev) => ({ ...prev, url: undefined }));
    } catch {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = () => {
    try {
      const data = imageSchema.parse({ url, title, subtitle: subtitle || undefined });
      onSubmit(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { url?: string; title?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "url") fieldErrors.url = err.message;
          if (err.path[0] === "title") fieldErrors.title = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      onOpenChange(false);
    } else if (newOpen) {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="dialog-add-image">
        <DialogHeader>
          <DialogTitle>Add New Image</DialogTitle>
          <DialogDescription>
            Enter the image URL and details to add it to the gallery.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">Image URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              data-testid="input-image-url"
            />
            {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-square w-full max-w-xs rounded-lg overflow-hidden border border-border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewUrl(null)}
                  data-testid="img-preview"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Image title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-image-title"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (Optional)</Label>
            <Input
              id="subtitle"
              placeholder="Image subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              data-testid="input-image-subtitle"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-submit-image">
            {isLoading ? "Adding..." : "Add Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
