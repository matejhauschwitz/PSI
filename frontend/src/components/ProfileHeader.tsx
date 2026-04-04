import type { User } from '../types'

interface ProfileHeaderProps {
  user: User
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
          {user.name?.[0]?.toUpperCase() || user.userName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-stone-900">{user.name || 'Uživatel'}</h1>
          <p className="text-stone-500 text-sm font-medium">@{user.userName}</p>
          {user.email && <p className="text-stone-500 text-sm">{user.email}</p>}
        </div>
      </div>
    </div>
  )
}
