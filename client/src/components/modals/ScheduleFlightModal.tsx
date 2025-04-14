import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertBookingSchema } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface ScheduleFlightModalProps {
  open: boolean;
  onClose: () => void;
}

// Training type options
const trainingTypeOptions = [
  { value: "pattern", label: "Pattern Work" },
  { value: "cross-country", label: "Cross-Country" },
  { value: "instrument", label: "Instrument Training" },
  { value: "night", label: "Night Flying" },
  { value: "maneuvers", label: "Basic Maneuvers" },
];

// Time options
const timeOptions = [
  { value: "8:00", label: "8:00 AM" },
  { value: "9:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
];

// Duration options
const durationOptions = [
  { value: "1.0", label: "1.0 hour" },
  { value: "1.5", label: "1.5 hours" },
  { value: "2.0", label: "2.0 hours" },
  { value: "2.5", label: "2.5 hours" },
  { value: "3.0", label: "3.0 hours" },
  { value: "4.0", label: "4.0 hours" },
];

// Extend the insert schema with additional validation
const formSchema = z.object({
  studentId: z.number(),
  instructorId: z.number().optional(),
  trainingType: z.string().min(1, "Training type is required"),
  date: z.date({
    required_error: "A date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  duration: z.string().min(1, "Duration is required"),
  aircraftId: z.number().optional(),
  alternativeDate: z.date().optional(),
  alternativeTime: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ScheduleFlightModal: React.FC<ScheduleFlightModalProps> = ({
  open,
  onClose,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch instructors
  const { data: instructors = [] } = useQuery({
    queryKey: ["/api/users/instructors"],
    enabled: open,
  });

  // Fetch aircraft
  const { data: aircraft = [] } = useQuery({
    queryKey: ["/api/aircraft"],
    enabled: open,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: user?.id,
      date: new Date(),
      startTime: "",
      duration: "",
      trainingType: "",
      notes: "",
    },
  });

  // Reset form when modal is opened
  useEffect(() => {
    if (open && user) {
      form.reset({
        studentId: user.id,
        date: new Date(),
        startTime: "",
        duration: "",
        trainingType: "",
        notes: "",
      });
    }
  }, [open, user, form]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert form data to the expected format for the API
      const startDateTime = new Date(data.date);
      const [hours, minutes] = data.startTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const durationHours = parseFloat(data.duration);
      const endDateTime = new Date(startDateTime);
      endDateTime.setTime(endDateTime.getTime() + durationHours * 60 * 60 * 1000);
      
      const bookingData = {
        studentId: data.studentId,
        instructorId: data.instructorId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        trainingType: data.trainingType,
        aircraftId: data.aircraftId,
        status: "pending",
        notes: data.notes,
      };
      
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Flight successfully scheduled",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/student"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/student"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error scheduling flight",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createBookingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Flight</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="trainingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trainingTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructor</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Instructor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instructors.map((instructor: any) => (
                        <SelectItem 
                          key={instructor.id} 
                          value={instructor.id.toString()}
                        >
                          {instructor.firstName} {instructor.lastName}
                        </SelectItem>
                      ))}
                      <SelectItem value="any">Any Available Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aircraftId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aircraft (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Aircraft" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {aircraft.map((ac: any) => (
                        <SelectItem 
                          key={ac.id} 
                          value={ac.id.toString()}
                        >
                          {ac.type} ({ac.tailNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Start Time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Alternative Date/Time (Optional)</h4>
              <p className="text-sm text-gray-600 mb-2">If your preferred time is unavailable</p>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="alternativeDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternativeTime"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Start Time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific goals or requests for this flight..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? "Submitting..." : "Request Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleFlightModal;
