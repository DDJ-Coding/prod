import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Booking } from "@shared/schema";
import { formatDate, formatTime } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import ScheduleFlightModal from "@/components/modals/ScheduleFlightModal";
import { Badge } from "@/components/ui/badge";

const Schedule = () => {
  const { user } = useAuth();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/bookings/student"],
    enabled: !!user,
  });

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  // Filter bookings for selected date (if any)
  const filteredBookings = selectedDate 
    ? bookings.filter((booking: Booking) => {
        const bookingDate = new Date(booking.startTime);
        return (
          bookingDate.getDate() === selectedDate.getDate() &&
          bookingDate.getMonth() === selectedDate.getMonth() &&
          bookingDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : bookings;

  // Get dates with bookings for calendar highlighting
  const datesWithBookings = bookings.map((booking: Booking) => new Date(booking.startTime));

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Flight Schedule</h1>
          <p className="text-gray-600">Manage your upcoming flight bookings</p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule New Flight
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view bookings</CardDescription>
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
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? `Bookings for ${formatDate(selectedDate)}` 
                : "All Upcoming Bookings"}
            </CardTitle>
            <CardDescription>
              {selectedDate 
                ? "Scheduled flights for the selected date" 
                : "View and manage your upcoming flight sessions"}
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
                    : "No upcoming bookings found"}
                </p>
                <Button className="mt-4" onClick={() => setShowScheduleModal(true)}>
                  Schedule New Flight
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Training Type</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking: Booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{formatDate(booking.startTime)}</TableCell>
                        <TableCell>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </TableCell>
                        <TableCell className="capitalize">{booking.trainingType}</TableCell>
                        <TableCell>{booking.instructorName || "Unassigned"}</TableCell>
                        <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBooking(booking)}
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

      {/* Schedule Flight Modal */}
      <ScheduleFlightModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      {/* View Booking Details Modal */}
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
                  <h4 className="text-sm font-medium text-gray-500">Time</h4>
                  <p>
                    {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p>{getBookingStatusBadge(selectedBooking.status)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Training Type</h4>
                <p className="capitalize">{selectedBooking.trainingType}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Instructor</h4>
                <p>{selectedBooking.instructorName || "Unassigned"}</p>
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Schedule;
