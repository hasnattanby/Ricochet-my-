import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container } from "@/components/ui/container";
import { useOrder } from "@/hooks/use-order";
import { UserPlus, ThumbsUp, PlayCircle, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PaymentMethod } from "@shared/schema";

const orderTypeDetails = {
  subscribe: {
    title: "Subscribe/Follow",
    description: "Get subscribers or followers for your channel or page",
    price: 5,
    icon: <UserPlus className="h-5 w-5" />,
  },
  like: {
    title: "Like/Comment/Share",
    description: "Get engagement on your posts or content",
    price: 5,
    icon: <ThumbsUp className="h-5 w-5" />,
  },
  watch: {
    title: "Watch Video",
    description: "Get views for your videos",
    price: 15,
    icon: <PlayCircle className="h-5 w-5" />,
  },
  join: {
    title: "Join",
    description: "Get people to join your channel, group or membership",
    price: 5,
    icon: <UserPlus className="h-5 w-5" />,
  },
  signup: {
    title: "Sign Up",
    description: "Get sign ups for your service, app or website",
    price: 5,
    icon: <UserPlus className="h-5 w-5" />,
  },
};

const orderSchema = z.object({
  type: z.enum(["subscribe", "like", "watch", "join", "signup"]),
  url: z.string().url("Please enter a valid URL"),
  quantity: z.number().min(100, "Minimum quantity is 100").max(10000, "Maximum quantity is 10,000"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  platform: z.string().min(1, "Platform is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type OrderFormData = z.infer<typeof orderSchema>;

export function CreateOrderForm() {
  const { createOrder, processPayment, isCreatingOrder, isProcessingPayment } = useOrder();
  const [orderType, setOrderType] = useState<"subscribe" | "like" | "watch" | "join" | "signup">("subscribe");
  const [createdTaskId, setCreatedTaskId] = useState<number | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      type: orderType,
      quantity: 100,
      url: "",
      title: "",
      description: "",
      platform: "",
      paymentMethod: "payoneer",
    },
  });
  
  const quantity = watch("quantity");
  const currentPrice = orderTypeDetails[orderType].price * (quantity / 100);
  
  const onOrderTypeChange = (type: "subscribe" | "like" | "watch" | "join" | "signup") => {
    setOrderType(type);
    setValue("type", type);
  };
  
  const onSubmit = (data: OrderFormData) => {
    const orderData = {
      ...data,
      pricePerTask: orderTypeDetails[data.type].price / 100,
      totalPrice: orderTypeDetails[data.type].price * (data.quantity / 100),
    };
    
    createOrder(orderData, {
      onSuccess: (task) => {
        setCreatedTaskId(task.id);
        // Process payment
        processPayment({
          taskId: task.id,
          paymentMethod: data.paymentMethod,
          amount: orderData.totalPrice,
        });
      },
    });
  };

  return (
    <Container className="pb-20">
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Order Type Selection */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Select order type:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div 
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${
                    orderType === "subscribe" ? "bg-primary-50 dark:bg-gray-900" : "hover:bg-primary-50 dark:hover:bg-gray-900"
                  } cursor-pointer relative`}
                  onClick={() => onOrderTypeChange("subscribe")}
                >
                  {orderType === "subscribe" && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary dark:text-primary">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <p className="ml-2 font-medium">Subscribe/Follow</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get subscribers or followers for your channel or page</p>
                  <p className="text-xs font-medium text-primary dark:text-primary mt-2">$5 per 100</p>
                </div>
                
                <div 
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${
                    orderType === "like" ? "bg-primary-50 dark:bg-gray-900" : "hover:bg-primary-50 dark:hover:bg-gray-900"
                  } cursor-pointer relative`}
                  onClick={() => onOrderTypeChange("like")}
                >
                  {orderType === "like" && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary dark:text-primary">
                      <ThumbsUp className="h-4 w-4" />
                    </div>
                    <p className="ml-2 font-medium">Like/Comment/Share</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get engagement on your posts or content</p>
                  <p className="text-xs font-medium text-primary dark:text-primary mt-2">$5 per 100</p>
                </div>
                
                <div 
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${
                    orderType === "watch" ? "bg-primary-50 dark:bg-gray-900" : "hover:bg-primary-50 dark:hover:bg-gray-900"
                  } cursor-pointer relative`}
                  onClick={() => onOrderTypeChange("watch")}
                >
                  {orderType === "watch" && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary dark:text-primary">
                      <PlayCircle className="h-4 w-4" />
                    </div>
                    <p className="ml-2 font-medium">Watch Video</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get views for your videos</p>
                  <p className="text-xs font-medium text-primary dark:text-primary mt-2">$15 per 100</p>
                </div>

                <div 
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${
                    orderType === "join" ? "bg-primary-50 dark:bg-gray-900" : "hover:bg-primary-50 dark:hover:bg-gray-900"
                  } cursor-pointer relative`}
                  onClick={() => onOrderTypeChange("join")}
                >
                  {orderType === "join" && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary dark:text-primary">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <p className="ml-2 font-medium">Join</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get people to join your channel, group or membership</p>
                  <p className="text-xs font-medium text-primary dark:text-primary mt-2">$5 per 100</p>
                </div>
                
                <div 
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${
                    orderType === "signup" ? "bg-primary-50 dark:bg-gray-900" : "hover:bg-primary-50 dark:hover:bg-gray-900"
                  } cursor-pointer relative`}
                  onClick={() => onOrderTypeChange("signup")}
                >
                  {orderType === "signup" && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary dark:text-primary">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <p className="ml-2 font-medium">Sign Up</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get sign ups for your service, app or website</p>
                  <p className="text-xs font-medium text-primary dark:text-primary mt-2">$5 per 100</p>
                </div>
              </div>
            </div>
            
            {/* Order Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={`${
                    orderType === "subscribe" ? "Your channel or page name" : 
                    orderType === "like" ? "Your post title" : 
                    orderType === "watch" ? "Your video title" : 
                    orderType === "join" ? "Your channel/membership name" : 
                    "Your website/app name"
                  }`}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="platform">Platform</Label>
                <div className="space-y-2">
                  <Select
                    onValueChange={(value) => {
                      if (value === "custom") {
                        // Don't set value for custom - it will be manually entered
                        setValue("platform", "");
                      } else {
                        setValue("platform", value);
                      }
                    }}
                    defaultValue="youtube"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="custom">Other platform (type below)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    id="customPlatform"
                    placeholder="Enter platform name (if not in the list above)"
                    {...register("platform")}
                  />
                </div>
                {errors.platform && (
                  <p className="text-sm text-red-500 mt-1">{errors.platform.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your content"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder={`https://${watch("platform") || "example"}.com/your-${
                    orderType === "subscribe" ? "channel" : 
                    orderType === "like" ? "post" : 
                    orderType === "watch" ? "video" : 
                    orderType === "join" ? "membership-page" : 
                    "signup-page"
                  }`}
                  {...register("url")}
                />
                {errors.url && (
                  <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex">
                  <Input
                    id="quantity"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    defaultValue="100"
                    {...register("quantity", { valueAsNumber: true })}
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-r-md bg-gray-50 text-gray-500 dark:text-gray-400 text-sm">
                    {orderType === "subscribe" ? "subscribers" : 
                     orderType === "like" ? "engagements" : 
                     orderType === "watch" ? "views" : 
                     orderType === "join" ? "joins" : 
                     "sign ups"}
                  </span>
                </div>
                {errors.quantity && (
                  <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum: 100, Maximum: 10,000</p>
              </div>
              
              <div>
                <Label htmlFor="cost">Cost</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <Input
                    id="cost"
                    value={currentPrice.toFixed(2)}
                    readOnly
                    className="pl-7 pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">USD</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select
                  onValueChange={(value) => setValue("paymentMethod", value)}
                  defaultValue="payoneer"
                >
                  <SelectTrigger id="payment">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payoneer">Payoneer</SelectItem>
                    <SelectItem value="wise">Wise (TransferWise)</SelectItem>
                    <SelectItem value="skrill">Skrill</SelectItem>
                    <SelectItem value="neteller">Neteller</SelectItem>
                    <SelectItem value="western_union">Western Union</SelectItem>
                    <SelectItem value="moneygram">MoneyGram</SelectItem>
                    <SelectItem value="xoom">Xoom</SelectItem>
                    <SelectItem value="bank">Bank Transfer (SWIFT)</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency (BTC/USDT)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500 mt-1">{errors.paymentMethod.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isCreatingOrder || isProcessingPayment}
              >
                {isCreatingOrder || isProcessingPayment ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
