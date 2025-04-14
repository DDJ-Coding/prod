import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";

const InstructorDashboard = () => {
  const { user } = useAuth();
  
  // Fetch instructor dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/instructor"],
    enabled: !!user,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Instructor Dashboard</h1>
        <p className="text-gray-600">Manage your students and bookings</p>
      </header>

      {isLoading ? (
        <div className="py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="mt-4 text-gray-600">Loading your dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.totalStudents || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Active students under your instruction</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Today's Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.todayBookings?.length || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Scheduled flights for today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.pendingLogs?.length || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Flight logs awaiting your review</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Booking Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.pendingBookings?.length || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Pending flight booking requests</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your flight training sessions for today</CardDescription>
              </CardHeader>
              <CardContent>
                {!dashboardData?.todayBookings?.length ? (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-600">No sessions scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.todayBookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center p-4 border border-gray-100 rounded-lg">
                        <div className="bg-primary/10 rounded-full p-3 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-800">
                              {booking.studentName || "Student"} - {booking.trainingType}
                            </h4>
                            <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className="text-sm text-gray-600">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {booking.aircraftType} ({booking.tailNumber})
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/instructor/bookings">View All Bookings</a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Flight Logs</CardTitle>
                <CardDescription>Logs awaiting your approval</CardDescription>
              </CardHeader>
              <CardContent>
                {!dashboardData?.pendingLogs?.length ? (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-gray-600">No pending logs to review</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.pendingLogs.map((log: any) => (
                      <div key={log.id} className="p-3 border border-gray-100 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">{log.studentName || "Student"}</div>
                          <Badge variant="outline" className="text-yellow-600 bg-yellow-50">Pending</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatDate(log.date)} • {log.duration} hrs
                        </div>
                        <div className="text-sm text-gray-600">
                          {log.departureAirport} → {log.destinationAirport}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/instructor/students">View All Students</a>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Booking Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
              <CardDescription>Flight bookings that need your confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              {!dashboardData?.pendingBookings?.length ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-600">No pending booking requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Aircraft</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.pendingBookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.studentName || "Student"}</TableCell>
                        <TableCell>{formatDate(booking.startTime)}</TableCell>
                        <TableCell>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </TableCell>
                        <TableCell className="capitalize">{booking.trainingType}</TableCell>
                        <TableCell>{booking.aircraftType || "Not specified"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-yellow-600 bg-yellow-50">Pending</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="sr-only">Reject</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="/instructor/bookings">Manage All Bookings</a>
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;
