import { TaskSubmission } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface HistoryListProps {
  submissions: TaskSubmission[];
}

export function HistoryList({ submissions }: HistoryListProps) {
  if (!submissions || submissions.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No task history found.</p>;
  }
  
  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <div key={submission.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
          <div>
            <p className="font-medium">Task #{submission.taskId}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{submission.proof}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {format(new Date(submission.createdAt), "MMM dd, yyyy - HH:mm")}
            </p>
          </div>
          <div className="text-right">
            <p className={submission.status === "approved" ? "text-success-500 font-medium" : "text-warning-500 font-medium"}>
              {submission.status === "approved" ? "+$0.02" : "$0.02"}
            </p>
            <Badge 
              variant={
                submission.status === "approved" 
                  ? "success" 
                  : submission.status === "rejected" 
                  ? "destructive" 
                  : "warning"
              }
              className="mt-1"
            >
              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
