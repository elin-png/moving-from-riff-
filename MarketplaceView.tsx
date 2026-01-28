import { useState, useEffect } from "react";
import { apiClient } from "app";
import { ShiftSwapDetail } from "types";
import { useUser } from "@stackframe/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, ArrowRightLeft, User, Clock, Calendar as CalendarIcon } from "lucide-react";

export function MarketplaceView() {
  const user = useUser();
  const [swaps, setSwaps] = useState<ShiftSwapDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSwaps();
  }, []);

  if (!user) return null;

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const res = await apiClient.list_swaps();
      if (res.ok) {
        setSwaps(await res.json());
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (swapId: string) => {
    try {
      setClaimingId(swapId);
      const res = await apiClient.claim_swap(swapId);
      if (res.ok) {
        toast.success("Request sent for approval!");
        fetchSwaps();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to claim shift");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setClaimingId(null);
    }
  };

  const marketplaceItems = swaps.filter(
    (s) => s.status === "open" && s.requesting_user_id !== user.id
  );
  
  const directOffers = swaps.filter(
    (s) => s.status === "pending_acceptance" && s.target_user_id === user.id
  );

  const myOffers = swaps.filter(
    (s) => s.requesting_user_id === user.id
  );

  const SwapCard = ({ swap, type }: { swap: ShiftSwapDetail; type: "market" | "direct" | "mine" }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              {format(new Date(swap.shift.start_time), "EEE, MMM d")}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              {format(new Date(swap.shift.start_time), "p")} - {format(new Date(swap.shift.end_time), "p")}
            </CardDescription>
          </div>
          <Badge variant={
             swap.status === 'approved' ? 'default' : 
             swap.status === 'rejected' ? 'destructive' : 'secondary'
          }>{swap.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Offered by {swap.initiator.full_name}</span>
        </div>
        {swap.shift.notes && (
           <p className="mt-2 text-sm italic">"{swap.shift.notes}"</p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {type !== "mine" && (
           <Button 
             className="w-full" 
             onClick={() => handleClaim(swap.id)}
             disabled={!!claimingId}
           >
             {claimingId === swap.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {type === "direct" ? "Accept Offer" : "Request Pickup"}
           </Button>
        )}
        {type === "mine" && (
            <div className="text-sm text-muted-foreground w-full text-center">
                {swap.status === 'open' ? 'Waiting for someone to claim...' : 
                 swap.status === 'pending_admin' ? 'Waiting for admin approval...' :
                 swap.status === 'pending_acceptance' ? 'Waiting for colleague to accept...' : ''}
            </div>
        )}
      </CardFooter>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shift Marketplace</h2>
          <p className="text-muted-foreground">Pick up extra shifts or manage your offers.</p>
        </div>
      </div>

      <Tabs defaultValue="market">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">
            Up for Grabs ({marketplaceItems.length})
          </TabsTrigger>
          <TabsTrigger value="direct">
            Offers to Me ({directOffers.length})
          </TabsTrigger>
          <TabsTrigger value="mine">
            My Offers ({myOffers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="mt-6 space-y-4">
          {marketplaceItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No shifts currently available.</div>
          ) : (
            marketplaceItems.map(s => <SwapCard key={s.id} swap={s} type="market" />)
          )}
        </TabsContent>

        <TabsContent value="direct" className="mt-6 space-y-4">
          {directOffers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No direct offers pending.</div>
          ) : (
            directOffers.map(s => <SwapCard key={s.id} swap={s} type="direct" />)
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-6 space-y-4">
           {myOffers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">You haven't offered any shifts.</div>
          ) : (
            myOffers.map(s => <SwapCard key={s.id} swap={s} type="mine" />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
