import { UserWithStats } from "@/types";

interface StatsOverviewProps {
  user: UserWithStats;
}

export function StatsOverview({ user }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Earnings</p>
        <p className="text-xl font-semibold text-primary dark:text-primary">
          ${user.balance ? Number(user.balance).toFixed(2) : "0.00"}
        </p>
      </div>
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Done</p>
        <p className="text-xl font-semibold text-primary dark:text-primary">
          {user.totalTasks || 0}
        </p>
      </div>
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Rank</p>
        <p className="text-xl font-semibold text-primary dark:text-primary">
          {user.rank ? `#${user.rank}` : "N/A"}
        </p>
      </div>
    </div>
  );
}
