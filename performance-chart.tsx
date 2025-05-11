import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthlyPerformance {
  month: string;
  count: number;
}

interface PerformanceChartProps {
  userId: number;
}

export function PerformanceChart({ userId }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<string>("last6Months");
  
  const { data: performance, isLoading } = useQuery<MonthlyPerformance[]>({
    queryKey: [`/api/users/${userId}/performance`, timeRange],
    enabled: !!userId,
  });
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "last3Months": return "Last 3 Months";
      case "last6Months": return "Last 6 Months";
      case "thisYear": return "This Year";
      case "allTime": return "All Time";
      default: return "Last 6 Months";
    }
  };
  
  // Mock data if API is not implemented yet
  const getMockData = (range: string): MonthlyPerformance[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentMonth = now.getMonth();
    
    let monthsToShow: number;
    switch (range) {
      case "last3Months": monthsToShow = 3; break;
      case "last6Months": monthsToShow = 6; break;
      case "thisYear": monthsToShow = currentMonth + 1; break;
      case "allTime": monthsToShow = 12; break;
      default: monthsToShow = 6;
    }
    
    return Array.from({ length: monthsToShow }, (_, i) => {
      const monthIndex = (currentMonth - (monthsToShow - 1) + i + 12) % 12;
      return {
        month: months[monthIndex],
        count: Math.floor(Math.random() * 15) + 1, // Random tasks between 1-15
      };
    });
  };
  
  // We'll use mock data until the API is implemented
  const chartData = performance || getMockData(timeRange);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded p-2 shadow-sm">
          <p className="text-sm font-medium">{`${label} : ${payload[0].value} tasks`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Performance</CardTitle>
            <CardDescription>Tasks completed over time</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="last6Months">Last 6 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                <YAxis className="text-xs text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}