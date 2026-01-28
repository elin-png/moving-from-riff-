import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile, Shift } from "types";

const formSchema = z.object({
  user_id: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift | null;
  selectedSlot?: { start: Date; end: Date } | null;
  users: UserProfile[];
  onSave: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ShiftDialog({
  open,
  onOpenChange,
  shift,
  selectedSlot,
  users,
  onSave,
  onDelete,
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "unassigned",
      start_time: "",
      end_time: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (shift) {
        form.reset({
          user_id: shift.user_id || "unassigned",
          start_time: format(new Date(shift.start_time), "yyyy-MM-dd'T'HH:mm"),
          end_time: format(new Date(shift.end_time), "yyyy-MM-dd'T'HH:mm"),
          notes: shift.notes || "",
        });
      } else if (selectedSlot) {
        form.reset({
          user_id: "unassigned",
          start_time: format(selectedSlot.start, "yyyy-MM-dd'T'HH:mm"),
          end_time: format(selectedSlot.end, "yyyy-MM-dd'T'HH:mm"),
          notes: "",
        });
      } else {
        form.reset({
            user_id: "unassigned",
            start_time: "",
            end_time: "",
            notes: "",
        });
      }
    }
  }, [open, shift, selectedSlot, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      user_id: values.user_id === "unassigned" ? null : values.user_id,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
    };
    await onSave(data);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (shift && shift.id) {
      await onDelete(shift.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shift ? "Edit Shift" : "Add Shift"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              {shift && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
