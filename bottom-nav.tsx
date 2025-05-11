import { TabType } from "@/types";
import { Home, ThumbsUp, Plus, Play, User, MessageSquare, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import { useModal } from "@/hooks/use-modal";

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const [_, navigate] = useLocation();
  const { openModal } = useModal();
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    if (tab === "profile") {
      navigate("/profile");
    } else if (tab === "messages") {
      navigate("/messages");
    } else if (tab === "apps") {
      navigate("/apps");
    } else {
      navigate("/");
    }
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 z-40 shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
      <div className="grid grid-cols-7 gap-1 max-w-md mx-auto px-2">
        <button 
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
            activeTab === "home" 
              ? "text-primary dark:text-primary bg-primary/5 dark:bg-primary/10" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => handleTabChange("home")}
        >
          <Home className={`h-5 w-5 ${activeTab === "home" ? "animate-pulse-once" : ""}`} />
          <span className="text-xs mt-1 font-medium">Home</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
            activeTab === "like" 
              ? "text-primary dark:text-primary bg-primary/5 dark:bg-primary/10" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => handleTabChange("like")}
        >
          <ThumbsUp className={`h-5 w-5 ${activeTab === "like" ? "animate-pulse-once" : ""}`} />
          <span className="text-xs mt-1 font-medium">Like</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
            activeTab === "watch" 
              ? "text-primary dark:text-primary bg-primary/5 dark:bg-primary/10" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => handleTabChange("watch")}
        >
          <Play className={`h-5 w-5 ${activeTab === "watch" ? "animate-pulse-once" : ""}`} />
          <span className="text-xs mt-1 font-medium">Watch</span>
        </button>
        
        <button 
          className="flex flex-col items-center justify-center bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 active:scale-95 text-white rounded-full w-14 h-14 mx-auto -mt-5 shadow-lg transition-all duration-200"
          onClick={() => {
            // This will open the task options modal instead of directly navigating
            openModal("taskOptions", {});
          }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-medium">Create</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
            activeTab === "apps" 
              ? "text-primary dark:text-primary bg-primary/5 dark:bg-primary/10" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => handleTabChange("apps")}
        >
          <Smartphone className={`h-5 w-5 ${activeTab === "apps" ? "animate-pulse-once" : ""}`} />
          <span className="text-xs mt-1 font-medium">Apps</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
            activeTab === "messages" 
              ? "text-primary dark:text-primary bg-primary/5 dark:bg-primary/10" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => handleTabChange("messages")}
        >
          <MessageSquare className={`h-5 w-5 ${activeTab === "messages" ? "animate-pulse-once" : ""}`} />
          <span className="text-xs mt-1 font-medium">Messages</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all ${
            activeTab === "profile" 
              ? "text-primary dark:text-primary bg-primary/5 dark:bg-primary/10" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => handleTabChange("profile")}
        >
          <User className={`h-5 w-5 ${activeTab === "profile" ? "animate-pulse-once" : ""}`} />
          <span className="text-xs mt-1 font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
