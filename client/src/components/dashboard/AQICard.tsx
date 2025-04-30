import { AQIParameter } from "@/types/index";
import { getAQIColor, getAQIBarColor, getAQILevelText } from "@/lib/utils";

interface AQICardProps {
  parameter: AQIParameter;
}

export default function AQICard({ parameter }: AQICardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{parameter.name}</h3>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{parameter.value}</p>
              <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">{parameter.unit}</p>
            </div>
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${parameter.level}-100 text-${parameter.level}-800 dark:bg-${parameter.level}-900 dark:text-${parameter.level}-300`}>
              {getAQILevelText(parameter.level as any)}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
              <div 
                style={{ width: `${parameter.percentage}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getAQIBarColor(parameter.level as any)}`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
