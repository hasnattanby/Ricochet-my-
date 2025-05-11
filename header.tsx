import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";
import { Sun, Moon, Bell, Headset } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { openModal } = useModal();
  
  const { data: notificationCount = 0 } = useQuery<number>({
    queryKey: ["/api/notifications/unread/count"],
    enabled: !!user,
  });
  
  const { data: messageCount = 0 } = useQuery<number>({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user,
  });
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-primary dark:text-primary cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/")}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                SteadyClick
              </span>
            </h1>
          </div>
          
          {/* Right Side Icons */}
          {user && (
            <div className="flex items-center space-x-5">
              {/* Dark Mode Toggle */}
              <div>
                <label htmlFor="darkModeToggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id="darkModeToggle" 
                      className="sr-only" 
                      checked={theme === "dark"} 
                      onChange={toggleTheme}
                    />
                    <div className="block bg-gray-200 dark:bg-gray-600 w-10 h-6 rounded-full shadow-inner"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 transform ${
                      theme === "dark" ? "translate-x-4" : ""
                    } shadow-sm`}></div>
                  </div>
                  <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                    {theme === "dark" ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />}
                  </div>
                </label>
              </div>
              
              {/* Notification Bell */}
              <button 
                className="relative p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/notifications")}
              >
                <Bell size={20} className="transform hover:rotate-[15deg] transition-transform" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium shadow-sm animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {/* Complaint & Withdrawal */}
              <button 
                className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => openModal("withdrawal")}
              >
                <Headset size={20} className="transform hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
