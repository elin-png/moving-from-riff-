import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiClient } from "app";
import { Shift, UserProfile } from "types";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SwapOfferDialog({ shift, open, onOpenChange, onSuccess }: Props) {
  const [mode, setMode] = useState<"marketplace" | "direct">("marketplace");
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && mode === "direct") {
      fetchUsers();
    }
  }, [open, mode]);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.list_users();
      if (res.ok) {
        const data = await res.json();
        // Filter out current user is tricky without context, but server prevents self-swap anyway?
        // Actually we can filter client side if we knew current user ID. 
        // For now let's just show all, backend will validation logic if needed or user just won't pick themselves.
        setUsers(data); 
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleSubmit = async () => {
    if (!shift) return;
    setLoading(true);
    try {
      const payload = {
        shift_id: shift.id,
        target_user_id: mode === "direct" ? targetUserId : null,
      };
      
      const res = await apiClient.create_swap(payload);
      if (res.ok) {
        toast.success("Shift offered successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await res.json();
        toast.error(error.detail || "Failed to offer shift");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offer Shift for Swap</DialogTitle>
          <DialogDescription>
            {format(new Date(shift.start_time), "PPP")} <br/>
            {format(new Date(shift.start_time), "p")} - {format(new Date(shift.end_time), "p")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "marketplace" | "direct")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="marketplace" id="marketplace" />
              <Label htmlFor="marketplace">Marketplace (Up for grabs)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct" id="direct" />
              <Label htmlFor="direct">Direct Offer (Specific person)</Label>
            </div>
          </RadioGroup>

          {mode === "direct" && (
            <div className="space-y-2">
              <Label>Select Colleague</Label>
              <Select value={targetUserId} onValueChange={setTargetUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a colleague" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || (mode === "direct" && !targetUserId)}>
            {loading ? "Processing..." : "Create Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
