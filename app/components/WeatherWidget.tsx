'use client'

import { useState, useEffect, useCallback } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, MapPin, Droplets } from 'lucide-react'

interface WeatherData {
  location: string
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  feelsLike: number
}

interface WeatherWidgetProps {
  className?: string
}

export default function WeatherWidget({ className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<string>('Detecting location...') // Will be updated with current location
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null)

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lon: longitude })
          setLocation('Current Location')
          // Fetch weather using coordinates
          fetchWeatherByCoordinates(latitude, longitude)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocation('Monterey') // Fallback to default location
          fetchWeather()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setLocation('Monterey') // Fallback for browsers without geolocation
      fetchWeather()
    }
  }, [])

  const fetchWeatherByCoordinates = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }
      
      const data = await response.json()
      setWeather(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/weather?city=${encodeURIComponent(location)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }
      
      const data = await response.json()
      setWeather(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather')
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase()
    if (desc.includes('clear') || desc.includes('sun')) {
      return <Sun className="w-8 h-8 text-yellow-400" />
    } else if (desc.includes('cloud')) {
      return <Cloud className="w-8 h-8 text-gray-400" />
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="w-8 h-8 text-blue-400" />
    } else if (desc.includes('snow')) {
      return <CloudSnow className="w-8 h-8 text-blue-200" />
    } else if (desc.includes('thunder')) {
      return <CloudRain className="w-8 h-8 text-purple-400" />
    } else {
      return <Sun className="w-8 h-8 text-yellow-400" />
    }
  }

  const getGolfRecommendation = (weather: WeatherData) => {
    const temp = weather.temperature
    const windSpeed = weather.windSpeed
    const description = weather.description.toLowerCase()

    if (description.includes('rain') || description.includes('snow') || description.includes('thunder')) {
      return 'Not ideal for golf - consider indoor practice'
    }
    
    if (windSpeed > 20) {
      return 'High winds - challenging conditions'
    }
    
    if (temp < 50) {
      return 'Cold weather - dress warmly'
    }
    
    if (temp > 85) {
      return 'Hot weather - stay hydrated'
    }
    
    return 'Great conditions for golf!'
  }

  const formatTemperature = (temp: number) => {
    return `${Math.round(temp)}°F`
  }

  const formatWindSpeed = (speed: number) => {
    return `${Math.round(speed)} mph`
  }



  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-md rounded-2xl border border-blue-700/30 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-blue-300">Loading weather...</span>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className={`bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-md rounded-2xl border border-red-700/30 p-6 ${className}`}>
        <div className="text-center">
          <Cloud className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-300 font-medium">Weather Unavailable</p>
          <p className="text-red-400 text-sm mt-1">{error || 'Unable to fetch weather data'}</p>
          <button
            onClick={fetchWeather}
            className="mt-3 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-md rounded-2xl border border-blue-700/30 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">{weather.location}</h3>
        </div>
        <button
          onClick={fetchWeather}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {getWeatherIcon(weather.description)}
          <div>
            <div className="text-3xl font-bold text-white">
              {formatTemperature(weather.temperature)}
            </div>
            <div className="text-blue-300 text-sm capitalize">
              {weather.description}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-blue-300 text-sm">Feels like</div>
          <div className="text-white font-medium">
            {formatTemperature(weather.feelsLike)}
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <Wind className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-blue-300 text-xs">Wind</div>
            <div className="text-white font-medium">{formatWindSpeed(weather.windSpeed)}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Droplets className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-blue-300 text-xs">Humidity</div>
            <div className="text-white font-medium">{weather.humidity}%</div>
          </div>
        </div>
      </div>

      {/* Golf Recommendation */}
      <div className="bg-blue-800/20 rounded-xl p-4 border border-blue-600/30">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-400 font-medium text-sm">Golf Conditions</span>
        </div>
        <p className="text-blue-200 text-sm">{getGolfRecommendation(weather)}</p>
      </div>

      {/* Location Input */}
      <div className="mt-4">
        <div className="flex space-x-2 mb-2">
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Use Current Location</span>
          </button>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1 bg-blue-800/20 border border-blue-600/30 rounded-lg px-3 py-2 text-white placeholder-blue-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={fetchWeather}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
