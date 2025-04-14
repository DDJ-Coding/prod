import { Milestone } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface MilestonesProps {
  milestones: Milestone[];
}

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="font-semibold text-lg text-gray-800">Training Milestones</h2>
      </div>
      <div className="p-4">
        <div className="relative pl-8">
          {milestones.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No milestones available</p>
            </div>
          ) : (
            milestones.map((milestone, index) => (
              <div key={milestone.id} className={`mb-6 relative ${index === milestones.length - 1 ? 'mb-0' : ''}`}>
                {index < milestones.length - 1 && (
                  <div className="absolute left-0 -translate-x-6 top-0 h-full">
                    <div className="w-px h-full bg-gray-300"></div>
                  </div>
                )}
                
                {milestone.status === 'completed' ? (
                  <div className="absolute top-0 left-0 w-4 h-4 rounded-full -translate-x-8 bg-success flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : milestone.status === 'in_progress' ? (
                  <div className="absolute top-0 left-0 w-4 h-4 rounded-full -translate-x-8 bg-accent flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="absolute top-0 left-0 w-4 h-4 rounded-full -translate-x-8 bg-gray-300"></div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                  {milestone.status === 'completed' ? (
                    <p className="text-gray-500 text-sm">
                      Completed on {milestone.completionDate ? formatDate(milestone.completionDate) : 'unknown date'}
                    </p>
                  ) : milestone.status === 'in_progress' ? (
                    <p className="text-gray-500 text-sm">
                      In Progress - {milestone.progress}% complete
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">Not started</p>
                  )}
                  
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
                      <div className="bg-accent h-1.5 rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Milestones;
