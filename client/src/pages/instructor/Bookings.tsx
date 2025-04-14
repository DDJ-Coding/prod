import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Booking } from "@shared/schema";

const Bookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/bookings/instructor"],
    enabled: !!user,
  });

  // Mutation to update booking status
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/bookings/${bookingId}/status`,
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking updated",
        description: "The booking status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/instructor"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/instructor"] });
      setSelectedBooking(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConfirmBooking = (bookingId: number) => {
    updateBookingStatusMutation.mutate({ bookingId, status: "confirmed" });
  };

  const handleCancelBooking = (bookingId: number) => {
    updateBookingStatusMutation.mutate({ bookingId, status: "cancelled" });
  };

  const handleCompleteBooking = (bookingId: number) => {
    updateBookingStatusMutation.mutate({ bookingId, status: "completed" });
  };

  // Filter bookings by selected date and status
  const filteredBookings = bookings.filter((booking: Booking) => {
    const bookingDate = new Date(booking.startTime);
    const isDateMatch = !selectedDate || (
      bookingDate.getDate() === selectedDate.getDate() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getFullYear() === selectedDate.getFullYear()
    );
    
    const isStatusMatch = statusFilter === "all" || booking.status === statusFilter;
    
    return isDateMatch && isStatusMatch;
  });

  // Get dates with bookings for calendar highlighting
  const datesWithBookings = bookings.map((booking: Booking) => new Date(booking.startTime));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Flight Bookings</h1>
        <p className="text-gray-600">Manage student flight bookings and sessions</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to filter bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              modifiers={{
                booked: datesWithBookings,
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: "bold",
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  color: "#2563EB",
                },
              }}
            />
            {selectedDate && (
              <div className="mt-4">
                <h3 className="font-medium text-sm mb-1">
                  {formatDate(selectedDate)}
                </h3>
                <p className="text-xs text-gray-500">
                  {filteredBookings.length === 0
                    ? "No bookings for this date"
                    : `${filteredBookings.length} booking(s) scheduled`}
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="font-medium text-sm mb-2">Filter by Status</h3>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={() => setSelectedDate(undefined)}>
                Show All Dates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? `Bookings for ${formatDate(selectedDate)}` 
                : "All Bookings"}
            </CardTitle>
            <CardDescription>
              {statusFilter !== "all" 
                ? `Filtered by status: ${statusFilter}` 
                : "Manage upcoming flight sessions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="mt-2 text-gray-600">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-gray-600">
                  {selectedDate 
                    ? "No bookings found for the selected date" 
                    : statusFilter !== "all" 
                      ? `No ${statusFilter} bookings found` 
                      : "No bookings found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Training Type</TableHead>
                      <TableHead>Aircraft</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking: Booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.studentName || "Student"}</TableCell>
                        <TableCell>{formatDate(booking.startTime)}</TableCell>
                        <TableCell>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </TableCell>
                        <TableCell className="capitalize">{booking.trainingType}</TableCell>
                        <TableCell>{booking.aircraftType || "Not specified"}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        {selectedBooking && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                {formatDate(selectedBooking.startTime)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Student</h4>
                  <p>{selectedBooking.studentName || "Student"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>{getStatusBadge(selectedBooking.status)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Time</h4>
                  <p>
                    {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                  <p>
                    {(() => {
                      const start = new Date(selectedBooking.startTime);
                      const end = new Date(selectedBooking.endTime);
                      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      return `${diffHours.toFixed(1)} hours`;
                    })()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Training Type</h4>
                <p className="capitalize">{selectedBooking.trainingType}</p>
              </div>

              {selectedBooking.aircraftId && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Aircraft</h4>
                  <p>{selectedBooking.aircraftType || "Unspecified"} ({selectedBooking.tailNumber || "N/A"})</p>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              {selectedBooking.status === "pending" && (
                <>
                  <Button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleConfirmBooking(selectedBooking.id)}
                    variant="default"
                  >
                    Confirm
                  </Button>
                </>
              )}
              
              {selectedBooking.status === "confirmed" && (
                <>
                  <Button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleCompleteBooking(selectedBooking.id)}
                    variant="default"
                  >
                    Mark Completed
                  </Button>
                </>
              )}
              
              {(selectedBooking.status === "completed" || selectedBooking.status === "cancelled") && (
                <Button
                  onClick={() => setSelectedBooking(null)}
                  variant="outline"
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Bookings;
