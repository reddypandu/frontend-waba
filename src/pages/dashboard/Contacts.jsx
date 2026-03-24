import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, FileUp, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Contacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [newContact, setNewContact] = React.useState({ name: "", phone: "", tags: "" });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);

  // Mock data
  const contacts = [];
  const isLoading = false;

  const addMutation = useMutation({
    mutationFn: async (contact) => {
      console.log("Add contact", contact);
    },
    onSuccess: () => {
      setDialogOpen(false);
      setNewContact({ name: "", phone: "", tags: "" });
      toast({ title: "Contact added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      console.log("Delete contact", id);
    },
    onSuccess: () => {
      setDeleteId(null);
      toast({ title: "Contact deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">{contacts.length} contacts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline">
            <FileUp className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addMutation.mutate(newContact);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newContact.tags}
                    onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                    placeholder="VIP, Active"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          className="pl-9 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-10" />
              <p>No contacts found. Add your first contact or import a CSV!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tags</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="py-3 px-4 font-medium text-foreground">{c.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{c.phone}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {(c.tags || []).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contacts;
