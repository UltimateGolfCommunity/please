export interface Badge {
  id: string
  name: string
  description: string
  icon_name: string
  category: 'early_adopter' | 'achievement' | 'milestone' | 'special'
  criteria: string | null
  points: number
  rarity: string
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  earned_reason: string | null
  badge?: Badge
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: string
  achievement_value: number
  last_updated: string
}

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  email: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  handicap: number | null
  home_course: string | null
  location: string | null
  total_points: number
  member_since: string
  created_at: string
  updated_at: string
  badges?: UserBadge[]
  achievements?: UserAchievement[]
  // Extended properties added by AuthContext
  connections_count?: number
  tee_times_count?: number
  groups_count?: number
  tee_times?: TeeTime[]
  groups?: any[]
  group_messages?: any[]
  current_group?: GolfGroup | null
  group_activity?: any[]
}

export interface TeeTime {
  id: string
  course_id: string | null
  user_id: string
  date: string
  time: string
  players: number
  status: string
  created_at: string
  updated_at: string
}

export interface GolfCourse {
  id: string
  name: string
  location: string | null
  description: string | null
  par: number | null
  holes: number
  created_at: string
  updated_at: string
}

export interface GolfGroup {
  id: string
  name: string
  description: string | null
  owner_id: string
  max_members: number
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export interface TeeTimeApplication {
  id: string
  tee_time_id: string
  applicant_id: string
  status: 'pending' | 'approved' | 'denied' | 'withdrawn'
  message: string | null
  applied_at: string
  updated_at: string
}

export interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  message: string
  created_at: string
}

export interface UserConnection {
  id: string
  requester_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'tee_time_application' | 'group_invite' | 'connection_request' | 'tee_time_reminder' | 'group_message'
  title: string
  message: string
  related_id: string | null
  is_read: boolean
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      tee_times: {
        Row: TeeTime
        Insert: Omit<TeeTime, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TeeTime, 'id' | 'created_at' | 'updated_at'>>
      }
      golf_courses: {
        Row: GolfCourse
        Insert: Omit<GolfCourse, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GolfCourse, 'id' | 'created_at' | 'updated_at'>>
      }
      golf_groups: {
        Row: GolfGroup
        Insert: Omit<GolfGroup, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GolfGroup, 'id' | 'created_at' | 'updated_at'>>
      }
      group_members: {
        Row: GroupMember
        Insert: Omit<GroupMember, 'id' | 'joined_at'>
        Update: Partial<Omit<GroupMember, 'id' | 'joined_at'>>
      }
      tee_time_applications: {
        Row: TeeTimeApplication
        Insert: Omit<TeeTimeApplication, 'id' | 'applied_at' | 'updated_at'>
        Update: Partial<Omit<TeeTimeApplication, 'id' | 'applied_at' | 'updated_at'>>
      }
      group_messages: {
        Row: GroupMessage
        Insert: Omit<GroupMessage, 'id' | 'created_at'>
        Update: Partial<Omit<GroupMessage, 'id' | 'created_at'>>
      }
      user_connections: {
        Row: UserConnection
        Insert: Omit<UserConnection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserConnection, 'id' | 'created_at' | 'updated_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
    }
  }
}
