import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Milestone } from "@shared/schema";

const Students = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [milestoneProgress, setMilestoneProgress] = useState<number>(0);

  // Fetch students
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/instructor/students"],
    enabled: !!user,
  });

  // Fetch selected student's flight logs
  const { data: studentLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["/api/flightlogs", selectedStudent?.id],
    enabled: !!selectedStudent?.id,
  });

  // Fetch selected student's milestones
  const { data: milestones = [], isLoading: isLoadingMilestones } = useQuery({
    queryKey: ["/api/milestones", selectedStudent?.id],
    enabled: !!selectedStudent?.id,
  });

  // Mutation to update flight log status
  const updateLogStatusMutation = useMutation({
    mutationFn: async ({ logId, status }: { logId: number; status: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/flightlogs/${logId}/status`,
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Flight log updated",
        description: "The flight log status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/flightlogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/instructor"] });
      setSelectedLog(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating flight log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update milestone progress
  const updateMilestoneProgressMutation = useMutation({
    mutationFn: async ({ milestoneId, progress }: { milestoneId: number; progress: number }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/milestones/${milestoneId}/progress`,
        { progress }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone updated",
        description: "The milestone progress has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setSelectedMilestone(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating milestone",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to complete milestone
  const completeMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/milestones/${milestoneId}/complete`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone completed",
        description: "The milestone has been marked as completed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setSelectedMilestone(null);
    },
    onError: (error) => {
      toast({
        title: "Error completing milestone",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproveLog = (logId: number) => {
    updateLogStatusMutation.mutate({ logId, status: "approved" });
  };

  const handleRejectLog = (logId: number) => {
    updateLogStatusMutation.mutate({ logId, status: "rejected" });
  };

  const handleUpdateMilestone = () => {
    if (selectedMilestone && milestoneProgress >= 0 && milestoneProgress <= 100) {
      updateMilestoneProgressMutation.mutate({
        milestoneId: selectedMilestone.id,
        progress: milestoneProgress,
      });
    }
  };

  const handleCompleteMilestone = (milestoneId: number) => {
    completeMilestoneMutation.mutate(milestoneId);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getFlightTypeLabel = (type: string) => {
    switch (type) {
      case "solo":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Solo
          </Badge>
        );
      case "cross-country":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Cross-Country
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Dual
          </Badge>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Student Management</h1>
        <p className="text-gray-600">Manage and track your students' progress</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student List */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
            <CardDescription>Select a student to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="flex items-center justify-center h-48">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="mt-2 text-gray-600">No students found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-md flex items-center cursor-pointer ${
                      selectedStudent?.id === student.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-gray-50 border-transparent"
                    } border`}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={student.profileImage} alt={`${student.firstName} ${student.lastName}`} />
                      <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.firstName} {student.lastName}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedStudent ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-600">Select a student to view details</p>
                <p className="text-sm text-gray-500 mt-1">Student information, flight logs, and progress will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="logs">Flight Logs</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>
              
              {/* Flight Logs Tab */}
              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Flight Logs for {selectedStudent.firstName} {selectedStudent.lastName}</CardTitle>
                    <CardDescription>Review and approve student flight records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLogs ? (
                      <div className="flex items-center justify-center h-48">
                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : studentLogs.length === 0 ? (
                      <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-gray-600">No flight logs found for this student</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Aircraft</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentLogs.map((log: any) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">{formatDate(log.date)}</TableCell>
                              <TableCell>{log.aircraftType || "Unknown"} ({log.tailNumber || "N/A"})</TableCell>
                              <TableCell>
                                {log.departureAirport} → {log.destinationAirport}
                                {log.returnAirport && log.returnAirport !== log.destinationAirport ? ` → ${log.returnAirport}` : ""}
                              </TableCell>
                              <TableCell>{log.duration} hrs</TableCell>
                              <TableCell>{getFlightTypeLabel(log.flightType)}</TableCell>
                              <TableCell>{getStatusLabel(log.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  onClick={() => setSelectedLog(log)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Milestones Tab */}
              <TabsContent value="milestones">
                <Card>
                  <CardHeader>
                    <CardTitle>Training Milestones</CardTitle>
                    <CardDescription>Track and update student progress milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMilestones ? (
                      <div className="flex items-center justify-center h-48">
                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : milestones.length === 0 ? (
                      <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="mt-2 text-gray-600">No milestones found for this student</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {milestones.map((milestone: Milestone) => (
                          <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{milestone.description || "No description"}</p>
                              </div>
                              <Badge
                                className={`
                                  ${milestone.status === "completed" 
                                    ? "bg-green-100 text-green-800" 
                                    : milestone.status === "in_progress" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-gray-100 text-gray-800"}
                                `}
                              >
                                {milestone.status === "completed" 
                                  ? "Completed" 
                                  : milestone.status === "in_progress" 
                                    ? "In Progress" 
                                    : "Not Started"}
                              </Badge>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm font-medium text-gray-700">{milestone.progress}%</span>
                              </div>
                              <Progress 
                                value={milestone.progress} 
                                className="h-2"
                                indicatorClassName={
                                  milestone.status === "completed" 
                                    ? "bg-green-500" 
                                    : milestone.status === "in_progress" 
                                      ? "bg-blue-500" 
                                      : "bg-gray-300"
                                }
                              />
                            </div>
                            
                            {milestone.requiredHours && (
                              <p className="text-sm text-gray-500 mt-2">
                                Required hours: {milestone.requiredHours} hrs
                              </p>
                            )}
                            
                            {milestone.completionDate && (
                              <p className="text-sm text-gray-500 mt-1">
                                Completed on: {formatDate(milestone.completionDate)}
                              </p>
                            )}
                            
                            <div className="mt-4 flex justify-end space-x-2">
                              {milestone.status !== "completed" && (
                                <>
                                  <Button
                                    onClick={() => {
                                      setSelectedMilestone(milestone);
                                      setMilestoneProgress(milestone.progress);
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Update Progress
                                  </Button>
                                  
                                  <Button
                                    onClick={() => handleCompleteMilestone(milestone.id)}
                                    variant="default"
                                    size="sm"
                                  >
                                    Mark Completed
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Progress Tab */}
              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle>Flight Progress</CardTitle>
                    <CardDescription>Overall training progress for {selectedStudent.firstName} {selectedStudent.lastName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">Flight Hours</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Total Flight Hours</h4>
                              <span className="text-sm font-medium text-gray-700">
                                {/* This would come from the API in a real implementation */}
                                42.5 / 100 hrs
                              </span>
                            </div>
                            <Progress value={42.5} max={100} className="h-2" />
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Solo Hours</h4>
                              <span className="text-sm font-medium text-gray-700">
                                8.2 / 10 hrs
                              </span>
                            </div>
                            <Progress value={82} className="h-2" />
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Cross-Country Hours</h4>
                              <span className="text-sm font-medium text-gray-700">
                                12.3 / 20 hrs
                              </span>
                            </div>
                            <Progress value={61.5} className="h-2" />
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Night Hours</h4>
                              <span className="text-sm font-medium text-gray-700">
                                3.5 / 5 hrs
                              </span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium">Skill Assessment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Takeoffs & Landings</h4>
                            <Progress value={85} className="h-2" />
                            <p className="text-sm text-gray-500 mt-1">Proficiency: 85%</p>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Navigation</h4>
                            <Progress value={70} className="h-2" />
                            <p className="text-sm text-gray-500 mt-1">Proficiency: 70%</p>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Radio Communications</h4>
                            <Progress value={80} className="h-2" />
                            <p className="text-sm text-gray-500 mt-1">Proficiency: 80%</p>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Procedures</h4>
                            <Progress value={65} className="h-2" />
                            <p className="text-sm text-gray-500 mt-1">Proficiency: 65%</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium">Certification Path</h3>
                        <div className="mt-4 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Private Pilot License (PPL)</h4>
                            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                          </div>
                          <Progress value={75} className="h-2" />
                          <p className="text-sm text-gray-500 mt-2">Estimated completion: August 2023</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Flight Log Review Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Flight Log Review</DialogTitle>
              <DialogDescription>
                {formatDate(selectedLog.date)} - {selectedLog.duration} hrs
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Aircraft</h4>
                  <p>{selectedLog.aircraftType || "Unknown"} ({selectedLog.tailNumber || "N/A"})</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Flight Type</h4>
                  <p>{getFlightTypeLabel(selectedLog.flightType)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Route</h4>
                <p>
                  {selectedLog.departureAirport} {selectedLog.destinationAirport !== selectedLog.departureAirport ? `→ ${selectedLog.destinationAirport}` : ""}
                  {selectedLog.returnAirport && selectedLog.returnAirport !== selectedLog.destinationAirport ? ` → ${selectedLog.returnAirport}` : ""}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p>{getStatusLabel(selectedLog.status)}</p>
              </div>

              {selectedLog.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="text-sm">{selectedLog.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between">
              {selectedLog.status === "pending" ? (
                <>
                  <Button
                    onClick={() => handleRejectLog(selectedLog.id)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveLog(selectedLog.id)}
                  >
                    Approve
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setSelectedLog(null)}
                  className="ml-auto"
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Milestone Update Dialog */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        {selectedMilestone && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Milestone Progress</DialogTitle>
              <DialogDescription>
                {selectedMilestone.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
                  Progress (%)
                </label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={milestoneProgress}
                  onChange={(e) => setMilestoneProgress(Number(e.target.value))}
                />
              </div>

              <Progress value={milestoneProgress} className="h-2" />
              
              <p className="text-sm text-gray-500">
                Current progress: {selectedMilestone.progress}%
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setSelectedMilestone(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMilestone}
                disabled={updateMilestoneProgressMutation.isPending}
              >
                {updateMilestoneProgressMutation.isPending ? "Updating..." : "Update Progress"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Students;
