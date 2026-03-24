import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, FileUp, Download, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [newContact, setNewContact] = React.useState({ name: "", phone: "", tags: "" });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiGet("/api/admin/contacts"),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (contact) => apiPost("/api/admin/contacts", {
      name: contact.name,
      phone_number: contact.phone,
      tags: contact.tags.split(",").map(t => t.trim()).filter(Boolean)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setDialogOpen(false);
      setNewContact({ name: "", phone: "", tags: "" });
      toast({ title: "Contact added successfully" });
    },
    onError: (err) => {
      toast({ title: "Failed to add contact", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/admin/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setDeleteId(null);
      toast({ title: "Contact deleted" });
    },
    onError: (err) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    }
  });

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone_number?.includes(search)
  );

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
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-10" />
              <p>{search ? "No matching contacts found." : "No contacts found. Add your first contact or import a CSV!"}</p>
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
                  {filteredContacts.map((c) => (
                    <tr key={c._id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="py-3 px-4 font-medium text-foreground">{c.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{c.phone_number}</td>
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
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate(`/dashboard/inbox?phone=${c.phone_number}`)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(c._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
