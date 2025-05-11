import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useModal } from "@/hooks/use-modal";
import { useMessage } from "@/hooks/use-message";
import { useAuth } from "@/hooks/use-auth";
import { MessageWithUser, TaskWithCreator } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send, Check, ClipboardCheck, ExternalLink, MessageSquare, Circle, Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function MessageModal() {
  const { modals, closeModal, openModal } = useModal();
  const { user } = useAuth();
  const { sendMessage, isSending } = useMessage();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isOpen = modals.messenger.isOpen;
  const task = modals.messenger.data?.task as TaskWithCreator | undefined;
  
  // Online status simulation
  const [otherUserOnline, setOtherUserOnline] = useState(true);
  
  // Typing indicator simulation
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  // Log when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      console.log("MessageModal opened with task:", task);
    }
  }, [isOpen, task]);
  
  // Random typing status
  useEffect(() => {
    if (isOpen && otherUserOnline) {
      const typingInterval = setInterval(() => {
        // Randomly start/stop typing
        const shouldType = Math.random() > 0.7;
        setOtherUserTyping(shouldType);
        
        // Stop typing after 2-5 seconds
        if (shouldType) {
          const typingDuration = 2000 + Math.random() * 3000;
          setTimeout(() => setOtherUserTyping(false), typingDuration);
        }
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(typingInterval);
    }
  }, [isOpen, otherUserOnline]);
  
  useEffect(() => {
    // Simulate other user going offline/online occasionally
    if (isOpen) {
      const interval = setInterval(() => {
        setOtherUserOnline(prev => !prev);
      }, 30000); // Change every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);
  
  // Using static conversation data while we fix the API authentication
  const [conversation, setConversation] = useState<MessageWithUser[]>([
    {
      id: 1,
      taskId: 1,
      senderId: 2, // Creator
      receiverId: 1, // User
      content: "Hi there! I see you're interested in this task. Do you have any questions?",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: 2,
      taskId: 1,
      senderId: 1, // User
      receiverId: 2, // Creator
      content: "Yes, how long do I need to watch the video for it to count as completed?",
      isRead: true,
      createdAt: new Date(Date.now() - 3000000), // 50 minutes ago
    },
    {
      id: 3,
      taskId: 1,
      senderId: 2, // Creator
      receiverId: 1, // User
      content: "You need to watch at least 2 minutes of the video and then take a screenshot showing that you watched it.",
      isRead: true,
      createdAt: new Date(Date.now() - 2400000), // 40 minutes ago
    }
  ]);
  
  if (!user) return null;
  
  // Debugging logs
  console.log("MessageModal: Task data", task);

  // If no task is specified, show a message that we need a task
  if (!task) return null;
  
  const isCreator = user.id === task.creatorId;
  const otherUserId = isCreator ? task.creatorId : task.creatorId;
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSendMessage = () => {
    if ((!messageText.trim() && !selectedImage) || isSending) return;
    
    // Since we're using mock data, just add the message locally instead of sending to server
    const newMessage: MessageWithUser = {
      id: conversation.length + 1,
      taskId: task?.id || 1,
      senderId: user.id,
      receiverId: otherUserId,
      content: messageText,
      isRead: false,
      createdAt: new Date(),
    };
    
    // Only add imageUrl if we actually have an image
    if (imagePreview) {
      newMessage.imageUrl = imagePreview;
    }
    
    setConversation(prev => [...prev, newMessage]);
    
    setMessageText("");
    clearSelectedImage();
  };
  
  const formatMessageDate = (dateString: string | Date) => {
    if (!dateString) return "";
    return format(new Date(dateString), "HH:mm");
  };
  
  const formatDateHeader = (dateString: string | Date) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMMM dd, yyyy");
  };
  
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: MessageWithUser[] }[] = [];
    
    conversation.forEach((message) => {
      const messageDate = format(new Date(message.createdAt), "yyyy-MM-dd");
      const existingGroup = groups.find((group) => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal("messenger")}>
      <DialogContent className="sm:max-w-md h-[80vh] max-h-screen flex flex-col p-0">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {task.imageUrl ? (
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                      {task.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -right-1 -bottom-1">
                  <Circle className={`h-3 w-3 ${otherUserOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"}`} />
                </div>
              </div>
              <div>
                <DialogTitle>{task.title}</DialogTitle>
                <div className="flex items-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Task #{task.id}</p>
                  <span className={`text-xs ml-2 ${otherUserOnline ? "text-green-500" : "text-gray-400"}`}>
                    {otherUserOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
            <DialogClose />
          </div>
        </DialogHeader>
        
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center"
            onClick={() => {
              closeModal("messenger");
              openModal("proofSubmission", { task });
            }}
          >
            <ClipboardCheck className="h-4 w-4 mr-1" />
            Submit Proof
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center"
            onClick={() => {
              if (task.url) {
                window.open(task.url, '_blank');
              }
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open Task
          </Button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messageGroups.map((group) => (
            <div key={group.date}>
              <div className="flex justify-center mb-4">
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700">
                  {formatDateHeader(group.date)}
                </Badge>
              </div>
              
              {group.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.senderId === user.id ? "justify-end" : ""} mb-4`}
                >
                  {message.senderId !== user.id && (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mr-2 flex-shrink-0">
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                        {task.creator?.username.charAt(0).toUpperCase() || "C"}
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className={`max-w-[75%] ${
                      message.senderId === user.id 
                        ? "bg-primary-100 dark:bg-primary-900" 
                        : "bg-gray-100 dark:bg-gray-700"
                    } rounded-lg p-3`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Message attachment" 
                          className="max-w-full rounded-lg max-h-48 object-contain" 
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        message.senderId === user.id 
                          ? "text-primary-600 dark:text-primary-400" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {formatMessageDate(message.createdAt)}
                      </span>
                      
                      {message.senderId === user.id && (
                        <span className="text-xs text-blue-500 ml-2 flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Seen
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {message.senderId === user.id && (
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden ml-2 flex-shrink-0">
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {task.status === "completed" && (
            <div className="flex justify-center">
              <Badge variant="success" className="text-white">
                <Check className="h-3 w-3 mr-1" /> Task Completed
              </Badge>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          {otherUserTyping && otherUserOnline && (
            <div className="text-xs text-gray-500 italic mb-2 flex items-center">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mr-1">
                <span className="text-primary text-xs">
                  {task.creator?.username.charAt(0).toUpperCase() || "C"}
                </span>
              </div>
              <span>typing...</span>
              <span className="flex ml-1">
                <span className="animate-bounce mx-[0.5px] h-1 w-1 bg-gray-500 rounded-full"></span>
                <span className="animate-bounce mx-[0.5px] delay-75 h-1 w-1 bg-gray-500 rounded-full"></span>
                <span className="animate-bounce mx-[0.5px] delay-150 h-1 w-1 bg-gray-500 rounded-full"></span>
              </span>
            </div>
          )}
          
          {/* Image preview */}
          {imagePreview && (
            <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md relative">
              <div className="flex items-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-16 w-auto object-contain rounded"
                />
                <Button 
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                  onClick={clearSelectedImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden" 
              id="image-upload"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="rounded-r-none border-r-0 border-y border-l border-input"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Input
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              placeholder="Type a message..."
              className="flex-grow rounded-none border-x-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              className="rounded-l-none"
              onClick={handleSendMessage}
              disabled={isSending || (!messageText.trim() && !selectedImage)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
