import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useModal } from "@/hooks/use-modal";
import { useWithdrawal } from "@/hooks/use-withdrawal";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWithdrawalRequestSchema, InsertWithdrawalRequest, PaymentMethod } from "@shared/schema";

export function WithdrawalForm() {
  const { user } = useAuth();
  const { modals, closeModal } = useModal();
  const { submitWithdrawal, isSubmitting } = useWithdrawal();
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.PAYONEER);
  
  const isOpen = modals.withdrawal.isOpen;
  const userBalance = user?.balance ? Number(user.balance) : 0;
  
  const form = useForm<InsertWithdrawalRequest>({
    resolver: zodResolver(insertWithdrawalRequestSchema),
    defaultValues: {
      userId: user?.id,
      amount: 10,
      paymentMethod: PaymentMethod.PAYONEER,
      paymentDetails: {},
      notes: "",
    },
  });
  
  const onSubmit = (data: InsertWithdrawalRequest) => {
    if (!user) return;
    
    const formattedData = {
      ...data,
      userId: user.id,
      paymentDetails: {
        [paymentMethod]: form.watch(`paymentDetails.${paymentMethod}`),
      },
    };
    
    submitWithdrawal(formattedData, {
      onSuccess: () => {
        closeModal("withdrawal");
        form.reset();
      },
    });
  };
  
  const renderPaymentMethodFields = () => {
    switch (paymentMethod) {
      case PaymentMethod.PAYONEER:
        return (
          <div>
            <Label htmlFor="payoneerEmail">Payoneer Email</Label>
            <Input
              id="payoneerEmail"
              type="email"
              placeholder="your.email@example.com"
              {...form.register(`paymentDetails.${PaymentMethod.PAYONEER}`)}
            />
          </div>
        );
      
      case PaymentMethod.WISE:
        return (
          <div>
            <Label htmlFor="wiseEmail">Wise Email</Label>
            <Input
              id="wiseEmail"
              type="email"
              placeholder="your.email@example.com"
              {...form.register(`paymentDetails.${PaymentMethod.WISE}`)}
            />
          </div>
        );
      
      case PaymentMethod.BANK:
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Your bank name"
                {...form.register(`paymentDetails.bankName`)}
              />
            </div>
            
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Your account number"
                {...form.register(`paymentDetails.accountNumber`)}
              />
            </div>
            
            <div>
              <Label htmlFor="swiftCode">SWIFT Code</Label>
              <Input
                id="swiftCode"
                placeholder="Bank SWIFT code"
                {...form.register(`paymentDetails.swiftCode`)}
              />
            </div>
          </div>
        );
      
      case PaymentMethod.CRYPTO:
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="cryptoType">Cryptocurrency</Label>
              <Select
                onValueChange={(value) => form.setValue(`paymentDetails.cryptoType`, value)}
                defaultValue="btc"
              >
                <SelectTrigger id="cryptoType">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="usdt">Tether (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="Your wallet address"
                {...form.register(`paymentDetails.walletAddress`)}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <Label htmlFor="paymentEmail">Email for Payment</Label>
            <Input
              id="paymentEmail"
              type="email"
              placeholder="your.email@example.com"
              {...form.register(`paymentDetails.email`)}
            />
          </div>
        );
    }
  };
  
  if (!user) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => closeModal("withdrawal")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdrawal Request</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="bg-primary-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">Available Balance:</span>
                <span className="text-lg font-semibold text-primary dark:text-primary">${userBalance.toFixed(2)}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="withdrawAmount">Withdrawal Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                </div>
                <Input
                  id="withdrawAmount"
                  type="number"
                  className="pl-7 pr-12"
                  placeholder="0.00"
                  min={10}
                  max={userBalance}
                  step="0.01"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">USD</span>
                </div>
              </div>
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.amount.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum withdrawal: $10.00</p>
            </div>
            
            <div>
              <Label htmlFor="withdrawMethod">Payment Method</Label>
              <Select
                onValueChange={(value) => {
                  setPaymentMethod(value);
                  form.setValue("paymentMethod", value as any);
                }}
                defaultValue={PaymentMethod.PAYONEER}
              >
                <SelectTrigger id="withdrawMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.PAYONEER}>Payoneer</SelectItem>
                  <SelectItem value={PaymentMethod.WISE}>Wise (TransferWise)</SelectItem>
                  <SelectItem value={PaymentMethod.SKRILL}>Skrill</SelectItem>
                  <SelectItem value={PaymentMethod.NETELLER}>Neteller</SelectItem>
                  <SelectItem value={PaymentMethod.WESTERN_UNION}>Western Union</SelectItem>
                  <SelectItem value={PaymentMethod.MONEYGRAM}>MoneyGram</SelectItem>
                  <SelectItem value={PaymentMethod.XOOM}>Xoom</SelectItem>
                  <SelectItem value={PaymentMethod.BANK}>Bank Transfer (SWIFT)</SelectItem>
                  <SelectItem value={PaymentMethod.CRYPTO}>Cryptocurrency (BTC/USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div id="paymentDetails" className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              {renderPaymentMethodFields()}
            </div>
            
            <div>
              <Label htmlFor="withdrawNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="withdrawNotes"
                rows={2}
                placeholder="Any specific information about your withdrawal request"
                {...form.register("notes")}
              />
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Withdrawal requests are typically processed within 24 hours.
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || userBalance < 10}
            >
              {isSubmitting ? "Processing..." : "Submit Withdrawal Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
