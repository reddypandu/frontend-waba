import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";



const QRScanWidget = ({ phoneNumber }: QRScanWidgetProps) => {
  if (!phoneNumber) return null;

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${cleanPhone}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waLink)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(waLink);
    toast({ title: "Link copied!", description: waLink });
  };

  return (
    
      
        
           Scan to Chat
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share this QR code so customers can start a conversation with your business on WhatsApp.
        </p>
      </CardHeader>
      
        <div className="bg-white p-3 rounded-xl border border-border shrink-0">
          <img
            src={qrUrl}
            alt="WhatsApp QR Code"
            className="w-[160px] h-[160px]"
            loading="lazy"
          />
        </div>
        <div className="space-y-3 text-center sm:text-left">
          <div>
            <p className="text-sm text-muted-foreground">WhatsApp Link</p>
            <p className="text-sm font-mono text-foreground break-all">{waLink}</p>
          </div>
          <div className="flex items-center gap-2">
            
               Copy Link
            </Button>
             window.open(waLink, "_blank")}>
               Open
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanWidget;

