import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useModal } from "@/hooks/use-modal";
import { useMessage } from "@/hooks/use-message";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  recipientId: z.string().min(1, "User ID is required"),
  message: z.string().min(1, "Message cannot be empty").max(500, "Message is too long")
});

type FormData = z.infer<typeof formSchema>;

export function NewMessageModal() {
  const { modals, closeModal } = useModal();
  const { user } = useAuth();
  const { sendMessage, isSending } = useMessage();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientId: "",
      message: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    
    const recipientId = parseInt(data.recipientId);
    
    if (isNaN(recipientId)) {
      setError("Invalid user ID. Please enter a valid number.");
      return;
    }
    
    if (recipientId === user?.id) {
      setError("You cannot send a message to yourself.");
      return;
    }
    
    try {
      if (!user) {
        setError("You must be logged in to send messages.");
        return;
      }

      await sendMessage({
        content: data.message,
        senderId: user.id,
        receiverId: recipientId,
        taskId: null // Direct message without task context
      });
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      
      form.reset();
      closeModal("newMessage");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. User ID may not exist.");
    }
  };

  return (
    <Dialog open={modals.newMessage.isOpen} onOpenChange={() => closeModal("newMessage")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send New Message</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter user ID" 
                      {...field} 
                      type="number"
                      min="1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Type your message here..." 
                      {...field} 
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => closeModal("newMessage")}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}