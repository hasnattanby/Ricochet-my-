import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrophyIcon, Medal, Award, Star } from "lucide-react";

interface RankingProps {
  userId: number;
}

interface RankingData {
  rank: number;
  totalTasks: number;
  badges: {
    name: string;
    description: string;
    icon: string;
    earned: boolean;
  }[];
  monthlyRanking?: {
    position: number;
    category: string;
  };
}

export function RankingBadge({ userId }: RankingProps) {
  const { data: ranking, isLoading } = useQuery<RankingData>({
    queryKey: [`/api/users/${userId}/rankings`],
    enabled: !!userId,
  });
  
  // Mock data if API is not implemented yet
  const getMockRankingData = (): RankingData => {
    return {
      rank: 42,
      totalTasks: 78,
      badges: [
        {
          name: "Starter",
          description: "Completed your first 10 tasks",
          icon: "star",
          earned: true,
        },
        {
          name: "Consistent",
          description: "Completed tasks for 5 consecutive days",
          icon: "medal",
          earned: true,
        },
        {
          name: "Expert",
          description: "Completed 50+ tasks",
          icon: "award",
          earned: true,
        },
        {
          name: "Master",
          description: "Reached top 10 in monthly rankings",
          icon: "trophy",
          earned: false,
        },
      ],
      monthlyRanking: {
        position: 3,
        category: "YouTube Engagement",
      },
    };
  };
  
  const rankingData = ranking || getMockRankingData();
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "trophy": return <TrophyIcon className="h-5 w-5" />;
      case "medal": return <Medal className="h-5 w-5" />;
      case "award": return <Award className="h-5 w-5" />;
      case "star": 
      default: return <Star className="h-5 w-5" />;
    }
  };
  
  const getBadgeColorClass = (earned: boolean, index: number) => {
    if (!earned) return "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    
    const colors = [
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
    ];
    
    return colors[index % colors.length];
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Rankings & Badges</CardTitle>
        <CardDescription>Your performance rankings and earned badges</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {rankingData.monthlyRanking && (
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 flex items-center space-x-3">
                <div className="bg-primary dark:bg-primary p-2 rounded-full text-white">
                  <TrophyIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">
                    #{rankingData.monthlyRanking.position} in {rankingData.monthlyRanking.category}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This month's high performer
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium mb-2">Earned Badges</h3>
              <div className="grid grid-cols-2 gap-2">
                {rankingData.badges.map((badge, index) => (
                  <div 
                    key={badge.name}
                    className={`border rounded-lg p-3 flex items-start space-x-2 ${
                      badge.earned 
                        ? 'border-primary/20 dark:border-primary/30' 
                        : 'border-gray-200 dark:border-gray-700 opacity-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${getBadgeColorClass(badge.earned, index)}`}>
                      {getIconComponent(badge.icon)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">{badge.name}</h4>
                        {!badge.earned && (
                          <Badge variant="outline" className="ml-2 text-xs py-0">Locked</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}