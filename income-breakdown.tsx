import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface IncomeBreakdownProps {
  userId: number;
}

interface IncomeData {
  pendingBalance: number;
  availableBalance: number;
  incomeByTaskType: {
    type: string;
    amount: number;
  }[];
}

export function IncomeBreakdown({ userId }: IncomeBreakdownProps) {
  const { data: incomeData, isLoading } = useQuery<IncomeData>({
    queryKey: [`/api/users/${userId}/income-breakdown`],
    enabled: !!userId,
  });
  
  // Mock data if API is not implemented yet
  const getMockIncomeData = (): IncomeData => {
    return {
      pendingBalance: 15.75,
      availableBalance: 38.25,
      incomeByTaskType: [
        { type: "subscribe", amount: 24.50 },
        { type: "like", amount: 18.75 },
        { type: "watch", amount: 10.75 },
      ]
    };
  };
  
  const data = incomeData || getMockIncomeData();
  
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case "subscribe": return "Subscribe/Follow";
      case "like": return "Like/Comment";
      case "watch": return "Video Watching";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const balanceData = [
    { name: "Available", value: data.availableBalance },
    { name: "Pending", value: data.pendingBalance },
  ];
  
  const taskTypeData = data.incomeByTaskType.map(item => ({
    name: getTaskTypeLabel(item.type),
    value: item.amount
  }));
  
  const BALANCE_COLORS = ["#10b981", "#f59e0b"];
  const TASK_TYPE_COLORS = ["#3b82f6", "#ec4899", "#8b5cf6"];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded p-2 shadow-sm">
          <p className="text-sm font-medium">{`${payload[0].name}: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Income Breakdown</CardTitle>
        <CardDescription>Your earnings distribution by status and task type</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Balance Distribution</h3>
              <div className="flex items-center">
                <div className="h-[140px] w-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={balanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={55}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {balanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BALANCE_COLORS[index % BALANCE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="ml-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2" />
                      <span className="text-sm">Available: ${data.availableBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2" />
                      <span className="text-sm">Pending: ${data.pendingBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center mt-1 pt-1 border-t border-border">
                      <span className="text-sm font-medium">Total: ${(data.availableBalance + data.pendingBalance).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Income by Task Type</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TASK_TYPE_COLORS[index % TASK_TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}