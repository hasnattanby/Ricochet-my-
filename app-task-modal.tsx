import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModal } from "@/hooks/use-modal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Star, Clock, Code, Globe } from "lucide-react";

// App task types for the selection
const APP_TASK_TYPES = [
  { id: "app_download", label: "App Download", icon: <Download className="h-5 w-5 mr-2" /> },
  { id: "app_review", label: "App Review", icon: <Star className="h-5 w-5 mr-2" /> },
  { id: "five_star", label: "Five Star Rating", icon: <Star className="h-5 w-5 mr-2" /> },
  { id: "app_usage_time", label: "App Usage Time", icon: <Clock className="h-5 w-5 mr-2" /> },
  { id: "app_developer", label: "App Developer", icon: <Code className="h-5 w-5 mr-2" /> },
  { id: "web_developer", label: "Website Developer", icon: <Globe className="h-5 w-5 mr-2" /> },
];

export function AppTaskModal() {
  const { modals, closeModal } = useModal();
  const { toast } = useToast();
  const [selectedTaskType, setSelectedTaskType] = useState("app_download");
  const [customReward, setCustomReward] = useState("");
  const [customVerification, setCustomVerification] = useState("");

  // Basic form fields common to all app task types
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    appLink: "",
    platform: "",
    instructions: "",
    reward: "",
    deadline: "",
    maxParticipants: "",
    verificationMethod: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTaskTypeChange = (value: string) => {
    setSelectedTaskType(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would validate and process the form data
    // For now, just show a success toast
    toast({
      title: "Task Created",
      description: `Your ${selectedTaskType} task has been created successfully.`,
    });
    
    closeModal("appTask");
  };
  
  // Return null if the modal is not open
  if (!modals.appTask?.isOpen) return null;
  
  // Specific fields for each task type
  const TaskTypeFields = () => {
    switch (selectedTaskType) {
      case "app_download":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="appStoreLink">App Store Link</Label>
              <Input 
                id="appStoreLink"
                name="appStoreLink"
                placeholder="https://play.google.com/store/apps/..."
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationMethod">Verification Method</Label>
              <Select onValueChange={(value) => handleSelectChange("verificationMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screenshot">Screenshot of installed app</SelectItem>
                  <SelectItem value="accountCreation">Account creation</SelectItem>
                  <SelectItem value="appOpenScreenshot">App open screenshot</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.verificationMethod === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customVerification">Custom Verification</Label>
                <Textarea 
                  id="customVerification"
                  placeholder="Describe how workers should verify completion..."
                  value={customVerification}
                  onChange={(e) => setCustomVerification(e.target.value)}
                />
              </div>
            )}
          </>
        );
        
      case "app_review":
      case "five_star":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="appStoreLink">App Store Link</Label>
              <Input 
                id="appStoreLink"
                name="appStoreLink"
                placeholder="https://play.google.com/store/apps/..."
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewGuidelines">Review Guidelines</Label>
              <Textarea 
                id="reviewGuidelines"
                name="reviewGuidelines"
                placeholder="What should the review mention? Any specific points?"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationMethod">Verification Method</Label>
              <Select onValueChange={(value) => handleSelectChange("verificationMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screenshot">Screenshot of review</SelectItem>
                  <SelectItem value="reviewText">Copy-paste review text</SelectItem>
                  <SelectItem value="profileLink">Profile link</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.verificationMethod === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customVerification">Custom Verification</Label>
                <Textarea 
                  id="customVerification"
                  placeholder="Describe how workers should verify completion..."
                  value={customVerification}
                  onChange={(e) => setCustomVerification(e.target.value)}
                />
              </div>
            )}
          </>
        );
        
      case "app_usage_time":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="appStoreLink">App Store Link</Label>
              <Input 
                id="appStoreLink"
                name="appStoreLink"
                placeholder="https://play.google.com/store/apps/..."
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageTime">Usage Time (minutes)</Label>
              <Input 
                id="usageTime"
                name="usageTime"
                type="number"
                placeholder="15"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityRequirements">Activity Requirements</Label>
              <Textarea 
                id="activityRequirements"
                name="activityRequirements"
                placeholder="What specific actions should users take in the app?"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationMethod">Verification Method</Label>
              <Select onValueChange={(value) => handleSelectChange("verificationMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screenshots">Before/after screenshots</SelectItem>
                  <SelectItem value="screenRecord">Screen recording</SelectItem>
                  <SelectItem value="appMetrics">App usage metrics</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.verificationMethod === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customVerification">Custom Verification</Label>
                <Textarea 
                  id="customVerification"
                  placeholder="Describe how workers should verify completion..."
                  value={customVerification}
                  onChange={(e) => setCustomVerification(e.target.value)}
                />
              </div>
            )}
          </>
        );
        
      case "app_developer":
      case "web_developer":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="projectRequirements">Project Requirements</Label>
              <Textarea 
                id="projectRequirements"
                name="projectRequirements"
                placeholder="Describe the development project in detail..."
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalStack">Technical Stack</Label>
              <Input 
                id="technicalStack"
                name="technicalStack"
                placeholder="React Native, Firebase, etc."
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (days)</Label>
              <Input 
                id="deadline"
                name="deadline"
                type="number"
                placeholder="7"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestones">Project Milestones</Label>
              <Textarea 
                id="milestones"
                name="milestones"
                placeholder="List the key deliverables and timeline..."
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationMethod">Verification Method</Label>
              <Select onValueChange={(value) => handleSelectChange("verificationMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="codeReview">Code repository review</SelectItem>
                  <SelectItem value="demoVersion">Working demo version</SelectItem>
                  <SelectItem value="milestoneDeliverables">Milestone deliverables</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.verificationMethod === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customVerification">Custom Verification</Label>
                <Textarea 
                  id="customVerification"
                  placeholder="Describe how workers should verify completion..."
                  value={customVerification}
                  onChange={(e) => setCustomVerification(e.target.value)}
                />
              </div>
            )}
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={modals.appTask?.isOpen} onOpenChange={() => closeModal("appTask")}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create App Task</DialogTitle>
          <DialogDescription>
            Create a new task for app-related work. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs defaultValue="app_download" onValueChange={handleTaskTypeChange}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="app_download">App Download</TabsTrigger>
              <TabsTrigger value="app_review">App Review</TabsTrigger>
              <TabsTrigger value="developer">Developer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="app_download" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTaskType("app_download")}>
                  <Download className="h-5 w-5 mr-2 text-blue-500" />
                  <span>App Download</span>
                </div>
                <div className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTaskType("app_usage_time")}>
                  <Clock className="h-5 w-5 mr-2 text-purple-500" />
                  <span>App Usage Time</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="app_review" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTaskType("app_review")}>
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  <span>App Review</span>
                </div>
                <div className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTaskType("five_star")}>
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  <span>Five Star Rating</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="developer" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTaskType("app_developer")}>
                  <Code className="h-5 w-5 mr-2 text-green-500" />
                  <span>App Developer</span>
                </div>
                <div className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedTaskType("web_developer")}>
                  <Globe className="h-5 w-5 mr-2 text-indigo-500" />
                  <span>Website Developer</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title"
                name="title"
                placeholder="Enter a clear title for your task"
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Describe what workers need to do in detail"
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select onValueChange={(value) => handleSelectChange("platform", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="both">Both Android & iOS</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Task type specific fields */}
            <TaskTypeFields />
            
            <div className="space-y-2">
              <Label htmlFor="customReward">Your Reward (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input 
                  id="customReward"
                  className="pl-7"
                  placeholder="0.00"
                  value={customReward}
                  onChange={(e) => setCustomReward(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Set your own price for this task</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Input 
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                placeholder="10"
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => closeModal("appTask")}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}