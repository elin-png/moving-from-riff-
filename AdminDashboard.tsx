import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { apiClient } from "app";
import { Shift, UserProfile } from "types";
import { useUser } from "@stackframe/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ShiftDialog } from "@/components/ShiftDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShiftSwapDetail } from "types";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, ArrowRight } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AdminDashboard() {
  const user = useUser();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [approvals, setApprovals] = useState<ShiftSwapDetail[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [loadingApprovals, setLoadingApprovals] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.list_users();
      if (res.ok) {
        const userList = await res.json();
        const userMap: Record<string, UserProfile> = {};
        userList.forEach((u: UserProfile) => {
          userMap[u.user_id] = u;
        });
        setUsers(userMap);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchApprovals = async () => {
      setLoadingApprovals(true);
      try {
          const res = await apiClient.list_swaps({ status: "pending_admin" });
          if (res.ok) {
              setApprovals(await res.json());
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingApprovals(false);
      }
  };

  const fetchShifts = async () => {
    try {
      let start = date;
      let end = date;

      if (view === Views.MONTH) {
        start = startOfMonth(date);
        end = endOfMonth(date);
      } else if (view === Views.WEEK) {
        start = startOfWeek(date);
        end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      } else {
         // Day view
         start = new Date(date.setHours(0,0,0,0));
         end = new Date(date.setHours(23,59,59,999));
      }
      
      // Expand range a bit to catch straddling shifts
      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const res = await apiClient.list_shifts({ start: startIso, end: endIso });
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      } else {
        toast.error("Error fetching shifts", {
          description: "Could not load the schedule.",
        });
      }
    } catch (error) {
      console.error("Failed to fetch shifts", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchApprovals();
  }, []);

  if (!user) {
    return <div className="flex justify-center p-8">Please log in to view the dashboard.</div>;
  }

  useEffect(() => {
    fetchShifts();
  }, [date, view]);

  const handleApproval = async (swapId: string, action: "approve" | "reject") => {
      try {
          const res = action === "approve" 
            ? await apiClient.approve_swap(swapId) 
            : await apiClient.reject_swap(swapId);
            
          if (res.ok) {
              toast.success(`Swap ${action}d successfully`);
              fetchApprovals();
              fetchShifts(); // Refresh calendar as assignments might change
          } else {
              toast.error(`Failed to ${action} swap`);
          }
      } catch (e) {
          toast.error("An error occurred");
      }
  };

  const events = shifts.map((shift) => ({
    id: shift.id,
    title: users[shift.user_id || ""]?.full_name || "Unassigned",
    start: parseISO(shift.start_time as unknown as string),
    end: parseISO(shift.end_time as unknown as string),
    resource: shift,
  }));

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedShift(null);
    setSelectedSlot({ start, end });
    setIsDialogOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedShift(event.resource);
    setSelectedSlot(null);
    setIsDialogOpen(true);
  };

  const handleAddShift = () => {
    setSelectedShift(null);
    setSelectedSlot(null);
    setIsDialogOpen(true);
  };

  const handleSaveShift = async (data: any) => {
    try {
      if (selectedShift) {
        // Update
        const res = await apiClient.update_shift(selectedShift.id, data);
        if (res.ok) {
          toast.success("Shift updated");
          fetchShifts();
        } else {
            toast.error("Failed to update shift");
        }
      } else {
        // Create
        const res = await apiClient.create_shift({
            ...data,
            status: "assigned"
        });
        if (res.ok) {
          toast.success("Shift created");
          fetchShifts();
        } else {
            toast.error("Failed to create shift");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleDeleteShift = async (id: string) => {
      try {
          const res = await apiClient.delete_shift(id);
          if (res.ok) {
              toast.success("Shift deleted");
              fetchShifts();
          } else {
              toast.error("Failed to delete shift");
          }
      } catch (error) {
          console.error(error);
          toast.error("An error occurred");
      }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage schedules, employees, and approvals.</p>
        </div>
        <Button onClick={handleAddShift}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Shift
        </Button>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
            <TabsTrigger value="calendar">Schedule</TabsTrigger>
            <TabsTrigger value="approvals">
                Approvals 
                {approvals.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 rounded-full px-1.5 text-xs">
                        {approvals.length}
                    </Badge>
                )}
            </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>Master Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="h-[600px]">
                    <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    eventPropGetter={(event) => {
                        const isUnassigned = !event.resource.user_id;
                        return {
                        className: isUnassigned ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-primary text-primary-foreground",
                        style: {
                            borderRadius: "4px",
                        }
                        };
                    }}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    />
                </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6 space-y-4">
            {loadingApprovals ? (
                <div className="text-center py-8">Loading...</div>
            ) : approvals.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No pending approvals.
                    </CardContent>
                </Card>
            ) : (
                approvals.map(swap => (
                    <Card key={swap.id}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between">
                                <CardTitle className="text-base font-medium">
                                    Swap Request
                                </CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(swap.created_at), "MMM d, HH:mm")}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{swap.initiator.full_name}</span>
                                    <span className="text-muted-foreground">offers</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{swap.target_user?.full_name || "Unknown"}</span>
                                    <span className="text-muted-foreground">receives</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">
                                        {format(new Date(swap.shift.start_time), "EEEE, MMMM d")}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {format(new Date(swap.shift.start_time), "HH:mm")} - {format(new Date(swap.shift.end_time), "HH:mm")}
                                        {swap.shift.role && ` • ${swap.shift.role}`}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end gap-2 pt-0">
                            <Button variant="outline" size="sm" onClick={() => handleApproval(swap.id, "reject")}>
                                <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApproval(swap.id, "approve")}>
                                <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            )}
        </TabsContent>
      </Tabs>
      
      <ShiftDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        shift={selectedShift}
        selectedSlot={selectedSlot}
        users={Object.values(users)}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
      />
    </div>
  );
}
