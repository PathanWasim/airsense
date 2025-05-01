import { AQIParameter } from "@/types/index";
import { getAQIColor, getAQIBarColor, getAQILevelText } from "@/lib/utils";

interface AQICardProps {
  parameter: AQIParameter;
}

export default function AQICard({ parameter }: AQICardProps) {
  // Get the level-specific badge color class
  const getBadgeClass = (level: string) => {
    switch (level) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "poor":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
      case "unhealthy":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "hazardous":
        return "bg-red-900/60 text-red-100 dark:bg-red-900/80 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {parameter.name}
            </h3>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {parameter.value}
              </p>
              <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                {parameter.unit}
              </p>
            </div>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(parameter.level)}`}
            >
              {getAQILevelText(parameter.level as any)}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
              <div 
                style={{ width: ${parameter.percentage}% }} 
                className={shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ${getAQIBarColor(parameter.level as any)}}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>
                {parameter.id === "pm25"
                  ? "100 μg/m³"
                  : parameter.id === "co2"
                    ? "1000 ppm"
                    : "100%"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
