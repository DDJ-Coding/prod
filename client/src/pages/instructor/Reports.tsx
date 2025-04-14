import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const { user } = useAuth();
  const [reportPeriod, setReportPeriod] = useState("month");
  const [studentFilter, setStudentFilter] = useState("all");

  // Mock data for demonstration - In a real app, this would come from API calls
  // Student flight hours data
  const studentHoursData = [
    { name: "Alex Johnson", total: 42.5, solo: 8.2, crossCountry: 12.3, dual: 22.0 },
    { name: "Emma Smith", total: 35.2, solo: 6.5, crossCountry: 8.7, dual: 20.0 },
    { name: "Michael Brown", total: 28.7, solo: 4.0, crossCountry: 10.2, dual: 14.5 },
    { name: "Sophia Davis", total: 48.3, solo: 10.5, crossCountry: 15.8, dual: 22.0 },
    { name: "William Wilson", total: 22.6, solo: 3.2, crossCountry: 5.4, dual: 14.0 },
  ];

  // Monthly training activity
  const monthlyActivityData = [
    { month: "Jan", trainingHours: 45, totalFlights: 18 },
    { month: "Feb", trainingHours: 52, totalFlights: 22 },
    { month: "Mar", trainingHours: 48, totalFlights: 20 },
    { month: "Apr", trainingHours: 70, totalFlights: 28 },
    { month: "May", trainingHours: 90, totalFlights: 35 },
    { month: "Jun", trainingHours: 120, totalFlights: 45 },
  ];

  // Training type distribution
  const trainingTypeData = [
    { name: "Pattern Work", value: 35 },
    { name: "Cross-Country", value: 25 },
    { name: "Instrument", value: 20 },
    { name: "Night Flying", value: 10 },
    { name: "Basic Maneuvers", value: 10 },
  ];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Recent completions
  const recentCompletions = [
    { 
      student: "Alex Johnson", 
      milestone: "First Solo Flight", 
      date: "2023-03-15", 
      instructor: "Sarah Miller" 
    },
    { 
      student: "Emma Smith", 
      milestone: "Night Flying Proficiency", 
      date: "2023-04-05", 
      instructor: "Michael Chen" 
    },
    { 
      student: "Alex Johnson", 
      milestone: "Night Flying Proficiency", 
      date: "2023-04-02", 
      instructor: "Michael Chen" 
    },
    { 
      student: "Sophia Davis", 
      milestone: "First Solo Flight", 
      date: "2023-05-12", 
      instructor: "Sarah Miller" 
    },
    { 
      student: "William Wilson", 
      milestone: "Basic Maneuvers", 
      date: "2023-05-18", 
      instructor: "Sarah Miller" 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Training Reports</h1>
        <p className="text-gray-600">Analytics and insights on student progress</p>
      </header>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Progress</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="training">Training Types</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Monthly Training Activity</CardTitle>
                    <CardDescription>Training hours and total flights</CardDescription>
                  </div>
                  <Select
                    value={reportPeriod}
                    onValueChange={setReportPeriod}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="trainingHours" name="Training Hours" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="totalFlights" name="Total Flights" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Training Type Distribution</CardTitle>
                <CardDescription>Breakdown of flight training by type</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trainingTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {trainingTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Milestone Completions</CardTitle>
                <CardDescription>Latest student achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Instructor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentCompletions.map((completion, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{completion.student}</TableCell>
                          <TableCell>{completion.milestone}</TableCell>
                          <TableCell>{new Date(completion.date).toLocaleDateString()}</TableCell>
                          <TableCell>{completion.instructor}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Student Progress Tab */}
        <TabsContent value="students">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Flight Hours</CardTitle>
                    <CardDescription>Comparative analysis of student progress</CardDescription>
                  </div>
                  <Select
                    value={studentFilter}
                    onValueChange={setStudentFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {studentHoursData.map((student, index) => (
                        <SelectItem key={index} value={student.name}>{student.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={studentFilter === "all" 
                      ? studentHoursData 
                      : studentHoursData.filter(s => s.name === studentFilter)
                    }
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="dual" name="Dual Hours" fill="#8884d8" />
                    <Bar dataKey="solo" name="Solo Hours" fill="#82ca9d" />
                    <Bar dataKey="crossCountry" name="Cross-Country Hours" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Student Progress Over Time</CardTitle>
                <CardDescription>Cumulative flight hours by student</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={[
                      { month: 'Jan', 'Alex Johnson': 10, 'Emma Smith': 8, 'Michael Brown': 6, 'Sophia Davis': 12, 'William Wilson': 5 },
                      { month: 'Feb', 'Alex Johnson': 17, 'Emma Smith': 15, 'Michael Brown': 12, 'Sophia Davis': 20, 'William Wilson': 10 },
                      { month: 'Mar', 'Alex Johnson': 26, 'Emma Smith': 22, 'Michael Brown': 18, 'Sophia Davis': 28, 'William Wilson': 14 },
                      { month: 'Apr', 'Alex Johnson': 34, 'Emma Smith': 28, 'Michael Brown': 22, 'Sophia Davis': 36, 'William Wilson': 18 },
                      { month: 'May', 'Alex Johnson': 42.5, 'Emma Smith': 35.2, 'Michael Brown': 28.7, 'Sophia Davis': 48.3, 'William Wilson': 22.6 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Alex Johnson" stroke="#8884d8" />
                    <Line type="monotone" dataKey="Emma Smith" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="Michael Brown" stroke="#ffc658" />
                    <Line type="monotone" dataKey="Sophia Davis" stroke="#ff8042" />
                    <Line type="monotone" dataKey="William Wilson" stroke="#0088fe" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Milestone Completion Rates</CardTitle>
                <CardDescription>Student progress on key training milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Students Completed</TableHead>
                        <TableHead>Students In Progress</TableHead>
                        <TableHead>Not Started</TableHead>
                        <TableHead>Completion Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">First Solo Flight</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>60%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Night Flying Proficiency</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>40%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cross-Country Solo</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>20%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Instrument Rating</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>0%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Basic Maneuvers</TableCell>
                        <TableCell>4</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>80%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Milestone Completion Time</CardTitle>
                <CardDescription>Average time to complete each milestone</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    layout="vertical"
                    data={[
                      { name: 'First Solo Flight', weeks: 12 },
                      { name: 'Night Flying Proficiency', weeks: 16 },
                      { name: 'Cross-Country Solo', weeks: 20 },
                      { name: 'Instrument Rating', weeks: 35 },
                      { name: 'Basic Maneuvers', weeks: 8 },
                    ]}
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" label={{ value: 'Weeks', position: 'insideBottom', offset: -5 }} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${value} weeks`, 'Average Time']} />
                    <Bar dataKey="weeks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Milestone Success Factors</CardTitle>
                <CardDescription>Correlation between practice hours and success rate</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { hours: 5, successRate: 20 },
                      { hours: 10, successRate: 35 },
                      { hours: 15, successRate: 55 },
                      { hours: 20, successRate: 70 },
                      { hours: 25, successRate: 85 },
                      { hours: 30, successRate: 92 },
                      { hours: 35, successRate: 96 },
                      { hours: 40, successRate: 98 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hours" label={{ value: 'Practice Hours', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                    <Line type="monotone" dataKey="successRate" stroke="#8884d8" animationDuration={2000} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Training Types Tab */}
        <TabsContent value="training">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Training Type Distribution by Month</CardTitle>
                <CardDescription>Breakdown of training hours by category</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { month: 'Jan', pattern: 18, crossCountry: 12, instrument: 8, night: 4, basic: 3 },
                      { month: 'Feb', pattern: 20, crossCountry: 15, instrument: 10, night: 5, basic: 2 },
                      { month: 'Mar', pattern: 16, crossCountry: 16, instrument: 9, night: 4, basic: 3 },
                      { month: 'Apr', pattern: 25, crossCountry: 22, instrument: 15, night: 6, basic: 2 },
                      { month: 'May', pattern: 30, crossCountry: 28, instrument: 20, night: 8, basic: 4 },
                      { month: 'Jun', pattern: 35, crossCountry: 45, instrument: 25, night: 10, basic: 5 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pattern" name="Pattern Work" stackId="a" fill="#8884d8" />
                    <Bar dataKey="crossCountry" name="Cross-Country" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="instrument" name="Instrument" stackId="a" fill="#ffc658" />
                    <Bar dataKey="night" name="Night Flying" stackId="a" fill="#ff8042" />
                    <Bar dataKey="basic" name="Basic Maneuvers" stackId="a" fill="#0088fe" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Training Effectiveness</CardTitle>
                <CardDescription>Student rating by training type (1-10 scale)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { type: 'Pattern Work', rating: 8.5 },
                      { type: 'Cross-Country', rating: 9.2 },
                      { type: 'Instrument', rating: 7.8 },
                      { type: 'Night Flying', rating: 8.7 },
                      { type: 'Basic Maneuvers', rating: 7.5 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis domain={[0, 10]} label={{ value: 'Rating', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="rating" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Aircraft Usage by Training Type</CardTitle>
                <CardDescription>Hours by aircraft type and training category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { aircraft: 'Cessna 172', pattern: 45, crossCountry: 65, instrument: 25, night: 15, basic: 10 },
                      { aircraft: 'Cessna 152', pattern: 35, crossCountry: 15, instrument: 5, night: 5, basic: 8 },
                      { aircraft: 'Piper PA-28', pattern: 20, crossCountry: 45, instrument: 30, night: 12, basic: 5 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="aircraft" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pattern" name="Pattern Work" fill="#8884d8" />
                    <Bar dataKey="crossCountry" name="Cross-Country" fill="#82ca9d" />
                    <Bar dataKey="instrument" name="Instrument" fill="#ffc658" />
                    <Bar dataKey="night" name="Night Flying" fill="#ff8042" />
                    <Bar dataKey="basic" name="Basic Maneuvers" fill="#0088fe" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Button variant="outline">Export Reports</Button>
      </div>
    </div>
  );
};

export default Reports;
