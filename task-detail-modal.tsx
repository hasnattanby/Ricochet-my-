import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskWithSubmission } from "@/types";
import { useModal } from "@/hooks/use-modal";
import { useTask } from "@/hooks/use-task";
import { Calendar, DollarSign, Users, Check, X } from "lucide-react";
import { format } from "date-fns";

export function TaskDetailModal() {
  const { modals, closeModal, openModal } = useModal();
  const { startTask } = useTask();
  const isOpen = modals.taskDetails.isOpen;
  const task = modals.taskDetails.data?.task as TaskWithSubmission | undefined;

  if (!task) return null;

  const completionPercentage = Math.floor((task.completedCount / task.quantity) * 100);
  
  const handleStartTask = async () => {
    await startTask(task.id);
    closeModal("taskDetails");
    openModal("proofSubmission", { task });
  };
  
  // Debugging
  console.log("TaskDetailModal: Task data", task);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal("taskDetails")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {task.imageUrl ? (
                <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                  {task.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">{task.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{task.platform}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Reward:</span>
              <span className="text-sm font-medium text-success-500">${Number(task.pricePerTask).toFixed(2)} per task</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
              <span className="text-sm">{formatDate(task.createdAt)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion:</span>
              <span className="text-sm">{task.completedCount}/{task.quantity} ({completionPercentage}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <Badge variant={task.status === "active" ? "success" : "warning"}>
                {task.status}
              </Badge>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description:</p>
            <p className="text-sm">{task.description}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Instructions:</p>
            <ol className="text-sm space-y-2 pl-5 list-decimal">
              <li>Click the "Start Task" button to open the {task.platform} {task.type === "subscribe" ? "channel" : task.type === "like" ? "post" : "video"}</li>
              <li>{task.type === "subscribe" ? "Subscribe to the channel" : task.type === "like" ? "Like and comment on the post" : "Watch the video for the required time"}</li>
              <li>Come back and submit your proof (email/screenshot)</li>
              <li>Wait for verification and receive your reward</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              // First close the details modal
              closeModal("taskDetails");
              
              // Make sure to send a clean copy of the task to the messenger modal
              setTimeout(() => {
                openModal("messenger", { 
                  task: {...task} 
                });
              }, 100);
            }}
          >
            Message Creator
          </Button>
          <Button 
            variant="default"
            onClick={handleStartTask}
          >
            Start Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
