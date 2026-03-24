import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RotateCcw, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const DesignEditor = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/designs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Design Studio</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-2" /> Reset</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Download</Button>
          <Button size="sm"><Save className="h-4 w-4 mr-2" /> Save Design</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border p-6 space-y-6 bg-card overflow-y-auto">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Editor Tools</h3>
          {/* Tool sections */}
          <div className="p-4 rounded-xl border-2 border-dashed border-primary/20 text-center text-sm text-muted-foreground italic">
            Select an element to edit properties
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-secondary/30 flex items-center justify-center p-12">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-[500px] h-[500px] bg-white rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center border-8 border-white"
           >
              <div className="text-center space-y-2 opacity-20">
                <div className="w-20 h-20 rounded-full bg-primary mx-auto" />
                <p className="font-bold">Design Canvas</p>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;
