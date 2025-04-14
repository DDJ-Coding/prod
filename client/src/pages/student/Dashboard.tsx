import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

// Components
import ProgressCard from "@/components/dashboard/ProgressCard";
import UpcomingFlights from "@/components/dashboard/UpcomingFlights";
import Milestones from "@/components/dashboard/Milestones";
import FlightLogsTable from "@/components/dashboard/FlightLogsTable";
import NewFlightLogModal from "@/components/modals/NewFlightLogModal";
import ScheduleFlightModal from "@/components/modals/ScheduleFlightModal";

// Types
import { FlightLog } from "@shared/schema";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FlightLog | null>(null);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/student"],
    enabled: !!user,
  });

  const handleViewLog = (log: FlightLog) => {
    setSelectedLog(log);
    // In a complete implementation, this would open a modal to view log details
    console.log("View log:", log);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-600">Track your progress and upcoming flights</p>
      </header>
      
      {/* Training Progress Overview */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ProgressCard
            title="Total Flight Hours"
            value={dashboardData?.totalHours || 0}
            maxValue={100}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 22h14a2 2 0 002-2V9a1 1 0 00-1-1h-3v-.777c0-2.896-1.2-5.545-3.134-7.447a1 1 0 00-1.732 0C10.2 2.678 9 5.327 9 8.223V8H6a1 1 0 00-1 1v11a2 2 0 002 2z" />
              </svg>
            }
            color="primary"
          />
          
          <ProgressCard
            title="Solo Flight Hours"
            value={dashboardData?.soloHours || 0}
            maxValue={10}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            color="secondary"
          />
          
          <ProgressCard
            title="Cross-Country Hours"
            value={dashboardData?.crossCountryHours || 0}
            maxValue={20}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="accent"
          />
        </div>
      )}
      
      {/* Two Column Section: Upcoming Flights & Training Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Flights Card */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
            <div className="p-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="border-b border-gray-100 py-3 px-2 animate-pulse last:border-0">
                  <div className="flex items-center">
                    <div className="rounded-full bg-gray-200 h-10 w-10 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <UpcomingFlights 
            flights={dashboardData?.upcomingBookings || []}
            onSchedule={() => setShowScheduleModal(true)}
          />
        )}
        
        {/* Training Milestones Card */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
            <div className="p-4">
              <div className="relative pl-8">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="mb-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Milestones milestones={dashboardData?.milestones || []} />
        )}
      </div>
      
      {/* Recent Flight Logs Section */}
      <FlightLogsTable 
        logs={dashboardData?.recentLogs || []}
        onAddNew={() => setShowNewLogModal(true)}
        onView={handleViewLog}
        isLoading={isLoading}
      />
      
      {/* Modals */}
      <NewFlightLogModal 
        open={showNewLogModal} 
        onClose={() => setShowNewLogModal(false)} 
      />
      
      <ScheduleFlightModal 
        open={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
      />
    </div>
  );
};

export default StudentDashboard;
