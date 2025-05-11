import { useState } from "react";
import { ProfileTabType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Transaction, TaskSubmission, WithdrawalRequest } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ProfileTabsProps {
  userId: number;
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabType>("history");
  
  const { data: history } = useQuery<TaskSubmission[]>({
    queryKey: [`/api/users/${userId}/submissions`],
    enabled: activeTab === "history",
  });
  
  const { data: earnings } = useQuery<Transaction[]>({
    queryKey: [`/api/users/${userId}/transactions?type=earning`],
    enabled: activeTab === "earnings",
  });
  
  const { data: withdrawals } = useQuery<WithdrawalRequest[]>({
    queryKey: [`/api/users/${userId}/withdrawals`],
    enabled: activeTab === "withdrawals",
  });
  
  const { data: rewards } = useQuery<Transaction[]>({
    queryKey: [`/api/users/${userId}/transactions?type=reward`],
    enabled: activeTab === "rewards",
  });
  
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy - HH:mm");
    } catch (err) {
      return "Invalid date";
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case "history":
        return (
          <div className="space-y-3">
            {history && history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Task #{item.taskId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.proof}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={item.status === "approved" ? "text-success-500 font-medium" : "text-warning-500 font-medium"}>
                      {item.status === "approved" ? "+$0.02" : "$0.02"}
                    </p>
                    <Badge 
                      variant={
                        item.status === "approved" 
                          ? "success" 
                          : item.status === "rejected" 
                          ? "destructive" 
                          : "warning"
                      }
                      className="mt-1"
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No task history found.</p>
            )}
          </div>
        );
        
      case "earnings":
        return (
          <div className="space-y-3">
            {earnings && earnings.length > 0 ? (
              earnings.map((item) => (
                <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-success-500 font-medium">+${Number(item.amount).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No earnings history found.</p>
            )}
          </div>
        );
        
      case "withdrawals":
        return (
          <div className="space-y-3">
            {withdrawals && withdrawals.length > 0 ? (
              withdrawals.map((item) => (
                <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Withdrawal Request #{item.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">via {item.paymentMethod}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary dark:text-primary font-medium">${Number(item.amount).toFixed(2)}</p>
                    <Badge 
                      variant={
                        item.status === "approved" 
                          ? "success" 
                          : item.status === "rejected" 
                          ? "destructive" 
                          : "warning"
                      }
                      className="mt-1"
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No withdrawal history found.</p>
            )}
          </div>
        );
        
      case "rewards":
        return (
          <div className="space-y-3">
            {rewards && rewards.length > 0 ? (
              rewards.map((item) => (
                <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-success-500 font-medium">+${Number(item.amount).toFixed(2)}</p>
                    <Badge variant="success" className="mt-1">Reward</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No rewards history found.</p>
            )}
          </div>
        );
    }
  };
  
  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button 
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "history" 
                ? "border-b-2 border-primary text-primary dark:text-primary" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "earnings" 
                ? "border-b-2 border-primary text-primary dark:text-primary" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("earnings")}
          >
            Earnings
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "withdrawals" 
                ? "border-b-2 border-primary text-primary dark:text-primary" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("withdrawals")}
          >
            Withdrawals
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === "rewards" 
                ? "border-b-2 border-primary text-primary dark:text-primary" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("rewards")}
          >
            Rewards
          </button>
        </nav>
      </div>
      
      <div className="p-4">
        {renderTabContent()}
      </div>
    </>
  );
}
