import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertFlightLogSchema } from "@shared/schema";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface NewFlightLogModalProps {
  open: boolean;
  onClose: () => void;
}

// Extend the insert schema with additional validation
const formSchema = insertFlightLogSchema.extend({
  date: z.date({
    required_error: "A date is required",
  }),
  duration: z.coerce.number().min(0.1, {
    message: "Duration must be at least 0.1 hours",
  }),
  departureAirport: z.string().min(3, {
    message: "Airport code is required (min 3 characters)",
  }),
  destinationAirport: z.string().min(3, {
    message: "Airport code is required (min 3 characters)",
  }),
  flightType: z.enum(["dual", "solo", "cross-country"], {
    required_error: "Flight type is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const NewFlightLogModal: React.FC<NewFlightLogModalProps> = ({
  open,
  onClose,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch aircraft list
  const { data: aircraft = [] } = useQuery({
    queryKey: ["/api/aircraft"],
    enabled: open,
  });

  // Fetch instructor list
  const { data: instructors = [] } = useQuery({
    queryKey: ["/api/users/instructors"],
    enabled: open,
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: user?.id,
      date: new Date(),
      duration: 0,
      departureAirport: "",
      destinationAirport: "",
      returnAirport: "",
      flightType: "dual",
      notes: "",
    },
  });

  // Reset form when modal is opened
  useEffect(() => {
    if (open && user) {
      form.reset({
        studentId: user.id,
        date: new Date(),
        duration: 0,
        departureAirport: "",
        destinationAirport: "",
        returnAirport: "",
        flightType: "dual",
        notes: "",
      });
    }
  }, [open, user, form]);

  // Watch for flight type to conditionally show instructor field
  const flightType = form.watch("flightType");

  // Create flight log mutation
  const createLogMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/flightlogs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Flight log created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/flightlogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/student"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error creating flight log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createLogMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Flight Log</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Date and Duration */}
            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="2.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Aircraft */}
            <FormField
              control={form.control}
              name="aircraftId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aircraft</FormLabel>
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
                        <SelectItem key={ac.id} value={ac.id.toString()}>
                          {ac.type} ({ac.tailNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Route */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="departureAirport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure</FormLabel>
                    <FormControl>
                      <Input placeholder="KBOS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationAirport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="KPVD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnAirport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return</FormLabel>
                    <FormControl>
                      <Input placeholder="KBOS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Flight Type */}
            <FormField
              control={form.control}
              name="flightType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dual" id="dual" />
                        <Label htmlFor="dual">Dual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solo" id="solo" />
                        <Label htmlFor="solo">Solo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="cross-country"
                          id="cross-country"
                        />
                        <Label htmlFor="cross-country">Cross-Country</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instructor (if flight type is dual) */}
            {flightType === "dual" && (
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this flight..."
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
                disabled={createLogMutation.isPending}
              >
                {createLogMutation.isPending ? "Saving..." : "Save Log"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFlightLogModal;
