import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Upload, Eye, EyeOff, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { FESTIVAL_CATEGORIES } from "@/data/festivalTemplates";
import { apiGet, apiPost, apiUpload } from "@/lib/api";

const ALL_CATEGORIES = [...FESTIVAL_CATEGORIES.filter(c => c !== "All")];

const AdminDesigns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES[0] || "");
  const [customCategory, setCustomCategory] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [footer, setFooter] = useState("From {{business_name}}");
  const [textColor, setTextColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#fbbf24");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ["admin-designs"],
    queryFn: () => apiGet("/api/admin/designs"),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile || !name) throw new Error("Name and image are required");
      setUploading(true);

      // Upload image to Cloudinary via backend
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "design-templates");
      
      const uploadRes = await apiUpload("/api/upload", formData);
      const imageUrl = uploadRes.url;

      const finalCategory = category === "__custom__" ? customCategory : category;

      await apiPost("/api/admin/designs", {
        name,
        category: finalCategory,
        image_url: imageUrl,
        default_heading: heading,
        default_subheading: subheading,
        default_footer: footer,
        text_color: textColor,
        accent_color: accentColor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
      toast({ title: "Design added!" });
      resetForm();
      setUploading(false);
    },
    onError: (e) => {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }) => {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/designs/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-designs"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/designs/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-designs"] });
      toast({ title: "Design deleted" });
    },
  });

  const resetForm = () => {
    setName("");
    setCategory(ALL_CATEGORIES[0] || "");
    setCustomCategory("");
    setHeading("");
    setSubheading("");
    setFooter("From {{business_name}}");
    setTextColor("#ffffff");
    setAccentColor("#fbbf24");
    setImageFile(null);
    setPreviewUrl("");
    setShowForm(false);
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Manage Designs</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Design
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Design Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Diwali Special Offer" />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground"
                >
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">+ Custom Category</option>
                </select>
                {category === "__custom__" && (
                  <Input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Enter category name" className="mt-1" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Design Image *</Label>
              {previewUrl ? (
                <div className="flex items-center gap-3">
                  <img src={previewUrl} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate max-w-[200px]">{imageFile?.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => { setImageFile(null); setPreviewUrl(""); }} className="h-auto p-0 text-xs text-destructive hover:bg-transparent">Remove</Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium mt-2">Click to upload</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG or WebP, max 10MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Default Heading</Label>
                <Input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Happy Diwali!" />
              </div>
              <div className="space-y-2">
                <Label>Default Subheading</Label>
                <Input value={subheading} onChange={e => setSubheading(e.target.value)} placeholder="Festival wishes..." />
              </div>
              <div className="space-y-2">
                <Label>Default Footer</Label>
                <Input value={footer} onChange={e => setFooter(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Text</Label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
              </div>
              <div className="flex items-center gap-2">
                <Label>Accent</Label>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={() => createMutation.mutate()} disabled={uploading || !name || !imageFile}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {uploading ? "Uploading..." : "Add Design"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading designs...</p>
      ) : designs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            No designs added yet. Click "Add Design" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {designs.map((d) => (
            <Card key={d.id} className="overflow-hidden group">
              <div className="relative h-40">
                <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge className="bg-black/50 backdrop-blur-md border-none">{d.category}</Badge>
                </div>
              </div>
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <p className="font-semibold text-sm text-foreground truncate">{d.name}</p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => toggleMutation.mutate({ id: d.id, enabled: !d.enabled })}
                    title={d.enabled ? "Disable" : "Enable"}
                  >
                    {d.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => deleteMutation.mutate(d.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDesigns;
