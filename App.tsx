import { useState, useEffect } from "react";
import { useUser } from "@stackframe/react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "app";
import { UserProfile } from "types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LayoutDashboard, Calendar, LogIn, LogOut, Shield, User } from "lucide-react";

export default function App() {
  const user = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get_my_profile();
      if (res.ok) {
        setProfile(await res.json());
      } else {
        setError("Failed to load profile.");
      }
    } catch (e: any) {
      // Handle 404 Not Found (User profile missing)
      // The apiClient throws the Response object on error (since format is not set).
      console.log("Fetch profile error:", e, "Status:", e?.status);
      if (user && (e.status === 404)) {
        console.log("User profile not found, requesting role selection...");
        setShowRoleSelection(true);
      } else {
        console.error(e);
        setError("An error occurred while loading your profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const createRes = await apiClient.create_user({
        user_id: user.id,
        full_name: user.displayName || user.primaryEmail || "Unknown User",
        email: user.primaryEmail || "",
        role: role
      });

      if (createRes.ok) {
        setProfile(await createRes.json());
        setShowRoleSelection(false);
      } else {
        console.error("Failed to create user", await createRes.text());
        setError("Failed to create profile.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while setting up your profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-primary">ShiftFlow</h1>
            <p className="text-lg text-muted-foreground">
              Manage your shifts, swaps, and schedule efficiently.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Please sign in to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link to="/auth/sign-in">
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showRoleSelection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome to ShiftFlow</h1>
                <p className="text-muted-foreground">To get started, please select your role.</p>
            </div>
             <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Admin Choice */}
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleRoleSelect('admin')}>
                    <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <Shield className="h-12 w-12 text-primary" />
                            Admin
                        </CardTitle>
                        <CardDescription>
                            I manage shifts, approve swaps, and oversee the schedule.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Employee Choice */}
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleRoleSelect('employee')}>
                     <CardHeader>
                        <CardTitle className="flex flex-col items-center gap-4">
                            <User className="h-12 w-12 text-primary" />
                            Employee
                        </CardTitle>
                        <CardDescription>
                            I want to view my shifts, request swaps, and manage my schedule.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ShiftFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user.primaryEmail}
            </span>
            <Button variant="outline" size="sm" asChild>
                <Link to="/auth/sign-out">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Portal</h1>
                <p className="text-muted-foreground">Select a dashboard to proceed.</p>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Employee Dashboard - Always visible to everyone or just employees? 
                    Usually admins are also employees or at least can see the view. 
                */}
                <Link to="/employee-dashboard" className="block group">
                    <Card className="h-full transition-colors group-hover:border-primary/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Employee Portal
                            </CardTitle>
                            <CardDescription>
                                View your schedule, offer swaps, and manage your shifts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                Go to Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </Link>

                {/* Admin Dashboard - Only visible to admins */}
                {profile?.role === "admin" && (
                    <Link to="/admin-dashboard" className="block group">
                        <Card className="h-full transition-colors group-hover:border-primary/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Admin Dashboard
                                </CardTitle>
                                <CardDescription>
                                    Manage master schedule, approve swaps, and users.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                    Manage Operations
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>
            
             {/* Fallback for users with no role or non-admin trying to find admin stuff */}
             {profile && profile.role !== "admin" && (
                <div className="text-center text-sm text-muted-foreground pt-8">
                    <p>Logged in as <strong>{profile.full_name}</strong> ({profile.role})</p>
                    <p>Don't see the Admin Dashboard? Contact your manager to request access.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
