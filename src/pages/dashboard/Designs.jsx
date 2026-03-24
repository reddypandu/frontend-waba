import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Pencil, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const Designs = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("templates");

  // Mock data
  const templates = [
    { id: '1', name: 'Eid Mubarak', category: 'Festival' },
    { id: '2', name: 'Special Offer', category: 'Business' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Design Studio</h1>
          <p className="text-muted-foreground">Professional designs for your WhatsApp messages</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Custom Design</Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex p-1 bg-secondary rounded-lg">
          <button 
            onClick={() => setTab("templates")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'templates' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Templates
          </button>
          <button 
            onClick={() => setTab("saved")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'saved' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            My Designs
          </button>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -5 }}
            className="group relative rounded-3xl overflow-hidden border bg-card shadow-sm hover:shadow-xl transition-all"
          >
            <div className="h-64 bg-primary/5 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary opacity-20" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{t.name}</h3>
              <Badge variant="outline" className="mt-1">{t.category}</Badge>
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button onClick={() => navigate(`/dashboard/designs/editor/${t.id}`)} variant="secondary" size="sm">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Designs;
