import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Hash, Phone, MessageSquare, FileText } from "lucide-react";



const DetailRow = ({
  icon,
  label,
  value,
  badge,
  badgeVariant,
}: {
  icon.ComponentType<{ className? }>;
  label;
  value?;
  badge?;
  badgeVariant?: "success" | "warning" | "muted";
}) => {
  const badgeStyles = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    muted: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last-0">
      <div className="flex items-center gap-3">
        
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {badge ? (
        
          {badge}
        </Badge>
      ) : (
        <span className="text-sm font-medium font-mono text-foreground">{value || "—"}</span>
      )}
    </div>
  );
};

const AccountDetails = ({
  businessName,
  wabaId,
  phoneNumberId,
  phoneNumber,
  messagingEnabled,
  templateStatus,
  webhookVerified,
}) => {
  return (
    
      
        WhatsApp Account Details</CardTitle>
      </CardHeader>
      
        
        
        
        
        <DetailRow
          icon={MessageSquare}
          label="Messaging Status"
          badge={messagingEnabled ? "Enabled" : "Disabled"}
          badgeVariant={messagingEnabled ? "success" : "warning"}
        />
        <DetailRow
          icon={FileText}
          label="Template Status"
          badge={templateStatus || "Pending"}
          badgeVariant={templateStatus === "Approved" ? "success" : "warning"}
        />
      </CardContent>
    </Card>
  );
};

export default AccountDetails;


