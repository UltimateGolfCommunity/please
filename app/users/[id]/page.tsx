'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Flag, 
  ArrowLeft,
  MessageCircle,
  UserPlus,
  Users,
  Clock,
  Star,
  TrendingUp,
  Mail,
  Phone,
  Globe
} from 'lucide-react'

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  username: string | null
  email: string | null
  bio: string | null
  handicap: number | null
  home_course: string | null
  location: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none')
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        // For now, fetch from our mock API
        const response = await fetch(`/api/users/search?q=${params.id}`)
        if (response.ok) {
          const data = await response.json()
          // Find the specific user by ID or username
          const foundUser = data.users.find((u: UserProfile) => 
            u.id === params.id || u.username === params.id
          )
          if (foundUser) {
            setUser(foundUser)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const handleConnect = async () => {
    setConnectionStatus('pending')
    // In production, this would send a connection request
    setTimeout(() => {
      setConnectionStatus('connected')
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    // In production, this would send a message
    console.log('Sending message:', message)
    setMessage('')
    setShowMessageForm(false)
    
    // Show success feedback
    alert('Message sent successfully!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-gray-400 mb-6">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
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
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h1>
                {user.handicap && (
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm border border-emerald-400/30">
                    Handicap: {user.handicap}
                  </span>
                )}
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-400/30">
                  @{user.username}
                </span>
              </div>
              
              {user.bio && (
                <p className="text-gray-300 text-lg mb-4">{user.bio}</p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
                {user.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {user.location}
                  </div>
                )}
                {user.home_course && (
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 mr-2" />
                    {user.home_course}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                {connectionStatus === 'none' && (
                  <button
                    onClick={handleConnect}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Connect
                  </button>
                )}
                
                {connectionStatus === 'pending' && (
                  <button className="bg-gray-600/20 text-gray-300 border border-gray-600/30 px-6 py-3 rounded-lg flex items-center" disabled>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300 mr-2"></div>
                    Request Sent
                  </button>
                )}
                
                {connectionStatus === 'connected' && (
                  <button className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-6 py-3 rounded-lg flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Connected
                  </button>
                )}

                <button
                  onClick={() => setShowMessageForm(!showMessageForm)}
                  className="bg-gray-600/20 text-gray-300 border border-gray-600/30 px-6 py-3 rounded-lg hover:bg-gray-600/30 transition-colors duration-300 flex items-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        {showMessageForm && (
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Send Message to {user.first_name}</h3>
            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Write your message here..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowMessageForm(false)}
                  className="bg-gray-600/20 text-gray-300 border border-gray-600/30 px-6 py-3 rounded-lg hover:bg-gray-600/30 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Sections */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Golf Information */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-emerald-400" />
                Golf Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Handicap</label>
                  <p className="text-white">{user.handicap ? user.handicap : 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Home Course</label>
                  <p className="text-white">{user.home_course || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <p className="text-white">{user.location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                  <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-400" />
                Recent Activity
              </h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Posted a tee time for Saturday</span>
                  <span className="text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Joined "Weekend Warriors" group</span>
                  <span className="text-gray-500">1 week ago</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Updated profile information</span>
                  <span className="text-gray-500">2 weeks ago</span>
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
                  <span className="text-white font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Best Score</span>
                  <span className="text-white font-semibold">78</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Average Score</span>
                  <span className="text-white font-semibold">84</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Birdies</span>
                  <span className="text-white font-semibold">12</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-emerald-400" />
                Contact Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Mail className="h-4 w-4 mr-3" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Globe className="h-4 w-4 mr-3" />
                  <span className="text-sm">@{user.username}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-emerald-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors duration-300">
                  View Tee Times
                </button>
                <button className="w-full bg-gray-600/20 text-gray-300 border border-gray-600/30 px-4 py-2 rounded-lg hover:bg-gray-600/30 transition-colors duration-300">
                  Invite to Group
                </button>
                <button className="w-full bg-gray-600/20 text-gray-300 border border-gray-600/30 px-4 py-2 rounded-lg hover:bg-gray-600/30 transition-colors duration-300">
                  Report User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
