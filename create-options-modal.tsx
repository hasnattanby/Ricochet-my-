import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useLocation } from "wouter";
import { 
  Globe, 
  FileText,
  Smartphone,
  Download,
  Star,
  Code,
  Clock
} from "lucide-react";

export function CreateOptionsModal() {
  const { modals, closeModal, openModal } = useModal();
  const [_, navigate] = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleCloseModal = () => {
    closeModal("taskOptions");
    setExpandedSection(null);
  };

  const handleOpenDigitalMarketing = () => {
    closeModal("taskOptions");
    // Open existing digital marketing task creation
    // This should connect to your existing functionality
    openModal("proofSubmission", {});
  };

  const handleOpenAppTask = () => {
    closeModal("taskOptions");
    // Open the app task creation modal
    openModal("appTask", {});
  };

  // App task types
  const appTaskTypes = [
    { id: "app_download", name: "App Download", icon: <Download className="h-5 w-5 text-blue-500" /> },
    { id: "app_review", name: "App Review", icon: <Star className="h-5 w-5 text-yellow-500" /> },
    { id: "five_star", name: "Five Star Rating", icon: <Star className="h-5 w-5 text-yellow-500" /> },
    { id: "app_usage_time", name: "App Usage Time", icon: <Clock className="h-5 w-5 text-purple-500" /> },
    { id: "app_developer", name: "App Developer", icon: <Code className="h-5 w-5 text-green-500" /> },
    { id: "web_developer", name: "Website Developer", icon: <Globe className="h-5 w-5 text-indigo-500" /> },
  ];

  return (
    <Dialog open={modals.taskOptions?.isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Select the type of task you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          {/* Digital Marketing Option */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
              expandedSection === 'digitalMarketing' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              if (expandedSection === 'digitalMarketing') {
                handleOpenDigitalMarketing();
              } else {
                setExpandedSection('digitalMarketing');
              }
            }}
          >
            <div className="flex items-center">
              <div className="mr-4 p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium">Digital Marketing</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create tasks for digital marketing activities</p>
              </div>
            </div>
            
            {expandedSection === 'digitalMarketing' && (
              <div className="mt-4 pl-12">
                <p className="text-sm mb-3">Create tasks for follows, likes, comments, subscriptions and more</p>
                <Button size="sm" className="w-full" onClick={handleOpenDigitalMarketing}>
                  Continue to Digital Marketing
                </Button>
              </div>
            )}
          </div>
          
          {/* App Tasks Option */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
              expandedSection === 'appTasks' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              if (expandedSection === 'appTasks') {
                handleOpenAppTask();
              } else {
                setExpandedSection('appTasks');
              }
            }}
          >
            <div className="flex items-center">
              <div className="mr-4 p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <Smartphone className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h3 className="font-medium">App Tasks</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create tasks for app downloads, reviews, and development</p>
              </div>
            </div>
            
            {expandedSection === 'appTasks' && (
              <div className="mt-4 pl-12">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {appTaskTypes.map(type => (
                    <div key={type.id} className="flex items-center p-2 border rounded-md text-sm">
                      {type.icon}
                      <span className="ml-2">{type.name}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full" onClick={handleOpenAppTask}>
                  Continue to App Tasks
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}