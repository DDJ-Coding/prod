import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Import chart components
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProgressPage = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/student"],
    enabled: !!user,
  });

  // Mock chart data - In a real implementation, this would come from the API
  const flightHoursData = [
    { month: "Jan", solo: 1.0, dual: 2.5, crossCountry: 0 },
    { month: "Feb", solo: 1.5, dual: 3.0, crossCountry: 1.0 },
    { month: "Mar", solo: 2.0, dual: 4.5, crossCountry: 2.0 },
    { month: "Apr", solo: 2.0, dual: 5.0, crossCountry: 3.0 },
    { month: "May", solo: 1.5, dual: 6.0, crossCountry: 6.3 },
  ];

  const skillProgressData = [
    { name: "Takeoffs", score: 85 },
    { name: "Landings", score: 75 },
    { name: "Navigation", score: 70 },
    { name: "Radio Comms", score: 80 },
    { name: "Emergency Proc", score: 65 },
    { name: "Instrument Flying", score: 50 },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Training Progress</h1>
        <p className="text-gray-600">Track your learning journey and skill development</p>
      </header>

      {isLoading ? (
        <div className="py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="mt-4 text-gray-600">Loading your progress data...</p>
        </div>
      ) : (
        <>
          {/* Flight Hours Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="col-span-3 lg:col-span-1">
              <CardHeader>
                <CardTitle>Flight Hours Summary</CardTitle>
                <CardDescription>Your accumulated flight hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Total Flight Hours</span>
                    <span className="text-sm font-medium">{dashboardData?.totalHours.toFixed(1)} / 100 hrs</span>
                  </div>
                  <Progress value={dashboardData?.totalHours} max={100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Solo Hours</span>
                    <span className="text-sm font-medium">{dashboardData?.soloHours.toFixed(1)} / 10 hrs</span>
                  </div>
                  <Progress value={dashboardData?.soloHours * 10} className="h-2 bg-secondary/20" indicatorClassName="bg-secondary" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Cross-Country Hours</span>
                    <span className="text-sm font-medium">{dashboardData?.crossCountryHours.toFixed(1)} / 20 hrs</span>
                  </div>
                  <Progress value={dashboardData?.crossCountryHours * 5} className="h-2 bg-accent/20" indicatorClassName="bg-accent" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Night Hours</span>
                    <span className="text-sm font-medium">3.0 / 5 hrs</span>
                  </div>
                  <Progress value={60} className="h-2 bg-purple-100" indicatorClassName="bg-purple-500" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Instrument Hours</span>
                    <span className="text-sm font-medium">8.5 / 40 hrs</span>
                  </div>
                  <Progress value={21.25} className="h-2 bg-indigo-100" indicatorClassName="bg-indigo-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Flight Hours</CardTitle>
                <CardDescription>Breakdown of your hours by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={flightHoursData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="dual" stackId="a" fill="#2563EB" name="Dual" />
                    <Bar dataKey="solo" stackId="a" fill="#3B82F6" name="Solo" />
                    <Bar dataKey="crossCountry" stackId="a" fill="#F59E0B" name="Cross-Country" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Milestones */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Training Milestones</CardTitle>
                <CardDescription>Track your certification progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dashboardData?.milestones.map((milestone) => (
                    <div key={milestone.id} className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{milestone.title}</h3>
                        <span className={`text-sm font-medium ${
                          milestone.status === 'completed' 
                            ? 'text-green-600' 
                            : milestone.status === 'in_progress' 
                              ? 'text-amber-600' 
                              : 'text-gray-500'
                        }`}>
                          {milestone.status === 'completed' 
                            ? 'Completed' 
                            : milestone.status === 'in_progress' 
                              ? 'In Progress' 
                              : 'Not Started'}
                        </span>
                      </div>
                      
                      <Progress 
                        value={milestone.progress} 
                        className="h-2"
                        indicatorClassName={
                          milestone.status === 'completed' 
                            ? 'bg-green-500' 
                            : milestone.status === 'in_progress' 
                              ? 'bg-amber-500' 
                              : 'bg-gray-200'
                        } 
                      />
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{milestone.description}</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      
                      {milestone.completionDate && (
                        <div className="text-sm text-gray-500">
                          Completed on: {formatDate(milestone.completionDate)}
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Development */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Development</CardTitle>
                <CardDescription>Instructor assessment of your skills</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    layout="vertical" 
                    data={skillProgressData}
                    margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Proficiency']}
                    />
                    <Bar dataKey="score" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flight Hours Progress</CardTitle>
                <CardDescription>Tracking your hours over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={flightHoursData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="dual" stroke="#2563EB" activeDot={{ r: 8 }} name="Dual" />
                    <Line type="monotone" dataKey="solo" stroke="#3B82F6" name="Solo" />
                    <Line type="monotone" dataKey="crossCountry" stroke="#F59E0B" name="Cross-Country" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressPage;
