'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, RefreshCw, LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signIn, signOut } from 'next-auth/react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi, I'm Rhizome, your recovery guide. Are you someone in need of help for your issue with addiction, or are you here trying to find help for a loved one? Either way, we'll make sure you get the help you need."
}

export default function ChatInterface() {
  const { data: session, status } = useSession() || {}
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView?.({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation history when user logs in
  useEffect(() => {
    if (session?.user) {
      loadConversationHistory()
    }
  }, [session])

  const loadConversationHistory = async () => {
    try {
      const response = await fetch('/api/chat', { method: 'GET' })
      if (response.ok) {
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          setMessages([INITIAL_MESSAGE, ...data.messages])
        }
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (authMode === 'signup') {
      // Signup
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        })

        if (response.ok) {
          // Auto-login after signup
          const result = await signIn('credentials', {
            identifier,
            password,
            redirect: false
          })

          if (result?.ok) {
            setShowAuth(false)
            setIdentifier('')
            setPassword('')
          } else {
            setAuthError('Failed to login after signup')
          }
        } else {
          const data = await response.json()
          setAuthError(data.error || 'Signup failed')
        }
      } catch (error) {
        setAuthError('An error occurred during signup')
      }
    } else {
      // Login
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false
      })

      if (result?.ok) {
        setShowAuth(false)
        setIdentifier('')
        setPassword('')
      } else {
        setAuthError('Invalid email/nickname or password')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input?.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...(prev ?? []), { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...(messages ?? []), { role: 'user', content: userMessage }],
          saveMessage: !!session?.user
        }),
      })

      if (!response?.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response?.body?.getReader?.()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk?.split?.('\n') ?? []

          for (const line of lines) {
            if (line?.startsWith?.('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed?.choices?.[0]?.delta?.content ?? ''
                if (content) {
                  assistantMessage += content
                  setMessages(prev => {
                    const newMessages = [...(prev ?? [])]
                    if (newMessages?.[newMessages.length - 1]?.role === 'assistant') {
                      newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: assistantMessage
                      }
                    } else {
                      newMessages.push({ role: 'assistant', content: assistantMessage })
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...(prev ?? []),
        {
          role: 'assistant',
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
        }
      ])
    } finally {
      setIsLoading(false)
      inputRef?.current?.focus?.()
    }
  }

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE])
    setInput('')
    inputRef?.current?.focus?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header with auth */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600">Rhizome — Recovery Guide</h1>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <User className="w-4 h-4" />
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && !session?.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {authMode === 'login'
                ? 'Login to save your conversation history'
                : 'Create an account to remember your conversations across devices'}
            </p>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email or Nickname
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              {authError && (
                <p className="text-sm text-red-600">{authError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuth(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
            <p className="text-sm text-center mt-4">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signup')
                      setAuthError('')
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login')
                      setAuthError('')
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-white rounded-lg shadow-sm p-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div 
                    className="whitespace-pre-wrap prose prose-sm max-w-none prose-a:text-blue-600 prose-a:underline prose-a:font-semibold hover:prose-a:text-blue-700"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          disabled={isLoading}
        />
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </form>

      {session?.user && (
        <p className="text-xs text-center text-gray-500 mt-2">
          Your conversation is being saved
        </p>
      )}
      {!session?.user && (
        <p className="text-xs text-center text-gray-500 mt-2">
          <button
            onClick={() => setShowAuth(true)}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>{' '}
          to save your conversation history
        </p>
      )}
    </div>
  )
}
