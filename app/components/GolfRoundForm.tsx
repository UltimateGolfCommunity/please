'use client'

import { useState } from 'react'
import { Calendar, MapPin, Flag, Save, X, Plus, Minus } from 'lucide-react'

interface HoleDetail {
  hole_number: number
  par: number
  score: number
  putts: number
  fairway_hit: boolean
  green_in_regulation: boolean
  sand_saves: number
}

interface GolfRoundFormProps {
  onClose: () => void
  onSave: (roundData: any) => void
  userId: string
}

export default function GolfRoundForm({ onClose, onSave, userId }: GolfRoundFormProps) {
  const [formData, setFormData] = useState({
    course_name: '',
    date_played: new Date().toISOString().split('T')[0],
    total_score: '',
    par: '',
    holes_played: 18,
    weather_conditions: '',
    notes: ''
  })

  const [holeDetails, setHoleDetails] = useState<HoleDetail[]>(() => {
    // Initialize with 18 holes
    return Array.from({ length: 18 }, (_, i) => ({
      hole_number: i + 1,
      par: 4,
      score: 0,
      putts: 0,
      fairway_hit: false,
      green_in_regulation: false,
      sand_saves: 0
    }))
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHoleChange = (holeIndex: number, field: string, value: any) => {
    const newHoleDetails = [...holeDetails]
    newHoleDetails[holeIndex] = { ...newHoleDetails[holeIndex], [field]: value }
    setHoleDetails(newHoleDetails)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const roundData = {
        user_id: userId,
        course_name: formData.course_name,
        date_played: formData.date_played,
        total_score: parseInt(formData.total_score) || 0,
        par: parseInt(formData.par) || 72,
        holes_played: formData.holes_played,
        weather_conditions: formData.weather_conditions,
        notes: formData.notes,
        hole_details: holeDetails
      }

      await onSave(roundData)
      onClose()
    } catch (error) {
      console.error('Error saving golf round:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotalScore = () => {
    return holeDetails.reduce((total, hole) => total + hole.score, 0)
  }

  const calculateTotalPutts = () => {
    return holeDetails.reduce((total, hole) => total + hole.putts, 0)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-r from-forest-900/95 to-grass-900/95 backdrop-blur-xl border border-grass-400/30 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-grass-400 to-grass-600 bg-clip-text text-transparent flex items-center">
            <Flag className="h-8 w-8 mr-4 text-grass-400" />
            Record Golf Round
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Round Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-grass-300 mb-2">Course Name</label>
              <input
                type="text"
                value={formData.course_name}
                onChange={(e) => handleInputChange('course_name', e.target.value)}
                className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-grass-400 text-white placeholder-gray-400"
                placeholder="Enter course name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grass-300 mb-2">Date Played</label>
              <input
                type="date"
                value={formData.date_played}
                onChange={(e) => handleInputChange('date_played', e.target.value)}
                className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-grass-400 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grass-300 mb-2">Total Score</label>
              <input
                type="number"
                value={formData.total_score}
                onChange={(e) => handleInputChange('total_score', e.target.value)}
                className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-grass-400 text-white"
                placeholder="Enter total score"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grass-300 mb-2">Course Par</label>
              <input
                type="number"
                value={formData.par}
                onChange={(e) => handleInputChange('par', e.target.value)}
                className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-grass-400 text-white"
                placeholder="72"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grass-300 mb-2">Weather Conditions</label>
              <input
                type="text"
                value={formData.weather_conditions}
                onChange={(e) => handleInputChange('weather_conditions', e.target.value)}
                className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-grass-400 text-white placeholder-gray-400"
                placeholder="e.g., Sunny, 75°F"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grass-300 mb-2">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-3 bg-forest-800/50 border border-grass-400/30 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-grass-400 text-white placeholder-gray-400"
                placeholder="Any additional notes"
              />
            </div>
          </div>

          {/* Hole Details */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Hole Details</h3>
            <div className="bg-forest-800/30 rounded-xl p-4">
              <div className="grid grid-cols-8 gap-2 mb-4 text-xs text-grass-300 font-medium">
                <div>Hole</div>
                <div>Par</div>
                <div>Score</div>
                <div>Putts</div>
                <div>Fairway</div>
                <div>GIR</div>
                <div>Sand</div>
                <div>Total</div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {holeDetails.map((hole, index) => (
                  <div key={index} className="grid grid-cols-8 gap-2 items-center">
                    <div className="text-center text-sm text-white font-medium">{hole.hole_number}</div>
                    
                    <input
                      type="number"
                      value={hole.par}
                      onChange={(e) => handleHoleChange(index, 'par', parseInt(e.target.value) || 4)}
                      className="w-12 px-2 py-1 bg-forest-700/50 border border-grass-400/20 rounded text-center text-white text-sm"
                      min="3"
                      max="6"
                    />
                    
                    <input
                      type="number"
                      value={hole.score}
                      onChange={(e) => handleHoleChange(index, 'score', parseInt(e.target.value) || 0)}
                      className="w-12 px-2 py-1 bg-forest-700/50 border border-grass-400/20 rounded text-center text-white text-sm"
                      min="1"
                      max="10"
                    />
                    
                    <input
                      type="number"
                      value={hole.putts}
                      onChange={(e) => handleHoleChange(index, 'putts', parseInt(e.target.value) || 0)}
                      className="w-12 px-2 py-1 bg-forest-700/50 border border-grass-400/20 rounded text-center text-white text-sm"
                      min="1"
                      max="5"
                    />
                    
                    <input
                      type="checkbox"
                      checked={hole.fairway_hit}
                      onChange={(e) => handleHoleChange(index, 'fairway_hit', e.target.checked)}
                      className="w-4 h-4 text-grass-500 bg-forest-700 border-grass-400 rounded focus:ring-grass-500"
                    />
                    
                    <input
                      type="checkbox"
                      checked={hole.green_in_regulation}
                      onChange={(e) => handleHoleChange(index, 'green_in_regulation', e.target.checked)}
                      className="w-4 h-4 text-grass-500 bg-forest-700 border-grass-400 rounded focus:ring-grass-500"
                    />
                    
                    <input
                      type="number"
                      value={hole.sand_saves}
                      onChange={(e) => handleHoleChange(index, 'sand_saves', parseInt(e.target.value) || 0)}
                      className="w-12 px-2 py-1 bg-forest-700/50 border border-grass-400/20 rounded text-center text-white text-sm"
                      min="0"
                      max="3"
                    />
                    
                    <div className="text-center text-sm text-grass-400 font-medium">
                      {hole.score > 0 ? hole.score : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-grass-900/30 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-grass-300 mb-3">Round Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-grass-400">{calculateTotalScore()}</div>
                <div className="text-sm text-grass-300">Total Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-grass-400">{calculateTotalPutts()}</div>
                <div className="text-sm text-grass-300">Total Putts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-grass-400">
                  {holeDetails.filter(h => h.green_in_regulation).length}
                </div>
                <div className="text-sm text-grass-300">Greens in Regulation</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-grass-500 to-grass-600 hover:from-grass-600 hover:to-grass-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Round
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
