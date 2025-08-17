'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Flag, 
  Edit3, 
  Save, 
  X,
  Camera,
  Settings,
  ArrowLeft,
  Star,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'

interface ProfileFormData {
  first_name: string
  last_name: string
  username: string
  bio: string
  handicap: number | null
  home_course: string
  location: string
  experience_level: string
  preferred_playing_days: string[]
  preferred_playing_times: string[]
  golf_goals: string[]
}

export default function ProfilePage() {
  const { user, profile, updateProfile, loading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    handicap: null,
    home_course: '',
    location: '',
    experience_level: '',
    preferred_playing_days: [],
    preferred_playing_times: [],
    golf_goals: []
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        handicap: profile.handicap,
        home_course: profile.home_course || '',
        location: profile.location || '',
        experience_level: '',
        preferred_playing_days: [],
        preferred_playing_times: [],
        golf_goals: []
      })
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        bio: formData.bio,
        handicap: formData.handicap,
        home_course: formData.home_course,
        location: formData.location
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        handicap: profile.handicap,
        home_course: profile.home_course || '',
        location: profile.location || '',
        experience_level: '',
        preferred_playing_days: [],
        preferred_playing_times: [],
        golf_goals: []
      })
    }
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors duration-300 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="relative">
                <div className="h-8 w-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-black font-bold text-sm">GC</span>
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Ultimate Golf Community
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-all duration-300"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="h-24 w-24 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-black" />
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors duration-300">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold text-white">
                  {profile?.first_name && profile?.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : user.email?.split('@')[0] || 'Golfer'
                  }
                </h1>
                {profile?.handicap && (
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-400/30">
                    Handicap: {profile.handicap}
                  </span>
                )}
              </div>
              
              {profile?.bio ? (
                <p className="text-gray-300 text-lg mb-4">{profile.bio}</p>
              ) : (
                <p className="text-gray-400 text-lg mb-4 italic">No bio yet. Add one to tell other golfers about yourself!</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profile.location}
                  </div>
                )}
                                 {profile?.home_course && (
                   <div className="flex items-center">
                     <Flag className="h-4 w-4 mr-2" />
                     {profile.home_course}
                   </div>
                 )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Display */}
        {profile?.badges && profile.badges.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              Badges Earned ({profile.badges.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map((userBadge: any) => (
                <div 
                  key={userBadge.id}
                  className="relative group cursor-pointer"
                  title={`${userBadge.badge?.name} - ${userBadge.badge?.description}`}
                >
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-xl px-4 py-3 text-center transform transition-all duration-300 group-hover:scale-110 group-hover:border-yellow-400/50">
                    <div className="text-2xl mb-2">
                      {userBadge.badge?.icon_name === 'crown' && '👑'}
                      {userBadge.badge?.icon_name === 'star' && '⭐'}
                      {userBadge.badge?.icon_name === 'trophy' && '🏆'}
                      {userBadge.badge?.icon_name === 'medal' && '🥇'}
                      {userBadge.badge?.icon_name === 'flag' && '🏁'}
                      {userBadge.badge?.icon_name === 'golf' && '⛳'}
                      {userBadge.badge?.icon_name === 'sunrise' && '🌅'}
                      {userBadge.badge?.icon_name === 'zap' && '⚡'}
                      {userBadge.badge?.icon_name === 'lightning' && '⚡'}
                      {userBadge.badge?.icon_name === 'target' && '🎯'}
                      {userBadge.badge?.icon_name === 'award' && '🏅'}
                      {userBadge.badge?.icon_name === 'users' && '👥'}
                      {userBadge.badge?.icon_name === 'shield' && '🛡️'}
                      {userBadge.badge?.icon_name === 'edit' && '✏️'}
                      {userBadge.badge?.icon_name === 'map' && '🗺️'}
                      {userBadge.badge?.icon_name === 'calendar' && '📅'}
                      {userBadge.badge?.icon_name === 'cloud-rain' && '🌧️'}
                      {userBadge.badge?.icon_name === 'sun' && '☀️'}
                    </div>
                    <div className="text-yellow-200 text-sm font-medium">{userBadge.badge?.name}</div>
                    <div className="text-yellow-400 text-xs">{userBadge.badge?.points} pts</div>
                  </div>
                  {/* Rarity indicator */}
                  <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${
                    userBadge.badge?.rarity === 'legendary' ? 'bg-purple-500 text-white' :
                    userBadge.badge?.rarity === 'epic' ? 'bg-blue-500 text-white' :
                    userBadge.badge?.rarity === 'rare' ? 'bg-green-500 text-white' :
                    userBadge.badge?.rarity === 'uncommon' ? 'bg-yellow-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {userBadge.badge?.rarity?.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Sections */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-emerald-400" />
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <p className="text-white">{profile?.first_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <p className="text-white">{profile?.last_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Choose a username"
                    />
                  ) : (
                    <p className="text-white">{profile?.username || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Tell other golfers about yourself..."
                  />
                ) : (
                  <p className="text-white">{profile?.bio || 'No bio yet'}</p>
                )}
              </div>
            </div>

            {/* Golf Information */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                             <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                 <Flag className="h-5 w-5 mr-2 text-emerald-400" />
                 Golf Information
               </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Handicap</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={formData.handicap || ''}
                      onChange={(e) => handleInputChange('handicap', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your handicap"
                    />
                  ) : (
                    <p className="text-white">{profile?.handicap ? profile.handicap : 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Home Course</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.home_course}
                      onChange={(e) => handleInputChange('home_course', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your home course"
                    />
                  ) : (
                    <p className="text-white">{profile?.home_course || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your city/area"
                    />
                  ) : (
                    <p className="text-white">{profile?.location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                Golf Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rounds Played</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Best Score</span>
                  <span className="text-white font-semibold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Average Score</span>
                  <span className="text-white font-semibold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Birdies</span>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-400" />
                Recent Activity
              </h3>
              <div className="space-y-3 text-sm">
                <div className="text-gray-400">
                  <p>No recent activity</p>
                  <p className="text-xs mt-1">Start playing to see your stats!</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-emerald-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors duration-300">
                  Post Tee Time
                </button>
                <button className="w-full bg-gray-600/20 text-gray-300 border border-gray-600/30 px-4 py-2 rounded-lg hover:bg-gray-600/30 transition-colors duration-300">
                  View Connections
                </button>
                <button className="w-full bg-gray-600/20 text-gray-300 border border-gray-600/30 px-4 py-2 rounded-lg hover:bg-gray-600/30 transition-colors duration-300">
                  Privacy Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
