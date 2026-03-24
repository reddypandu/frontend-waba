import { useAuth } from "@/contexts/AuthContext";

export const useIsAdmin = () => {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  return { isAdmin, isLoading: loading };
};
