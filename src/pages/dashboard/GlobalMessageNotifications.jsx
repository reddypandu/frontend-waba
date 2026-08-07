import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";

const GlobalMessageNotifications = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const previousMessagesRef = React.useRef({});

    const { data } = useQuery({
        queryKey: ["global-conversations", user?.id],
        queryFn: () => apiGet("/api/whatsapp/conversations"),
        enabled: !!user,
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
        staleTime: 5000,
    });

    const conversations = data?.conversations || [];

    React.useEffect(() => {
        conversations.forEach((conv) => {
            const lastId = conv.last_message_id || conv.updatedAt;

            if (!previousMessagesRef.current[conv._id]) {
                previousMessagesRef.current[conv._id] = lastId;
                return;
            }

            if (previousMessagesRef.current[conv._id] !== lastId) {
                previousMessagesRef.current[conv._id] = lastId;

                if (conv.unread_count > 0) {
                    toast({
                        title: conv.contact_id?.name || conv.phone_number,
                        description: conv.last_message || "New message",
                    });
                }
            }
        });
    }, [conversations]);

    return null;
};

export default GlobalMessageNotifications;