'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Search, 
  Calendar, 
  Users, 
  MessageCircle, 
  Bell, 
  Settings,
  LogOut,
  User,
  MapPin,
  Clock,
  TrendingUp,
  Plus,
  Star,
  Zap,
  Flag
} from 'lucide-react'
import WeatherWidget from '@/app/components/WeatherWidget'
import GolfRoundForm from '@/app/components/GolfRoundForm'

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'explore' | 'tee-times' | 'my-group' | 'golf-courses' | 'badges'>('explore')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  
  // New state for modals and forms
  const [showTeeTimeModal, setShowTeeTimeModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showGolfRoundModal, setShowGolfRoundModal] = useState(false)
  
  // Form states
  const [teeTimeForm, setTeeTimeForm] = useState({
    course: '',
    date: '',
    time: '',
    players: 4,
    handicap: 'any',
    description: ''
  })
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    maxMembers: 8
  })
  
  const [messageForm, setMessageForm] = useState({
    recipient: '',
    subject: '',
    message: ''
  })
  
  const [ratingForm, setRatingForm] = useState({
    course: '',
    rating: 5,
    review: ''
  })
  
  const [groupMessageText, setGroupMessageText] = useState('')
  
  // Golf Courses state
  const [courseSearchQuery, setCourseSearchQuery] = useState('')
  const [courseSearchResults, setCourseSearchResults] = useState([])
  const [courseSearchLoading, setCourseSearchLoading] = useState(false)

  // Badge system state
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState('')
  const [availableBadges, setAvailableBadges] = useState([])

  // Fetch available badges
  useEffect(() => {
    const fetchAvailableBadges = async () => {
      try {
        const response = await fetch('/api/badges')
        if (response.ok) {
          const data = await response.json()
          setAvailableBadges(data.badges || [])
        }
      } catch (error) {
        console.error('Error fetching badges:', error)
      }
    }

    fetchAvailableBadges()
  }, [])

  // Temporarily disable strict authentication for development
  // useEffect(() => {
  //   // Add a timeout to prevent infinite loading
  //   const timeoutId = setTimeout(() => {
  //     if (!user) {
  //       router.push('/auth/login')
  //     }
  //   }, 5000) // 5 second timeout

  //   if (!loading && !user) {
  //     clearTimeout(timeoutId)
  //       router.push('/auth/login')
  //   }

  //   return () => clearTimeout(timeoutId)
  // }, [user, loading, router])

  // Temporarily disable loading and user checks for development
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-black text-white flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
  //         <p className="text-gray-300">Loading your dashboard...</p>
  //         <p className="text-gray-500 text-sm mt-2">Please wait while we check your authentication...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!user) {
  //   return null
  // }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearchLoading(true)
    setSearchPerformed(true)
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users)
      } else {
        console.error('Search failed:', response.statusText)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`)
  }

  const handleConnect = async (userId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        alert('Connection request sent successfully!')
        // Optionally refresh the search results or update UI
      } else {
        const error = await response.json()
        alert(`Failed to send connection request: ${error.details}`)
      }
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to send connection request. Please try again.')
    }
  }
  
  // Handler functions for quick action buttons
  const handlePostTeeTime = () => {
    setShowTeeTimeModal(true)
  }
  
  const handleCreateGroup = () => {
    setShowGroupModal(true)
  }
  
  const handleSendMessage = () => {
    setShowMessageModal(true)
  }
  
  const handleRateCourse = () => {
    setShowRatingModal(true)
  }

  const handleRecordGolfRound = async (roundData: any) => {
    try {
      const response = await fetch('/api/golf-rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roundData),
      })

      if (response.ok) {
        const data = await response.json()
        alert('Golf round recorded successfully! Your achievements have been updated.')
        // Refresh profile to get updated badges and achievements
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Failed to record golf round: ${error.error}`)
      }
    } catch (error) {
      console.error('Error recording golf round:', error)
      alert('Failed to record golf round. Please try again.')
    }
  }
  
  const handleApplyToTeeTime = async (teeTimeId: string) => {
    try {
      const response = await fetch('/api/tee-times/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tee_time_id: teeTimeId,
          user_id: user?.id
        })
      })
      
      if (response.ok) {
        alert('Application submitted successfully!')
      } else {
        alert('Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to tee time:', error)
      alert('Error submitting application')
    }
  }
  
  const handleSendGroupMessage = async () => {
    if (!groupMessageText.trim()) return
    
    try {
      const response = await fetch('/api/groups/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: profile?.current_group?.id,
          user_id: user?.id,
          message: groupMessageText
        })
      })
      
      if (response.ok) {
        setGroupMessageText('')
        // Refresh profile to get updated messages
        // This would ideally use real-time updates
      } else {
        alert('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending group message:', error)
      alert('Error sending message')
        }
      }
      
      // Golf Courses handlers
      const handleCourseSearch = async () => {
        if (!courseSearchQuery.trim()) return
        
        setCourseSearchLoading(true)
        try {
          const response = await fetch(`/api/golf-courses/search?q=${encodeURIComponent(courseSearchQuery)}`)
          
          if (response.ok) {
            const data = await response.json()
            setCourseSearchResults(data.courses || [])
          } else {
            console.error('Course search failed')
            setCourseSearchResults([])
          }
        } catch (error) {
          console.error('Error searching courses:', error)
          setCourseSearchResults([])
        } finally {
          setCourseSearchLoading(false)
        }
      }
      
      const handleViewCourse = (courseId: string) => {
        // Navigate to course detail page or show modal
        alert(`Viewing course ${courseId} - Feature coming soon!`)
      }
  
  // Form submission handlers
  const handleTeeTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/tee-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teeTimeForm),
      })
      
      if (response.ok) {
        console.log('Tee time posted successfully')
        setShowTeeTimeModal(false)
        setTeeTimeForm({
          course: '',
          date: '',
          time: '',
          players: 4,
          handicap: 'any',
          description: ''
        })
      } else {
        console.error('Failed to post tee time')
      }
    } catch (error) {
      console.error('Error posting tee time:', error)
    }
  }
  
  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupForm),
      })
      
      if (response.ok) {
        console.log('Group created successfully')
        setShowGroupModal(false)
        setGroupForm({
          name: '',
          description: '',
          maxMembers: 8
        })
      } else {
        console.error('Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }
  
  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageForm),
      })
      
      if (response.ok) {
        console.log('Message sent successfully')
        setShowMessageModal(false)
        setMessageForm({
          recipient: '',
          subject: '',
          message: ''
        })
      } else {
        console.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
  
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Find the course ID by name
      const courseResponse = await fetch(`/api/golf-courses/search?q=${encodeURIComponent(ratingForm.course)}`)
      if (!courseResponse.ok) {
        alert('Course not found')
        return
      }
      
      const courseData = await courseResponse.json()
      const course = courseData.courses?.[0]
      
      if (!course) {
        alert('Course not found')
        return
      }

      // Submit the review
      const response = await fetch('/api/golf-courses/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: course.id,
          user_id: user?.id,
          rating: ratingForm.rating,
          comment: ratingForm.review
        }),
      })
      
      if (response.ok) {
        alert('Review submitted successfully!')
        setShowRatingModal(false)
        setRatingForm({
          course: '',
          rating: 5,
          review: ''
        })
        // Refresh course search results if we're on the golf courses tab
        if (activeTab === 'golf-courses' && courseSearchQuery) {
          handleCourseSearch()
        }
      } else {
        alert('Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Golf-Themed Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Golf Course Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-grass-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sunset-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-forest-400/10 rounded-full blur-3xl animate-pulse delay-1500"></div>
        
        {/* Golf Course Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(76,175,80,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(76,175,80,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Nature-Inspired Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-900/80 to-grass-950/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Golf-Themed Glassmorphism Navigation Bar */}
      <nav className="bg-forest-900/20 backdrop-blur-xl border-b border-grass-400/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-grass-400 via-sky-400 to-ocean-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                  <span className="text-white font-bold text-xl">GC</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-grass-400 via-sky-400 to-ocean-500 rounded-3xl blur opacity-30 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-grass-400 via-sky-400 to-ocean-500 bg-clip-text text-transparent">
                  Ultimate Golf Community
                </span>
                <span className="text-xs text-gray-400">Premium Golf Experience</span>
              </div>
            </div>

                          {/* Golf-Themed Main Navigation */}
              <div className="hidden lg:flex items-center space-x-1 bg-forest-900/20 backdrop-blur-md rounded-2xl p-1 border border-grass-400/20">
                {[
                  { id: 'explore', label: 'Explore', icon: Search, color: 'grass', gradient: 'from-grass-500 to-grass-600' },
                  { id: 'tee-times', label: 'Tee Times', icon: Calendar, color: 'sky', gradient: 'from-sky-500 to-sky-600' },
                  { id: 'my-group', label: 'My Group', icon: Users, color: 'sunset', gradient: 'from-sunset-500 to-sunset-600' }
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-500 ${
                        isActive
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                          : 'text-gray-300 hover:text-white hover:bg-grass-400/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

                          {/* Golf-Themed User Menu */}
              <div className="flex items-center space-x-6">
                {/* Notifications */}
                <button className="relative group">
                  <div className="p-2 rounded-xl bg-grass-400/10 hover:bg-grass-400/20 transition-all duration-300 border border-grass-400/20">
                    <Bell className="h-6 w-6 text-grass-300 group-hover:text-grass-200 transition-colors duration-300" />
                    <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-sunset-500 to-sunset-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                  </div>
                </button>
                
                {/* User Profile */}
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-2 rounded-xl bg-grass-400/10 hover:bg-grass-400/20 transition-all duration-300 border border-grass-400/20">
                    <div className="relative">
                      <div className="h-10 w-10 bg-gradient-to-r from-grass-400 via-sky-400 to-ocean-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-grass-400 via-sky-400 to-ocean-500 rounded-full blur opacity-30"></div>
                    </div>
                    <span className="text-grass-300 group-hover:text-grass-200 transition-colors duration-300 font-medium">
                      {profile?.first_name || user?.email?.split('@')[0] || 'Golfer'}
                    </span>
                  </button>
                
                {/* Golf-Themed Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-56 bg-forest-900/90 backdrop-blur-xl border border-grass-400/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4">
                    <div className="mb-4 pb-4 border-b border-grass-400/20">
                      <div className="text-white font-semibold">{profile?.first_name || 'Golfer'}</div>
                      <div className="text-grass-300 text-sm">{user?.email}</div>
                    </div>
                    <div className="space-y-2">
                      <a href="/profile" className="flex items-center px-3 py-2 text-grass-300 hover:bg-grass-400/20 hover:text-grass-200 rounded-xl transition-all duration-300">
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </a>
                      <a href="/settings" className="flex items-center px-3 py-2 text-grass-300 hover:bg-grass-400/20 hover:text-grass-200 rounded-xl transition-all duration-300">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </a>
                      <hr className="border-grass-400/20 my-2" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-3 py-2 text-sunset-400 hover:bg-sunset-500/20 hover:text-sunset-300 rounded-xl transition-all duration-300"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section with Modern Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-grass-100 via-grass-300 to-sky-400 bg-clip-text text-transparent">
                Welcome back, {profile?.first_name || 'Golfer'}! 🏌️‍♂️
              </h1>
              <p className="text-grass-200 text-xl max-w-2xl">
                Ready to hit the links? Explore tee times, connect with other golfers, and manage your group with our premium platform.
              </p>
              <div className="flex items-center space-x-4 text-sm text-grass-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-grass-400 rounded-full animate-pulse"></div>
                  <span>Online now</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse delay-1000"></div>
                  <span>Active golfers</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="relative group">
                  <div className="bg-gradient-to-r from-grass-500/20 to-grass-600/20 backdrop-blur-xl border border-grass-400/30 rounded-2xl px-6 py-4 text-center transform transition-all duration-500 group-hover:scale-105 group-hover:border-grass-400/50">
                                      <div className="text-3xl font-bold text-grass-400 mb-1">{profile?.connections_count || 0}</div>
                  <div className="text-grass-300 text-sm font-medium">Connections</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-grass-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
                <div className="relative group">
                  <div className="bg-gradient-to-r from-sky-500/20 to-sky-600/20 backdrop-blur-xl border border-sky-400/30 rounded-2xl px-6 py-4 text-center transform transition-all duration-500 group-hover:scale-105 group-hover:border-sky-400/50">
                                      <div className="text-3xl font-bold text-sky-400 mb-1">{profile?.tee_times_count || 0}</div>
                  <div className="text-sky-300 text-sm font-medium">Tee Times</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
                <div className="relative group">
                  <div className="bg-gradient-to-r from-sunset-500/20 to-sunset-600/20 backdrop-blur-xl border border-sunset-400/30 rounded-2xl px-6 py-4 text-center transform transition-all duration-500 group-hover:scale-105 group-hover:border-sunset-400/50">
                    <div className="text-3xl font-bold text-sunset-400 mb-1">{profile?.groups_count || 0}</div>
                    <div className="text-sunset-300 text-sm font-medium">Groups</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-sunset-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather & Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weather Widget */}
          <div className="lg:col-span-2">
            <WeatherWidget />
          </div>
          
          {/* Golf-Themed Quick Actions */}
          <div className="bg-gradient-to-br from-forest-900/40 to-grass-900/40 backdrop-blur-xl border border-grass-400/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Zap className="h-6 w-6 mr-3 text-sunset-400" />
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button 
                onClick={handlePostTeeTime}
                className="group relative w-full bg-gradient-to-r from-grass-500 to-grass-600 hover:from-grass-600 hover:to-grass-700 text-white py-4 px-6 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-grass-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Calendar className="h-5 w-5 mr-3" />
                Post Tee Time
              </button>
              <button 
                onClick={handleCreateGroup}
                className="group relative w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-4 px-6 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Users className="h-5 w-5 mr-3" />
                Create Group
              </button>
              <button 
                onClick={handleSendMessage}
                className="group relative w-full bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-white py-4 px-6 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sunset-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <MessageCircle className="h-5 w-5 mr-3" />
                Send Message
              </button>
              <button 
                onClick={handleRateCourse}
                className="group relative w-full bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white py-4 px-6 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sand-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Star className="h-5 w-5 mr-3" />
                Rate Course
              </button>
              <button 
                onClick={() => setShowGolfRoundModal(true)}
                className="group relative w-full bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white py-4 px-6 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-forest-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Flag className="h-5 w-5 mr-3" />
                Record Golf Round
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-grass-400/20">
              <div className="flex items-center justify-between text-sm text-grass-300">
                <span>Today's Activity</span>
                <span className="text-grass-400 font-semibold">+24%</span>
              </div>
              <div className="w-full bg-forest-700/30 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-grass-400 to-grass-600 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Golf-Themed Tab Navigation */}
        <div className="bg-forest-900/20 backdrop-blur-xl border border-grass-400/20 rounded-3xl p-2 mb-8 shadow-2xl">
          <div className="flex space-x-2">
            {[
              { id: 'explore', label: 'Explore Golfers', icon: Search, color: 'grass', gradient: 'from-grass-400 to-grass-600' },
              { id: 'tee-times', label: 'Tee Times', icon: Calendar, color: 'sky', gradient: 'from-sky-400 to-sky-600' },
              { id: 'golf-courses', label: 'Golf Courses', icon: MapPin, color: 'sand', gradient: 'from-sand-400 to-sand-600' },
              { id: 'badges', label: 'Badges', icon: Star, color: 'yellow', gradient: 'from-yellow-400 to-yellow-600' },
              { id: 'my-group', label: 'My Group', icon: Users, color: 'sunset', gradient: 'from-sunset-400 to-sunset-600' }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl transition-all duration-500 transform ${
                    isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-105`
                      : 'text-grass-300 hover:text-white hover:bg-grass-400/10 hover:scale-102'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="font-semibold text-lg">{tab.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-grass-400 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-8">
          {/* Explore Tab */}
          {activeTab === 'explore' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-forest-900/40 to-grass-900/40 backdrop-blur-xl border border-grass-400/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-grass-400 to-grass-600 bg-clip-text text-transparent flex items-center">
                      <Search className="h-8 w-8 mr-4 text-grass-400" />
                      Explore Golfers
                    </h2>
                    <p className="text-grass-200 text-lg max-w-2xl">
                      Discover amazing golfers in your area, view their profiles, and build meaningful connections.
                    </p>
                  </div>
                  <div className="mt-6 lg:mt-0">
                    <div className="flex items-center space-x-3 text-sm text-grass-300 bg-grass-400/10 backdrop-blur-md px-4 py-2 rounded-xl border border-grass-400/20">
                      <div className="w-3 h-3 bg-grass-400 rounded-full animate-pulse"></div>
                      <span>Live Community</span>
                      <div className="w-2 h-2 bg-grass-400 rounded-full animate-pulse delay-1000"></div>
                    </div>
                  </div>
                </div>
                
                {/* Golf-Themed Search Bar */}
                <div className="max-w-3xl mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-grass-500/20 to-sky-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-forest-900/40 backdrop-blur-xl border border-grass-400/30 rounded-2xl p-2">
                      <div className="flex items-center">
                        <Search className="ml-4 h-6 w-6 text-grass-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder="Search golfers by name, location, handicap, or home course..."
                          className="flex-1 ml-4 py-4 bg-transparent border-none outline-none text-white placeholder-grass-300 text-lg"
                        />
                        <button
                          onClick={handleSearch}
                          disabled={searchLoading}
                          className="bg-gradient-to-r from-grass-500 to-grass-600 hover:from-grass-600 hover:to-grass-700 text-white px-8 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 font-semibold transform hover:scale-105 shadow-lg"
                        >
                          {searchLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Searching...</span>
                            </div>
                          ) : (
                            'Search'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic Search Suggestions - Will be populated from user behavior */}
                <div className="mb-8">
                  <p className="text-sm text-grass-300 mb-4 font-medium">Quick Search:</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        handleSearch()
                      }}
                      className="group flex items-center space-x-2 text-sm bg-grass-400/10 hover:bg-grass-400/20 text-grass-200 px-4 py-3 rounded-xl border border-grass-400/20 hover:border-grass-400/40 transition-all duration-300 backdrop-blur-md transform hover:scale-105"
                    >
                      <Users className="h-4 w-4 text-grass-400 group-hover:text-grass-300 transition-colors duration-300" />
                      <span className="font-medium">All Golfers</span>
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('Monterey')
                        handleSearch()
                      }}
                      className="group flex items-center space-x-2 text-sm bg-sky-400/10 hover:bg-sky-400/20 text-sky-200 px-4 py-3 rounded-xl border border-sky-400/20 hover:border-sky-400/40 transition-all duration-300 backdrop-blur-md transform hover:scale-105"
                    >
                      <MapPin className="h-4 w-4 text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
                      <span className="font-medium">Monterey Area</span>
                    </button>
                  </div>
                </div>
                
                                {/* Search Results */}
                <div className="mt-6">
                  {!searchPerformed ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Search for golfers to connect with</p>
                        <p className="text-sm">Try searching by name, location, or handicap</p>
                      </div>
                    </div>
                  ) : searchLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grass-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Searching for golfers...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {searchResults.map((user) => (
                        <div 
                          key={user.id} 
                          className="bg-grass-800/30 border border-grass-700/50 rounded-lg p-4 hover:border-grass-400/50 transition-all duration-300 cursor-pointer"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-grass-400 to-forest-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user.first_name?.[0]}{user.last_name?.[0] || user.username?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">
                                {user.first_name} {user.last_name}
                              </h3>
                              <p className="text-grass-400 text-sm">
                                Handicap: {user.handicap || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">
                            {user.bio || 'No bio available'}
                          </p>
                          <div className="flex space-x-2">
                            <button 
                              className="flex-1 bg-grass-500/20 text-grass-400 border border-grass-400/30 px-3 py-2 rounded text-sm hover:bg-grass-500/30 transition-colors duration-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleConnect(user.id)
                              }}
                            >
                              Connect
                            </button>
                            <button 
                              className="flex-1 bg-sky-600/20 text-sky-300 border border-sky-600/30 px-3 py-2 rounded text-sm hover:bg-sky-600/30 transition-colors duration-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUserClick(user.id)
                              }}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No golfers found</p>
                        <p className="text-sm">Try adjusting your search terms</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Golf Courses Tab */}
          {activeTab === 'golf-courses' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-forest-900/40 to-sand-900/40 backdrop-blur-xl border border-sand-400/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-sand-400 to-sand-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <MapPin className="h-8 w-8 mr-4 text-sand-400" />
                  Golf Courses
                </h2>
                <p className="text-sand-200 text-lg mb-8">
                  Discover amazing golf courses, read reviews, and find your next golfing destination.
                </p>
                
                {/* Course Search */}
                <div className="max-w-3xl mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-sand-500/20 to-sunset-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-forest-900/40 backdrop-blur-xl border border-sand-400/30 rounded-2xl p-2">
                      <div className="flex items-center">
                        <Search className="ml-4 h-6 w-6 text-sand-400" />
                        <input
                          type="text"
                          value={courseSearchQuery}
                          onChange={(e) => setCourseSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCourseSearch()}
                          placeholder="Search courses by name, location, or description..."
                          className="flex-1 ml-4 py-4 bg-transparent border-none outline-none text-white placeholder-sand-300 text-lg"
                        />
                        <button
                          onClick={handleCourseSearch}
                          disabled={courseSearchLoading}
                          className="bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white px-8 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 font-semibold transform hover:scale-105 shadow-lg"
                        >
                          {courseSearchLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Searching...</span>
                            </div>
                          ) : (
                            'Search Courses'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course List */}
                <div className="space-y-4">
                  {courseSearchResults.length > 0 ? (
                    courseSearchResults.map((course: any) => (
                      <div key={course.id} className="bg-sand-900/30 border border-sand-400/20 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-xl mb-2">{course.name}</h3>
                            <p className="text-sand-300 text-sm mb-2">{course.location}</p>
                            <p className="text-sand-200 text-sm">{course.description}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm">
                              <span className="text-sand-400">Par: {course.par}</span>
                              <span className="text-sand-400">Holes: {course.holes}</span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="flex items-center space-x-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-5 w-5 ${star <= (course.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-sand-400'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-sand-300 text-sm">{course.average_rating || 0} / 5</p>
                            <p className="text-sand-400 text-xs">({course.review_count || 0} reviews)</p>
                          </div>
                        </div>
                        
                        {/* Reviews Section */}
                        <div className="mt-6">
                          <h4 className="text-sand-300 font-semibold mb-3">Recent Reviews</h4>
                          <div className="space-y-3">
                            {course.reviews && course.reviews.length > 0 ? (
                              course.reviews.slice(0, 3).map((review: any, index: number) => (
                                <div key={index} className="bg-sand-800/30 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 bg-gradient-to-r from-sand-400 to-sunset-400 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{review.user?.first_name?.charAt(0) || 'G'}</span>
                                      </div>
                                      <span className="text-sand-200 text-sm">{review.user?.first_name || 'Golfer'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                          key={star} 
                                          className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-sand-400'}`} 
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sand-300 text-sm">{review.comment}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sand-400 text-sm italic">No reviews yet. Be the first to review this course!</p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 mt-6">
                          <button 
                            onClick={() => handleViewCourse(course.id)}
                            className="flex-1 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => {
                              setRatingForm({...ratingForm, course: course.name})
                              setShowRatingModal(true)
                            }}
                            className="flex-1 bg-sand-600/20 text-sand-300 border border-sand-400/30 px-4 py-3 rounded-xl hover:bg-sand-600/30 transition-colors duration-300"
                          >
                            Write Review
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-sand-400 mb-4">
                        <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Search for golf courses</p>
                        <p className="text-sm">Find courses by name, location, or description</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-forest-900/40 to-yellow-900/40 backdrop-blur-xl border border-yellow-400/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <Star className="h-8 w-8 mr-4 text-yellow-400" />
                  Badges & Achievements
                </h2>
                <p className="text-yellow-200 text-lg mb-8">
                  Track your golf achievements and earn badges for your accomplishments.
                </p>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-yellow-900/30 border border-yellow-400/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{profile?.badges?.length || 0}</div>
                    <div className="text-yellow-300 text-sm">Badges Earned</div>
                  </div>
                  <div className="bg-yellow-900/30 border border-yellow-400/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{profile?.total_points || 0}</div>
                    <div className="text-yellow-300 text-sm">Total Points</div>
                  </div>
                  <div className="bg-yellow-900/30 border border-yellow-400/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{profile?.achievements?.length || 0}</div>
                    <div className="text-yellow-300 text-sm">Achievements</div>
                  </div>
                  <div className="bg-yellow-900/30 border border-yellow-400/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {profile?.badges?.filter((b: any) => b.badge?.rarity === 'legendary').length || 0}
                    </div>
                    <div className="text-yellow-300 text-sm">Legendary</div>
                  </div>
                </div>

                {/* Badge Categories */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Badge Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { category: 'early_adopter', name: 'Early Adopter', color: 'purple', icon: '👑' },
                      { category: 'achievement', name: 'Achievement', color: 'blue', icon: '🏆' },
                      { category: 'milestone', name: 'Milestone', color: 'green', icon: '🎯' },
                      { category: 'special', name: 'Special', color: 'orange', icon: '⭐' }
                    ].map((cat) => (
                      <button
                        key={cat.category}
                        onClick={() => setBadgeCategoryFilter(cat.category)}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          badgeCategoryFilter === cat.category
                            ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                            : 'bg-yellow-900/20 border-yellow-400/30 text-yellow-200 hover:bg-yellow-500/10'
                        }`}
                      >
                        <div className="text-2xl mb-2">{cat.icon}</div>
                        <div className="font-medium">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile?.badges?.filter((userBadge: any) => 
                    !badgeCategoryFilter || userBadge.badge?.category === badgeCategoryFilter
                  ).map((userBadge: any) => (
                    <div 
                      key={userBadge.id}
                      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                      title={`${userBadge.badge?.name} - ${userBadge.badge?.description}`}
                    >
                      <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-xl border border-yellow-400/30 rounded-2xl p-6 text-center shadow-lg">
                        <div className="text-4xl mb-4">
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
                        <h4 className="text-lg font-bold text-white mb-2">{userBadge.badge?.name}</h4>
                        <p className="text-yellow-200 text-sm mb-3">{userBadge.badge?.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-yellow-400">{userBadge.badge?.points} pts</span>
                          <span className={`px-2 py-1 rounded-full font-bold ${
                            userBadge.badge?.rarity === 'legendary' ? 'bg-purple-500 text-white' :
                            userBadge.badge?.rarity === 'epic' ? 'bg-blue-500 text-white' :
                            userBadge.badge?.rarity === 'rare' ? 'bg-green-500 text-white' :
                            userBadge.badge?.rarity === 'uncommon' ? 'bg-yellow-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {userBadge.badge?.rarity?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-yellow-400 text-xs mt-2">
                          Earned: {new Date(userBadge.earned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Available Badges */}
                <div className="mt-12">
                  <h3 className="text-xl font-semibold text-white mb-6">Available Badges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableBadges?.filter((badge: any) => 
                      !badgeCategoryFilter || badge.category === badgeCategoryFilter
                    ).map((badge: any) => (
                      <div 
                        key={badge.id}
                        className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 opacity-60"
                        title={`${badge.name} - ${badge.description}`}
                      >
                        <div className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 backdrop-blur-xl border border-gray-400/30 rounded-2xl p-6 text-center shadow-lg">
                          <div className="text-4xl mb-4 text-gray-400">
                            {badge.icon_name === 'crown' && '👑'}
                            {badge.icon_name === 'star' && '⭐'}
                            {badge.icon_name === 'trophy' && '🏆'}
                            {badge.icon_name === 'medal' && '🥇'}
                            {badge.icon_name === 'flag' && '🏁'}
                            {badge.icon_name === 'golf' && '⛳'}
                            {badge.icon_name === 'sunrise' && '🌅'}
                            {badge.icon_name === 'zap' && '⚡'}
                            {badge.icon_name === 'lightning' && '⚡'}
                            {badge.icon_name === 'target' && '🎯'}
                            {badge.icon_name === 'award' && '🏅'}
                            {badge.icon_name === 'users' && '👥'}
                            {badge.icon_name === 'shield' && '🛡️'}
                            {badge.icon_name === 'edit' && '✏️'}
                            {badge.icon_name === 'map' && '🗺️'}
                            {badge.icon_name === 'calendar' && '📅'}
                            {badge.icon_name === 'cloud-rain' && '🌧️'}
                            {badge.icon_name === 'sun' && '☀️'}
                          </div>
                          <h4 className="text-lg font-bold text-gray-300 mb-2">{badge.name}</h4>
                          <p className="text-gray-400 text-sm mb-3">{badge.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{badge.points} pts</span>
                            <span className={`px-2 py-1 rounded-full font-bold ${
                              badge.rarity === 'legendary' ? 'bg-purple-500 text-white' :
                              badge.rarity === 'epic' ? 'bg-blue-500 text-white' :
                              badge.rarity === 'rare' ? 'bg-green-500 text-white' :
                              badge.rarity === 'uncommon' ? 'bg-yellow-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {badge.rarity?.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs mt-2">
                            {badge.criteria}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tee Times Tab */}
          {activeTab === 'tee-times' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-forest-900/40 to-sky-900/40 backdrop-blur-xl border border-sky-400/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <Calendar className="h-8 w-8 mr-4 text-sky-400" />
                  Tee Times
                </h2>
                <p className="text-sky-200 text-lg mb-8">
                  Browse available tee times, post your own, and manage applications.
                </p>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 mb-8">
                  <button 
                    onClick={() => setActiveTab('explore')}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Browse Tee Times
                  </button>
                  <button 
                    onClick={handlePostTeeTime}
                    className="border-2 border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Post New Tee Time
                  </button>
                </div>
                
                {/* Tee Times List - Will be populated from database */}
                <div className="space-y-4">
                  {profile?.tee_times && profile.tee_times.length > 0 ? (
                    profile.tee_times.map((teeTime: any) => (
                      <div key={teeTime.id} className="bg-sky-900/30 border border-sky-400/20 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{teeTime.creator?.first_name?.charAt(0) || 'G'}</span>
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-lg">{teeTime.creator?.first_name || 'Golfer'}</h3>
                              <p className="text-sky-400 text-sm">{teeTime.course_name}</p>
                            </div>
                          </div>
                          <span className="bg-sky-500/20 text-sky-400 px-4 py-2 rounded-full text-sm border border-sky-400/30 font-medium">
                            {teeTime.available_spots} spots open
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-sky-300">Date:</span>
                            <p className="text-white">{new Date(teeTime.tee_time_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-sky-300">Time:</span>
                            <p className="text-white">{teeTime.tee_time_time}</p>
                          </div>
                          <div>
                            <span className="text-sky-300">Players:</span>
                            <p className="text-white">{teeTime.current_players}/{teeTime.max_players}</p>
                          </div>
                          <div>
                            <span className="text-sky-300">Handicap:</span>
                            <p className="text-white">{teeTime.handicap_requirement}</p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleApplyToTeeTime(teeTime.id)}
                            className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                          >
                            Apply to Join
                          </button>
                          <button 
                            onClick={() => {
                              setMessageForm({...messageForm, recipient: teeTime.creator?.id, subject: 'Tee Time Inquiry'})
                              setShowMessageModal(true)
                            }}
                            className="flex-1 bg-sky-600/20 text-sky-300 border border-sky-400/30 px-4 py-3 rounded-xl hover:bg-sky-600/30 transition-colors duration-300"
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-sky-400 mb-4">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No tee times available</p>
                        <p className="text-sm">Be the first to post a tee time!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Group Tab */}
          {activeTab === 'my-group' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-forest-900/40 to-sunset-900/40 backdrop-blur-xl border border-sunset-400/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-sunset-400 to-sunset-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <Users className="h-8 w-8 mr-4 text-sunset-400" />
                  My Group
                </h2>
                <p className="text-sunset-200 text-lg mb-8">
                  Manage your golf group, invite members, and chat with your group.
                </p>
                
                                 {/* Group Management */}
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                     <h3 className="text-lg font-semibold text-white mb-3">Group Info</h3>
                     <div className="space-y-2 text-gray-300 mb-4">
                       <p><span className="text-emerald-400">Group Name:</span> Weekend Warriors</p>
                       <p><span className="text-emerald-400">Members:</span> 8</p>
                       <p><span className="text-emerald-400">Status:</span> Active</p>
                       <p><span className="text-emerald-400">Role:</span> Owner</p>
                     </div>
                     <div className="space-y-2">
                       <button 
                         onClick={() => alert('Group management features coming soon!')}
                         className="w-full bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
                       >
                         Manage Group
                       </button>
                       <button 
                         onClick={() => alert('Invite feature coming soon!')}
                         className="w-full bg-sunset-600/20 text-sunset-300 border border-sunset-400/30 px-4 py-2 rounded-xl hover:bg-sunset-600/30 transition-colors duration-300"
                       >
                         Invite Members
                       </button>
                     </div>
                   </div>
                   
                   <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                     <h3 className="text-lg font-semibold text-white mb-3">Group Chat</h3>
                     <div className="h-48 overflow-y-auto mb-3 space-y-2">
                       {profile?.group_messages && profile.group_messages.length > 0 ? (
                         profile.group_messages.map((message: any, index: number) => (
                           <div key={index} className="flex items-start space-x-2">
                             <div className="h-6 w-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                               <span className="text-black font-bold text-xs">{message.sender?.first_name?.charAt(0) || 'G'}</span>
                             </div>
                             <div className="flex-1">
                               <p className="text-emerald-400 text-xs">{message.sender?.first_name || 'Golfer'}</p>
                               <p className="text-gray-300 text-sm">{message.message_content}</p>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-8 text-gray-400">
                           <p className="text-sm">No messages yet</p>
                           <p className="text-xs">Start the conversation!</p>
                         </div>
                       )}
                     </div>
                     <div className="flex space-x-2">
                       <input
                         type="text"
                         placeholder="Type a message..."
                         value={groupMessageText}
                         onChange={(e) => setGroupMessageText(e.target.value)}
                         className="flex-1 px-3 py-2 bg-sunset-800/30 border border-sunset-400/30 rounded-xl focus:ring-2 focus:ring-sunset-500 focus:border-sunset-400 text-white placeholder-sunset-300 transition-all duration-300"
                       />
                       <button 
                         onClick={handleSendGroupMessage}
                         className="bg-sunset-500 hover:bg-sunset-600 text-white px-4 py-2 rounded-xl transition-colors duration-300"
                       >
                         Send
                       </button>
                     </div>
                   </div>
                 </div>

                 {/* Recent Group Activity */}
                 <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                   <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                   <div className="space-y-2 text-sm">
                     {profile?.group_activity && profile.group_activity.length > 0 ? (
                       profile.group_activity.map((activity: any, index: number) => (
                         <div key={index} className="flex items-center justify-between text-gray-300">
                           <span>{activity.description}</span>
                           <span className="text-gray-500">{activity.time_ago}</span>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-4 text-gray-400">
                         <p className="text-sm">No recent activity</p>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Components */}
      
      {/* Tee Time Modal */}
      {showTeeTimeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-forest-900/95 backdrop-blur-xl border border-grass-400/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-grass-400" />
              Post Tee Time
            </h3>
            <form onSubmit={handleTeeTimeSubmit} className="space-y-4">
              <div>
                <label className="block text-grass-200 text-sm font-medium mb-2">Golf Course</label>
                <input
                  type="text"
                  value={teeTimeForm.course}
                  onChange={(e) => setTeeTimeForm({...teeTimeForm, course: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-xl text-white placeholder-grass-300 focus:ring-2 focus:ring-grass-400 focus:border-grass-400"
                  placeholder="Enter golf course name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-grass-200 text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={teeTimeForm.date}
                    onChange={(e) => setTeeTimeForm({...teeTimeForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-xl text-white focus:ring-2 focus:ring-grass-400 focus:border-grass-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-grass-200 text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={teeTimeForm.time}
                    onChange={(e) => setTeeTimeForm({...teeTimeForm, time: e.target.value})}
                    className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-xl text-white focus:ring-2 focus:ring-grass-400 focus:border-grass-400"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-grass-200 text-sm font-medium mb-2">Players</label>
                  <select
                    value={teeTimeForm.players}
                    onChange={(e) => setTeeTimeForm({...teeTimeForm, players: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-xl text-white focus:ring-2 focus:ring-grass-400 focus:border-grass-400"
                  >
                    <option value={2}>2 players</option>
                    <option value={3}>3 players</option>
                    <option value={4}>4 players</option>
                  </select>
                </div>
                <div>
                  <label className="block text-grass-200 text-sm font-medium mb-2">Handicap</label>
                  <select
                    value={teeTimeForm.handicap}
                    onChange={(e) => setTeeTimeForm({...teeTimeForm, handicap: e.target.value})}
                    className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-xl text-white focus:ring-2 focus:ring-grass-400 focus:border-grass-400"
                  >
                    <option value="any">Any level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-grass-200 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={teeTimeForm.description}
                  onChange={(e) => setTeeTimeForm({...teeTimeForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-xl text-white placeholder-grass-300 focus:ring-2 focus:ring-grass-400 focus:border-grass-400"
                  placeholder="Any additional details..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-grass-500 to-grass-600 hover:from-grass-600 hover:to-grass-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Post Tee Time
                </button>
                <button
                  type="button"
                  onClick={() => setShowTeeTimeModal(false)}
                  className="flex-1 bg-forest-700/50 text-forest-200 border border-forest-600/30 px-6 py-3 rounded-xl hover:bg-forest-700/70 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-forest-900/95 backdrop-blur-xl border border-sky-400/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Users className="h-6 w-6 mr-3 text-sky-400" />
              Create Group
            </h3>
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-sky-200 text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sky-400/30 rounded-xl text-white placeholder-sky-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div>
                <label className="block text-sky-200 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sky-400/30 rounded-xl text-white placeholder-sky-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="Describe your group..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sky-200 text-sm font-medium mb-2">Max Members</label>
                <select
                  value={groupForm.maxMembers}
                  onChange={(e) => setGroupForm({...groupForm, maxMembers: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sky-400/30 rounded-xl text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                >
                  <option value={4}>4 members</option>
                  <option value={6}>6 members</option>
                  <option value={8}>8 members</option>
                  <option value={12}>12 members</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Create Group
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 bg-forest-700/50 text-forest-200 border border-forest-600/30 px-6 py-3 rounded-xl hover:bg-forest-700/70 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-forest-900/95 backdrop-blur-xl border border-sunset-400/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <MessageCircle className="h-6 w-6 mr-3 text-sunset-400" />
              Send Message
            </h3>
            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <div>
                <label className="block text-sunset-200 text-sm font-medium mb-2">Recipient</label>
                <input
                  type="text"
                  value={messageForm.recipient}
                  onChange={(e) => setMessageForm({...messageForm, recipient: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sunset-400/30 rounded-xl text-white placeholder-sunset-300 focus:ring-2 focus:ring-sunset-400 focus:border-sunset-400"
                  placeholder="Enter recipient name or email"
                  required
                />
              </div>
              <div>
                <label className="block text-sunset-200 text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sunset-400/30 rounded-xl text-white placeholder-sunset-300 focus:ring-2 focus:ring-sunset-400 focus:border-sunset-400"
                  placeholder="Enter message subject"
                  required
                />
              </div>
              <div>
                <label className="block text-sunset-200 text-sm font-medium mb-2">Message</label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sunset-400/30 rounded-xl text-white placeholder-sunset-300 focus:ring-2 focus:ring-sunset-400 focus:border-sunset-400"
                  placeholder="Type your message..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sunset-500 to-sunset-600 hover:from-sunset-600 hover:to-sunset-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 bg-forest-700/50 text-forest-200 border border-forest-600/30 px-6 py-3 rounded-xl hover:bg-forest-700/70 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Rate Course Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-forest-900/95 backdrop-blur-xl border border-sand-400/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Star className="h-6 w-6 mr-3 text-sand-400" />
              Rate Course
            </h3>
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-sand-200 text-sm font-medium mb-2">Golf Course</label>
                <input
                  type="text"
                  value={ratingForm.course}
                  onChange={(e) => setRatingForm({...ratingForm, course: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sand-400/30 rounded-xl text-white placeholder-sand-300 focus:ring-2 focus:ring-sand-400 focus:border-sand-400"
                  placeholder="Enter golf course name"
                  required
                />
              </div>
              <div>
                <label className="block text-sand-200 text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingForm({...ratingForm, rating: star})}
                      className={`text-2xl ${ratingForm.rating >= star ? 'text-sand-400' : 'text-sand-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sand-200 text-sm font-medium mb-2">Review</label>
                <textarea
                  value={ratingForm.review}
                  onChange={(e) => setRatingForm({...ratingForm, review: e.target.value})}
                  className="w-full px-4 py-3 bg-forest-800/50 border border-sand-400/30 rounded-xl text-white placeholder-sand-300 focus:ring-2 focus:ring-sand-400 focus:border-sand-400"
                  placeholder="Share your experience..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sand-500 to-sand-600 hover:from-sand-600 hover:to-sand-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Submit Rating
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 bg-forest-700/50 text-forest-200 border border-forest-600/30 px-6 py-3 rounded-xl hover:bg-forest-700/70 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Golf Round Modal */}
      {showGolfRoundModal && (
        <GolfRoundForm
          onClose={() => setShowGolfRoundModal(false)}
          onSave={handleRecordGolfRound}
          userId={user?.id || ''}
        />
      )}
      
      </div>
    </div>
  )
}
