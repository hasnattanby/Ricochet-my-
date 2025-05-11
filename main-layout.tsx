import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { TaskProofModal } from "@/components/tasks/task-proof-modal";
import { MessageModal } from "@/components/messenger/message-modal";
import { WithdrawalForm } from "@/components/withdrawal/withdrawal-form";
import { TabType } from "@/types";

interface MainLayoutProps {
  children: ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function MainLayout({ children, activeTab, setActiveTab }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Modals */}
      <TaskDetailModal />
      <TaskProofModal />
      <MessageModal />
      <WithdrawalForm />
    </div>
  );
}
