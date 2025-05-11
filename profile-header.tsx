import { User } from "@shared/schema";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="bg-primary dark:bg-primary-800 p-4">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-white">
          {user.profileImage ? (
            <img src={user.profileImage} alt={`${user.username || 'User'}'s profile`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-200 dark:bg-primary-900 flex items-center justify-center text-primary text-xl font-bold">
              {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div className="text-white">
          <h2 className="text-xl font-semibold">{user?.username || 'User'}</h2>
          <p className="text-sm text-primary-100">{user?.email || 'No email'}</p>
          <div className="flex items-center mt-1">
            {user?.country && (
              <span className="bg-primary-800 text-primary-100 text-xs px-2 py-0.5 rounded">
                <i className="fas fa-map-marker-alt mr-1"></i> {user.country}
              </span>
            )}
            {user?.isTopWorker && (
              <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                <i className="fas fa-award mr-1"></i> Top Worker
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
