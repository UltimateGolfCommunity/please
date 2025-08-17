'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (session) {
          // User is authenticated, show success
          setStatus('success')
          setMessage('Email verified successfully! You can now sign in to your account.')
          
          // Redirect to login page after a delay
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        } else {
          // Check if there's an error in the URL
          const errorParam = searchParams.get('error')
          const errorDescription = searchParams.get('error_description')
          
          if (errorParam) {
            setStatus('error')
            setMessage(errorDescription || 'Authentication failed')
          } else {
            // Try to get the session from the URL hash
            const { data, error: hashError } = await supabase.auth.getSession()
            
            if (hashError || !data.session) {
              setStatus('error')
              setMessage('Email verification failed. Please try again.')
            } else {
              setStatus('success')
              setMessage('Email verified successfully! You can now sign in to your account.')
              
              setTimeout(() => {
                router.push('/auth/login')
              }, 3000)
            }
          }
        }
             } catch (error: unknown) {
        console.error('Auth callback error:', error)
        setStatus('error')
                 setMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="h-16 w-16 text-emerald-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Verifying Email...
              </h1>
              <p className="text-gray-300">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="text-sm text-gray-400">
                Redirecting to login page...
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="h-16 w-16 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <a
                  href="/auth/signup"
                  className="block w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Try Again
                </a>
                <a
                  href="/auth/login"
                  className="block w-full border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Go to Login
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-emerald-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Loading...
            </h1>
            <p className="text-gray-300">
              Please wait while we process your request.
            </p>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
