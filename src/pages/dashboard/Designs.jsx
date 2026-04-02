import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Pencil, Plus, Trash2, Layout, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiDelete } from "@/lib/api";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Designs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("templates");
  const [customDim, setCustomDim] = React.useState({ width: 1080, height: 1080, name: "Untitled Design" });
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const PRESETS = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Story", width: 1080, height: 1920 },
    { name: "Facebook Cover", width: 1640, height: 924 },
    { name: "Standard square", width: 500, height: 500 },
  ];

  const { data: designs = [], isLoading: loading } = useQuery({
    queryKey: ["designs", user?.id],
    queryFn: async () => {
      const data = await apiGet("/api/designs");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/designs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs", user?.id] });
      toast({ title: "Success", description: "Design deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete design", variant: "destructive" });
    }
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this design?")) return;
    deleteMutation.mutate(id);
  };

  const handleCreateCustom = () => {
    localStorage.setItem("custom_dimensions", JSON.stringify(customDim));
    navigate("/dashboard/designs/editor/new");
    setIsModalOpen(false);
  };

  // Guard against non-array designs
  const filteredDesigns = Array.isArray(designs) ? designs.filter(d => {
    const matchesTab = tab === "templates" ? d.type === "template" : d.type === "user";
    const matchesSearch = d.name?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Design Studio</h1>
          <p className="text-muted-foreground">Professional designs for your WhatsApp messages</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" /> Custom Design
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Custom Design</DialogTitle>
              <DialogDescription>
                Set your canvas dimensions or choose a popular preset.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Design Name</Label>
                <Input id="name" value={customDim.name} onChange={(e) => setCustomDim({ ...customDim, name: e.target.value })} className="h-10 bg-secondary/20 border-none px-4 rounded-xl" placeholder="E.g. Summer Sale Flyer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 text-[10px]">
                  <Label className="font-bold text-muted-foreground uppercase tracking-wider pl-1">Width (px)</Label>
                  <Input type="number" value={customDim.width} onChange={(e) => setCustomDim({ ...customDim, width: parseInt(e.target.value) })} className="h-10 bg-secondary/20 border-none px-4 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Height (px)</Label>
                  <Input type="number" value={customDim.height} onChange={(e) => setCustomDim({ ...customDim, height: parseInt(e.target.value) })} className="h-10 bg-secondary/20 border-none px-4 rounded-xl" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Popular Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map(p => (
                    <Button
                      key={p.name}
                      variant="outline"
                      size="sm"
                      className={`h-11 justify-start px-3 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all group ${customDim.width === p.width && customDim.height === p.height ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setCustomDim({ ...customDim, width: p.width, height: p.height, name: p.name })}
                    >
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[10px] font-bold">{p.name}</span>
                        <span className="text-[9px] text-muted-foreground">{p.width} × {p.height} px</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20" onClick={handleCreateCustom}>Create New Design</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex p-1 bg-card rounded-xl backdrop-blur-md border border-border shadow-sm">
          <button
            onClick={() => setTab("templates")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'templates' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
          >
            <Layout className="h-4 w-4" /> Templates
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'saved' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
          >
            <User className="h-4 w-4" /> My Designs
          </button>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${tab === 'templates' ? 'templates' : 'your designs'}...`}
            className="pl-9 h-11 bg-card border-border border focus-visible:ring-1 focus-visible:ring-primary/50 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-80 rounded-3xl bg-secondary/20 animate-pulse border border-border/50" />)}
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-secondary/5 rounded-[2rem] border-2 border-dashed border-border/40">
          <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center shadow-xl mb-6">
            <Sparkles className="h-10 w-10 text-primary/40" />
          </div>
          <p className="text-xl font-bold text-foreground mb-1">No designs found</p>
          <p className="text-sm text-muted-foreground mb-6">Start from scratch or try a different search term.</p>
          <Button variant="outline" size="sm" onClick={() => setTab(tab === 'templates' ? 'saved' : 'templates')} className="rounded-xl px-6 h-9">
            View {tab === 'templates' ? 'My Designs' : 'Templates'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDesigns.map((t) => (
            <motion.div
              key={t._id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative rounded-[2rem] overflow-hidden border bg-card shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => navigate(`/dashboard/designs/editor/${t._id}`)}
            >
              <div className="h-64 bg-secondary/5 flex items-center justify-center overflow-hidden relative">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={t.name} />
                ) : (
                  <div className="flex flex-col items-center gap-3 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                    <Sparkles className="h-12 w-12 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Connectly Studio</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors truncate">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[9px] px-2 py-0 h-5 border-none bg-primary/10 text-primary uppercase font-bold tracking-tight">
                        {t.category || t.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium">Modified recently</span>
                    </div>
                  </div>
                  {tab === "saved" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      onClick={(e) => handleDelete(t._id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md p-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border border-border/50 shadow-lg">
                <Pencil className="h-4 w-4 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Designs;
