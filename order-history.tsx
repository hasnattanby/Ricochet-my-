import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface OrderHistoryProps {
  userId: number;
}

export function OrderHistory({ userId }: OrderHistoryProps) {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: orders, isLoading } = useQuery<Task[]>({
    queryKey: [`/api/users/${userId}/orders`, filter],
    enabled: !!userId,
  });
  
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (err) {
      return "Invalid date";
    }
  };
  
  // Filter orders based on the selected filter
  const filteredOrders = orders ? 
    filter === "all" ? orders : 
    filter === "active" ? orders.filter(order => order.status === "active") :
    filter === "completed" ? orders.filter(order => order.status === "completed") :
    orders.filter(order => order.status === "cancelled")
    : [];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Order History</CardTitle>
            <CardDescription>Your created tasks and their status</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-1">
            {filteredOrders.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Task</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-muted-foreground">Progress</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="bg-background">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="font-medium">{order.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <Badge variant="outline">{order.type}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="text-sm">
                            {order.completedCount}/{order.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No {filter === "all" ? "" : filter} orders found.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}