import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleAlert, AlertCircle, MessageCircle, ExternalLink } from "lucide-react";
import { TaskWithSubmission } from "@/types";
import { useModal } from "@/hooks/use-modal";
import { useTask } from "@/hooks/use-task";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSubmissionSchema, InsertTaskSubmission } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

export function TaskProofModal() {
  const { modals, closeModal, openModal } = useModal();
  const { submitProof, isSubmitting, startTask } = useTask();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("submit-proof");
  
  const isOpen = modals.proofSubmission.isOpen;
  const task = modals.proofSubmission.data?.task as TaskWithSubmission | undefined;
  
  const form = useForm<InsertTaskSubmission>({
    resolver: zodResolver(insertTaskSubmissionSchema),
    defaultValues: {
      taskId: task?.id,
      proof: "",
    },
  });

  if (!task) return null;

  const onSubmit = (data: InsertTaskSubmission) => {
    submitProof(data, {
      onSuccess: () => {
        closeModal("proofSubmission");
        form.reset();
      },
    });
  };

  // Open the task in a new tab
  const handleOpenTask = async () => {
    if (task.url) {
      await startTask(task.id);
    }
  };

  // Open messaging dialog for this task
  const handleOpenMessage = () => {
    closeModal("proofSubmission");
    openModal("messenger", { task });
  };

  // Update taskId when task changes
  if (task && task.id !== form.getValues().taskId) {
    form.setValue("taskId", task.id);
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal("proofSubmission")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle>Task: {task.title}</DialogTitle>
            <DialogClose />
          </div>
          
          <div className="flex items-center space-x-3 mt-2">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {task.type.charAt(0).toUpperCase() + task.type.slice(1)} Task - {task.platform}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mb-4 border dark:border-gray-700 rounded-lg">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left p-3 space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            onClick={handleOpenTask}
          >
            <ExternalLink className="h-5 w-5 text-primary" />
            <span>Open task link in new tab to complete it</span>
          </Button>
        </div>
        
        <Tabs defaultValue="submit-proof" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit-proof">Submit Proof</TabsTrigger>
            <TabsTrigger value="message">Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submit-proof" className="space-y-4 mt-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    {task.type === "subscribe" 
                      ? "Please provide the Gmail ID you used to subscribe to the channel. This will be used for verification."
                      : task.type === "like"
                      ? "Please provide proof that you liked or commented on the post (e.g., your username or screenshot)."
                      : "Please provide proof that you watched the video (e.g., a comment you left or the timestamp you reached)."}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proof">
                    {task.type === "subscribe" ? "Your Gmail ID" : "Your Proof"}
                  </Label>
                  <Textarea
                    id="proof"
                    placeholder={task.type === "subscribe" ? "youremail@gmail.com" : "Enter your proof here"}
                    {...form.register("proof")}
                    className="mt-1 min-h-[100px]"
                  />
                  {form.formState.errors.proof && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.proof.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {task.type === "subscribe" 
                      ? "Enter the same Gmail ID you used for the subscription"
                      : task.type === "like"
                      ? "Enter your username or describe your comment on the post"
                      : "Describe what happened in the video to verify you watched it"}
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  variant="default"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Proof"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="message" className="space-y-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Having issues with this task? Send a message to the task creator to ask questions or get help.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleOpenMessage}
                className="w-full"
                variant="outline"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Open Conversation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
