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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadImage } from "@/lib/upload";
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
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [file, setFile] = useState<File | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [capture, setCapture] = useState<"environment" | "user" | undefined>(undefined);

  // Reset form when dialog closes (transitions from open to closed)
  useEffect(() => {
    if (!open && !isLoading) {
      setUrl("");
      setTitle("");
      setSubtitle("");
      setPreviewUrl(null);
      setErrors({});
      setMode("url");
      setFile(null);
      setLocalLoading(false);
    }
  }, [open, isLoading]);

  // Revoke object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // Only run cleanup on unmount or when previewUrl changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

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

  const handleSubmit = async () => {
    setErrors({});
    if (mode === "url") {
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
      return;
    }

    // Upload mode
    if (!title) {
      setErrors((prev) => ({ ...prev, title: "Title is required" }));
      return;
    }
    if (!file) {
      setErrors((prev) => ({ ...prev, url: "Please select an image" }));
      return;
    }
    try {
      setLocalLoading(true);
      const res = await uploadImage(file);
      const finalUrl = res.url;
      onSubmit({ url: finalUrl, title, subtitle: subtitle || undefined });
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, url: e?.message || "Failed to upload image" }));
    } finally {
      setLocalLoading(false);
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
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList>
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="url">
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
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-3">
                <Label>Select image</Label>
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="file-input"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setFile(f);
                      if (f) {
                        const obj = URL.createObjectURL(f);
                        setPreviewUrl(obj);
                      } else {
                        setPreviewUrl(null);
                      }
                    }}
                    // capture attribute toggled via label buttons below
                    capture={capture as any}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setCapture(undefined);
                      document.getElementById("file-input")?.dispatchEvent(new MouseEvent("click"));
                    }}
                  >
                    Choose from device
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCapture("environment");
                      const input = document.getElementById("file-input") as HTMLInputElement | null;
                      if (input) {
                        // Force attribute update then click
                        input.setAttribute("capture", "environment");
                        input.click();
                      }
                    }}
                  >
                    Take photo
                  </Button>
                </div>
                {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
              </div>
            </TabsContent>
          </Tabs>

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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading || localLoading} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || localLoading} data-testid="button-submit-image">
            {isLoading || localLoading ? "Adding..." : "Add Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
