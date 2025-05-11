import { TaskWithSubmission } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/hooks/use-modal";
import { useTask } from "@/hooks/use-task";
import { Info } from "lucide-react";
import { useState } from "react";

interface TaskCardProps {
  task: TaskWithSubmission;
}

export function TaskCard({ task }: TaskCardProps) {
  const { openModal } = useModal();
  const { startTask } = useTask();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const completionPercentage = Math.floor((task.completedCount / task.quantity) * 100);
  
  const handleTaskStart = async () => {
    // If the task is already started, show the proof submission modal
    if (task.hasSubmitted) {
      openModal("proofSubmission", { task });
      return;
    }
    
    // Otherwise start the task (typically opens the URL in a new tab)
    await startTask(task.id);
    // Then open the proof submission modal
    openModal("proofSubmission", { task });
  };
  
  const handleShowDetails = () => {
    openModal("taskDetails", { task });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg p-4 transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
            {task.imageUrl ? (
              <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold">
                {task.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-primary/60 mr-1.5"></span>
              {task.platform}
            </p>
            <div className="mt-1.5 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-0.5 mr-2 font-medium">
                {task.completedCount}/{task.quantity}
              </span>
              <span className="text-success-500 font-medium">
                ${Number(task.pricePerTask).toFixed(2)} per task
              </span>
            </div>
          </div>
        </div>
        <div>
          <Badge variant={task.status === "active" ? "success" : "warning"} className="capitalize font-medium">
            {task.status === "active" ? "Active" : task.status}
          </Badge>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100 dark:bg-gray-700">
            <div 
              style={{ width: `${completionPercentage}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1.5 font-medium text-gray-500 dark:text-gray-400">
            <span>{task.completedCount} completed</span>
            <span>{task.quantity} total</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between">
        <button 
          className={`text-sm px-4 py-2 ${
            isSubmitting ? 
              "bg-gray-400 cursor-not-allowed" : 
              "bg-primary hover:bg-primary/90 active:scale-[0.98]"
          } text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow`}
          onClick={handleTaskStart}
          disabled={isSubmitting}
        >
          {task.hasSubmitted ? "View Submission" : "Start Task"}
        </button>
        <button 
          className="text-sm flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 font-medium"
          onClick={handleShowDetails}
        >
          <Info className="h-4 w-4 mr-1.5" /> Details
        </button>
      </div>
    </div>
  );
}
