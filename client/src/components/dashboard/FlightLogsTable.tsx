import { useState } from "react";
import { FlightLog } from "@shared/schema";
import { formatDate, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FlightLogsTableProps {
  logs: FlightLog[];
  onAddNew: () => void;
  onView: (log: FlightLog) => void;
  isLoading: boolean;
}

const FlightLogsTable: React.FC<FlightLogsTableProps> = ({
  logs,
  onAddNew,
  onView,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-800">Recent Flight Logs</h2>
        <Button 
          onClick={onAddNew}
          variant="ghost" 
          className="text-primary hover:text-primary-dark text-sm font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Log
        </Button>
      </div>
      {isLoading ? (
        <div className="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="mt-2 text-gray-600">Loading flight logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4">No flight logs found</p>
          <Button onClick={onAddNew}>Add Your First Flight Log</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(log.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.aircraftType || "Unknown"} ({log.tailNumber || "N/A"})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.departureAirport} {log.destinationAirport !== log.departureAirport ? `→ ${log.destinationAirport}` : ""}
                    {log.returnAirport && log.returnAirport !== log.destinationAirport ? ` → ${log.returnAirport}` : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDuration(log.duration)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.flightType === 'solo' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : log.flightType === 'cross-country'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.flightType === 'solo' 
                        ? 'Solo' 
                        : log.flightType === 'cross-country'
                          ? 'Cross-Country'
                          : 'Dual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.instructorName || (log.flightType === 'solo' ? "—" : "Unassigned")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : log.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status === 'approved' 
                        ? 'Approved' 
                        : log.status === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onView(log)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="px-6 py-3 border-t border-gray-200 text-right">
        <Button variant="link" asChild>
          <a href="/student/flight-logs" className="text-primary hover:text-primary-dark text-sm font-medium">
            View All Flight Logs →
          </a>
        </Button>
      </div>
    </div>
  );
};

export default FlightLogsTable;
