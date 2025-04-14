import { calculateHoursPercentage } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
  color: string; // "primary", "secondary", or "accent"
  unit?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  maxValue,
  icon,
  color,
  unit = "hrs"
}) => {
  const percentage = calculateHoursPercentage(value, maxValue);
  
  const getBgColorClass = () => {
    switch (color) {
      case "primary": return "bg-primary";
      case "secondary": return "bg-secondary";
      case "accent": return "bg-accent";
      default: return "bg-primary";
    }
  };
  
  const getIconColorClass = () => {
    switch (color) {
      case "primary": return "text-primary";
      case "secondary": return "text-secondary";
      case "accent": return "text-accent";
      default: return "text-primary";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-700 font-medium">{title}</h3>
        <span className={getIconColorClass()}>{icon}</span>
      </div>
      <div className="flex items-end mb-2">
        <span className="text-3xl font-bold text-gray-800">{value.toFixed(1)}</span>
        <span className="text-gray-500 ml-1">{unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${getBgColorClass()} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{percentage}% of required {maxValue} {unit}</p>
    </div>
  );
};

export default ProgressCard;
