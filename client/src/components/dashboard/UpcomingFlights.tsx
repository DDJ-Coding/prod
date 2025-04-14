import { Booking } from "@shared/schema";
import { getRelativeDay, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UpcomingFlightsProps {
  flights: Booking[];
  onSchedule: () => void;
}

const UpcomingFlights: React.FC<UpcomingFlightsProps> = ({ flights, onSchedule }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="font-semibold text-lg text-gray-800">Upcoming Flights</h2>
      </div>
      <div className="p-4">
        {flights.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">No upcoming flights scheduled</p>
            <Button 
              onClick={onSchedule}
              className="w-full py-2 text-sm font-medium"
            >
              Schedule New Flight
            </Button>
          </div>
        ) : (
          <>
            {flights.map((flight) => (
              <div key={flight.id} className="border-b border-gray-100 py-3 px-2 flex items-center last:border-0">
                <div className="bg-primary/10 rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-800">{flight.notes || flight.trainingType}</h4>
                    <span className={`text-sm font-medium ${getRelativeDay(flight.startTime) === 'Tomorrow' ? 'text-primary' : 'text-gray-500'}`}>
                      {getRelativeDay(flight.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(flight.startTime)} - {formatTime(flight.endTime)}
                    </div>
                    {flight.instructorId && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Instructor: {flight.instructorName || "Assigned"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-3 px-2">
              <Button
                variant="outline"
                onClick={onSchedule}
                className="w-full py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors"
              >
                Schedule New Flight
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingFlights;
