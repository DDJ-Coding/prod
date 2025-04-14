import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import NotFound from "@/pages/not-found";

// Main layouts
import MainLayout from "@/components/layouts/MainLayout";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Student pages
import StudentDashboard from "@/pages/student/Dashboard";
import FlightLogs from "@/pages/student/FlightLogs";
import Schedule from "@/pages/student/Schedule";
import Progress from "@/pages/student/Progress";
import Certifications from "@/pages/student/Certifications";
import StudentMessages from "@/pages/student/Messages";

// Instructor pages
import InstructorDashboard from "@/pages/instructor/Dashboard";
import Students from "@/pages/instructor/Students";
import Bookings from "@/pages/instructor/Bookings";
import Reports from "@/pages/instructor/Reports";
import InstructorMessages from "@/pages/instructor/Messages";

function Router() {
  const [location] = useLocation();
  
  // Skip layout for authentication pages
  const isAuthPage = location === "/login" || location === "/register";
  
  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  return (
    <MainLayout>
      <Switch>
        {/* Public Home redirects to login */}
        <Route path="/">
          {() => {
            window.location.href = "/login";
            return null;
          }}
        </Route>
        
        {/* Student routes */}
        <Route path="/student/dashboard" component={StudentDashboard} />
        <Route path="/student/flight-logs" component={FlightLogs} />
        <Route path="/student/schedule" component={Schedule} />
        <Route path="/student/progress" component={Progress} />
        <Route path="/student/certifications" component={Certifications} />
        
        {/* Instructor routes */}
        <Route path="/instructor/dashboard" component={InstructorDashboard} />
        <Route path="/instructor/students" component={Students} />
        <Route path="/instructor/bookings" component={Bookings} />
        <Route path="/instructor/reports" component={Reports} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
