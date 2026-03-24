import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useState } from "react";



const bannerConfig = {
  error: {
    icon,
    bg: "bg-destructive/5 border-destructive/20",
    iconClass: "text-destructive",
    textClass: "text-destructive",
  },
  success: {
    icon,
    bg: "bg-success/5 border-success/20",
    iconClass: "text-success",
    textClass: "text-success",
  },
  info: {
    icon,
    bg: "bg-info/5 border-info/20",
    iconClass: "text-info",
    textClass: "text-info",
  },
};

const AlertBanner = ({ type, message, dismissible = true }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const config = bannerConfig[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bg}`}>
      
      <p className={`text-sm flex-1 ${config.textClass}`}>{message}</p>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover-foreground transition-colors">
          
        </button>
      )}
    </div>
  );
};

export default AlertBanner;


