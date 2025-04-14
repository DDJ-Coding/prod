import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Certifications = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/student"],
    enabled: !!user,
  });

  // License data - In a real implementation, this would come from the API
  const licenses = [
    {
      id: 1,
      title: "Private Pilot License (PPL)",
      description: "Allows you to fly small aircraft for personal use.",
      requirements: [
        { name: "Minimum Age", value: "17 years", completed: true },
        { name: "Medical Certificate", value: "Class 3 or higher", completed: true },
        { name: "Total Flight Time", value: "40 hours", completed: false, progress: 42.5, required: 40 },
        { name: "Dual Instruction Time", value: "20 hours", completed: true, progress: 30.2, required: 20 },
        { name: "Solo Flight Time", value: "10 hours", completed: false, progress: 8.2, required: 10 },
        { name: "Cross-Country Time", value: "5 hours", completed: true, progress: 12.3, required: 5 },
        { name: "Night Flight", value: "3 hours", completed: true, progress: 3.5, required: 3 },
        { name: "Written Exam", value: "Passing score", completed: false },
        { name: "Practical Test", value: "Checkride", completed: false },
      ],
      status: "in-progress",
      progress: 75,
      estimatedCompletion: "August 2023",
    },
    {
      id: 2,
      title: "Instrument Rating",
      description: "Allows you to fly under Instrument Flight Rules (IFR).",
      requirements: [
        { name: "Hold a PPL", value: "Required", completed: false },
        { name: "Total Flight Time", value: "50 hours cross-country PIC", completed: false, progress: 12.3, required: 50 },
        { name: "Instrument Time", value: "40 hours", completed: false, progress: 8.5, required: 40 },
        { name: "Written Exam", value: "Passing score", completed: false },
        { name: "Practical Test", value: "Checkride", completed: false },
      ],
      status: "not-started",
      progress: 10,
      estimatedCompletion: "February 2024",
    },
    {
      id: 3,
      title: "Commercial Pilot License (CPL)",
      description: "Allows you to be paid for flying.",
      requirements: [
        { name: "Minimum Age", value: "18 years", completed: true },
        { name: "Medical Certificate", value: "Class 2 or higher", completed: false },
        { name: "Total Flight Time", value: "250 hours", completed: false, progress: 42.5, required: 250 },
        { name: "Cross-Country Time", value: "50 hours", completed: false, progress: 12.3, required: 50 },
        { name: "Night Flight", value: "10 hours", completed: false, progress: 3.5, required: 10 },
        { name: "Instrument Time", value: "10 hours", completed: false, progress: 8.5, required: 10 },
        { name: "Complex Aircraft Time", value: "10 hours", completed: false, progress: 0, required: 10 },
        { name: "Written Exam", value: "Passing score", completed: false },
        { name: "Practical Test", value: "Checkride", completed: false },
      ],
      status: "not-started",
      progress: 5,
      estimatedCompletion: "October 2024",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-500">Not Started</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Certifications</h1>
        <p className="text-gray-600">Track your progress towards aviation certifications</p>
      </header>

      {isLoading ? (
        <div className="py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="mt-4 text-gray-600">Loading your certification data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* License Progress Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>License Progress</CardTitle>
              <CardDescription>Overview of your certification journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {licenses.map((license) => (
                <div key={license.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{license.title}</h3>
                    {getStatusBadge(license.status)}
                  </div>
                  <Progress value={license.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{license.progress}% complete</span>
                    <span>Est. completion: {license.estimatedCompletion}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active License Details */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>License Requirements</CardTitle>
              <CardDescription>Details of certification requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {licenses.map((license) => (
                  <AccordionItem key={license.id} value={`license-${license.id}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        {license.title}
                        <span className="text-xs">
                          {getStatusBadge(license.status)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-2">
                        <p className="text-sm text-gray-600 mb-4">{license.description}</p>
                        
                        <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                        <div className="space-y-4">
                          {license.requirements.map((req, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-sm">{req.name}</span>
                                <span className="text-sm font-medium">{req.value}</span>
                              </div>
                              
                              {req.progress !== undefined && req.required !== undefined && (
                                <>
                                  <Progress 
                                    value={(req.progress / req.required) * 100} 
                                    className="h-1.5" 
                                    indicatorClassName={req.completed ? "bg-green-500" : undefined}
                                  />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Progress: {req.progress} / {req.required}</span>
                                    <span className={req.completed ? "text-green-600" : ""}>
                                      {req.completed ? "Complete" : `${Math.round((req.progress / req.required) * 100)}%`}
                                    </span>
                                  </div>
                                </>
                              )}
                              
                              {req.progress === undefined && (
                                <div className="flex justify-end text-xs">
                                  <span className={req.completed ? "text-green-600" : "text-gray-500"}>
                                    {req.completed ? "Complete" : "Incomplete"}
                                  </span>
                                </div>
                              )}
                              
                              <Separator className="my-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Training Milestones */}
          <Card className="lg:col-span-6">
            <CardHeader>
              <CardTitle>Training Milestones</CardTitle>
              <CardDescription>Key achievements in your training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-8">
                {dashboardData?.milestones.map((milestone, index) => (
                  <div key={milestone.id} className={`mb-6 relative ${index === dashboardData.milestones.length - 1 ? 'mb-0' : ''}`}>
                    {index < dashboardData.milestones.length - 1 && (
                      <div className="absolute left-0 -translate-x-6 top-0 h-full">
                        <div className="w-px h-full bg-gray-300"></div>
                      </div>
                    )}
                    
                    {milestone.status === 'completed' ? (
                      <div className="absolute top-0 left-0 w-4 h-4 rounded-full -translate-x-8 bg-green-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : milestone.status === 'in_progress' ? (
                      <div className="absolute top-0 left-0 w-4 h-4 rounded-full -translate-x-8 bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <div className="absolute top-0 left-0 w-4 h-4 rounded-full -translate-x-8 bg-gray-300"></div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                      <p className="text-gray-500 text-sm">
                        {milestone.status === 'completed' 
                          ? `Completed on ${milestone.completionDate ? formatDate(milestone.completionDate) : 'unknown date'}`
                          : milestone.status === 'in_progress' 
                            ? `In Progress - ${milestone.progress}% complete`
                            : "Not started"}
                      </p>
                      
                      {milestone.status === 'completed' && milestone.approvedBy && (
                        <div className="bg-green-50 text-green-800 text-xs font-medium inline-flex items-center px-2 py-1 rounded mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Approved by instructor
                        </div>
                      )}
                      
                      {milestone.status === 'in_progress' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Certifications;
