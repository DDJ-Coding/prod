import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { FlightLog } from "@shared/schema";
import { formatDate, formatDuration } from "@/lib/utils";

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
import NewFlightLogModal from "@/components/modals/NewFlightLogModal";

const FlightLogs = () => {
  const { user } = useAuth();
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FlightLog | null>(null);

  // Fetch flight logs
  const { data: flightLogs = [], isLoading } = useQuery({
    queryKey: ["/api/flightlogs"],
    enabled: !!user,
  });

  const handleViewLog = (log: FlightLog) => {
    setSelectedLog(log);
  };

  const getFlightTypeLabel = (type: string) => {
    switch (type) {
      case "solo":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Solo
          </span>
        );
      case "cross-country":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Cross-Country
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Dual
          </span>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Flight Logs</h1>
          <p className="text-gray-600">View and manage your flight records</p>
        </div>
        <Button onClick={() => setShowNewLogModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Log
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your Flight Log History</CardTitle>
          <CardDescription>Complete record of your flying activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="mt-2 text-gray-600">Loading flight logs...</p>
            </div>
          ) : flightLogs.length === 0 ? (
            <div className="py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-gray-600">No flight logs found</p>
              <Button className="mt-4" onClick={() => setShowNewLogModal(true)}>Add Your First Flight Log</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Aircraft</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flightLogs.map((log: FlightLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{formatDate(log.date)}</TableCell>
                      <TableCell>{log.aircraftType || "Unknown"} ({log.tailNumber || "N/A"})</TableCell>
                      <TableCell>
                        {log.departureAirport} {log.destinationAirport !== log.departureAirport ? `→ ${log.destinationAirport}` : ""}
                        {log.returnAirport && log.returnAirport !== log.destinationAirport ? ` → ${log.returnAirport}` : ""}
                      </TableCell>
                      <TableCell>{formatDuration(log.duration)}</TableCell>
                      <TableCell>{getFlightTypeLabel(log.flightType)}</TableCell>
                      <TableCell>{log.instructorName || (log.flightType === 'solo' ? "—" : "Unassigned")}</TableCell>
                      <TableCell>{getStatusLabel(log.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLog(log)}
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

      {/* New Log Modal */}
      <NewFlightLogModal
        open={showNewLogModal}
        onClose={() => setShowNewLogModal(false)}
      />

      {/* View Log Details Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        {selectedLog && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Flight Log Details</DialogTitle>
              <DialogDescription>
                {formatDate(selectedLog.date)} - {formatDuration(selectedLog.duration)}
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

              {selectedLog.instructorId && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Instructor</h4>
                  <p>{selectedLog.instructorName || "Unassigned"}</p>
                </div>
              )}

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

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default FlightLogs;
