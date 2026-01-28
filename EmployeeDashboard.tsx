import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { apiClient } from "app";
import { Shift } from "types";
import { useUser } from "@stackframe/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { SwapOfferDialog } from "@/components/SwapOfferDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketplaceView } from "@/components/MarketplaceView";

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

export default function EmployeeDashboard() {
  const user = useUser();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);

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
      
      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const res = await apiClient.list_my_shifts({ start: startIso, end: endIso });
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      } else {
        toast.error("Error fetching shifts");
      }
    } catch (error) {
      console.error("Failed to fetch shifts", error);
      toast.error("Failed to load schedule");
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [date, view]);

  if (!user) {
    return <div className="flex justify-center p-8">Please log in to view the dashboard.</div>;
  }

  const handleSelectEvent = (event: any) => {
      // Only allow offering if not already pending/swapping?
      // For now, just open dialog, backend checks logic.
      setSelectedShift(event.resource);
      setIsSwapDialogOpen(true);
  };

  const events = shifts.map((shift) => ({
    id: shift.id,
    title: shift.role ? `${shift.role} Shift` : "Shift",
    start: parseISO(shift.start_time), // Use parseISO to ensure correct parsing
    end: parseISO(shift.end_time),
    resource: shift,
  }));

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Portal</h1>
          <p className="text-muted-foreground">Welcome back, {user.full_name || user.primaryEmail}</p>
        </div>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
            <TabsTrigger value="schedule">My Schedule</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>My Shift Calendar</CardTitle>
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
                        return {
                        style: {
                            backgroundColor: "#3b82f6",
                            color: "white",
                            borderRadius: "4px",
                            border: "none",
                        },
                        };
                    }}
                    onSelectEvent={handleSelectEvent}
                    />
                </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
            <MarketplaceView />
        </TabsContent>
      </Tabs>
      
      <SwapOfferDialog 
        shift={selectedShift}
        open={isSwapDialogOpen}
        onOpenChange={setIsSwapDialogOpen}
        onSuccess={fetchShifts}
      />
    </div>
  );
}
