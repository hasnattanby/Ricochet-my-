import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal";
import { useWithdrawal } from "@/hooks/use-withdrawal";
import { insertWithdrawalRequestSchema, InsertWithdrawalRequest } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { CreditCard, DollarSign, HelpCircle, Upload, Info } from "lucide-react";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  attachmentUrl: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const paymentMethods = [
  { id: "payoneer", label: "Payoneer" },
  { id: "wise", label: "Wise (TransferWise)" },
  { id: "skrill", label: "Skrill" },
  { id: "neteller", label: "Neteller" },
  { id: "westernunion", label: "Western Union" },
  { id: "moneygram", label: "MoneyGram" },
  { id: "xoom", label: "Xoom" },
  { id: "banktransfer", label: "Bank Transfer" },
  { id: "crypto", label: "Cryptocurrency" },
];

export function WithdrawalModal() {
  const { modals, closeModal } = useModal();
  const { submitWithdrawal, isSubmitting } = useWithdrawal();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("withdrawal");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const isOpen = modals.withdrawal.isOpen;
  
  // Withdrawal form
  const withdrawalForm = useForm<InsertWithdrawalRequest>({
    resolver: zodResolver(insertWithdrawalRequestSchema),
    defaultValues: {
      userId: user?.id,
      amount: "",
      paymentMethod: "",
      paymentDetails: {},
    },
  });
  
  // Complaint form
  const complaintForm = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: "",
      description: "",
      attachmentUrl: "",
    },
  });
  
  const onWithdrawalSubmit = (data: any) => {
    if (!user) return;
    
    // Make sure userId is included
    const withdrawalData = {
      ...data,
      userId: user.id,
    };
    
    submitWithdrawal(withdrawalData, {
      onSuccess: () => {
        closeModal("withdrawal");
        withdrawalForm.reset();
      },
    });
  };
  
  const onComplaintSubmit = (data: ComplaintFormData) => {
    // Here you would implement the submission logic for complaints
    // For now, we'll just show a toast and close the modal
    toast({
      title: "Complaint submitted",
      description: "Your complaint has been recorded. Our team will review it shortly.",
    });
    
    closeModal("withdrawal");
    complaintForm.reset();
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would normally upload the file to a storage service
      // For this demo, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      complaintForm.setValue("attachmentUrl", file.name); // In a real app, this would be the URL
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal("withdrawal")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle>Support Center</DialogTitle>
            <DialogClose />
          </div>
          <DialogDescription>
            Request a withdrawal or submit a complaint
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="withdrawal" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
            <TabsTrigger value="complaint">Complaint</TabsTrigger>
          </TabsList>
          
          <TabsContent value="withdrawal" className="space-y-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You can withdraw your earnings once you've reached the minimum amount of $5.00.
                    Withdrawals are processed within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      className="pl-10"
                      placeholder="Enter amount to withdraw"
                      {...withdrawalForm.register("amount")}
                    />
                  </div>
                  {withdrawalForm.formState.errors.amount && (
                    <p className="text-sm text-red-500 mt-1">{withdrawalForm.formState.errors.amount.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    onValueChange={(value) => withdrawalForm.setValue("paymentMethod", value)}
                    defaultValue={withdrawalForm.getValues("paymentMethod")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {withdrawalForm.formState.errors.paymentMethod && (
                    <p className="text-sm text-red-500 mt-1">{withdrawalForm.formState.errors.paymentMethod.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="paymentDetails">Account Details</Label>
                  <Textarea
                    id="paymentDetails"
                    placeholder="Enter your payment account details"
                    className="min-h-[100px]"
                    onChange={(e) => {
                      withdrawalForm.setValue("paymentDetails", { details: e.target.value });
                    }}
                  />
                  {withdrawalForm.formState.errors.paymentDetails && (
                    <p className="text-sm text-red-500 mt-1">{String(withdrawalForm.formState.errors.paymentDetails.message)}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Please provide all necessary details for your chosen payment method.
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  variant="default"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Submit Withdrawal Request"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="complaint" className="space-y-4 mt-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Having an issue with a task or payment? Submit a complaint and our support team will assist you as soon as possible.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={complaintForm.handleSubmit(onComplaintSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Complaint Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your issue"
                    {...complaintForm.register("title")}
                  />
                  {complaintForm.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">{complaintForm.formState.errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe your issue in detail"
                    className="min-h-[120px]"
                    {...complaintForm.register("description")}
                  />
                  {complaintForm.formState.errors.description && (
                    <p className="text-sm text-red-500 mt-1">{complaintForm.formState.errors.description.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="attachment">Attachment (Optional)</Label>
                  <div className="mt-1">
                    <label 
                      htmlFor="imageUpload"
                      className="cursor-pointer flex items-center justify-center border-2 border-dashed rounded-md py-4 px-2 border-gray-300 dark:border-gray-600"
                    >
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-primary">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        id="imageUpload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    
                    {selectedImage && (
                      <div className="mt-3">
                        <img 
                          src={selectedImage}
                          alt="Uploaded file"
                          className="h-40 object-contain rounded-md mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  variant="default"
                >
                  Submit Complaint
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}