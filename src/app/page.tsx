'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ChatMessage, { Message } from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'
import ConfigPanel, { TripConfig } from '@/components/chat/ConfigPanel'
import ThreeLoader from '@/components/ui/ThreeLoader'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import UserMenu from '@/components/auth/UserMenu'
import { useAuth } from '@/contexts/AuthContext'
import { createChatSession, saveMessage, getSessionMessages, getUserChatSessions, ChatSession } from '@/lib/chat-history'
import { Loader2, MapIcon, MessageSquare, Calendar, Settings, Plus, X, Map as MapIconLucide } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PuneWandererLogo from '@/components/brand/PuneWandererLogo'

// Dynamic import for map
const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-muted/20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

import TripCalendar from '@/components/calendar/TripCalendar'

// Dynamic imports for effects (client-side only)
const ParticleWaveBackground = dynamic(() => import('@/components/effects/ParticleWaveBackground'), {
  ssr: false,
})
const Particles = dynamic(() => import('@/components/effects/Particles'), {
  ssr: false,
})

const QUICK_PROMPTS = [
  {
    title: 'Weekend Trip',
    description: 'Plan a 2-day itinerary in Pune',
  },
  {
    title: 'Best Cafes',
    description: 'Find top cafes for work & coffee',
  },
  {
    title: 'Food Tour',
    description: 'Explore Pune\'s best restaurants',
  },
]

export default function Home() {
  const { user } = useAuth()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeView, setActiveView] = useState<'chat' | 'map' | 'calendar'>('chat')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [mapPlaces, setMapPlaces] = useState<any[]>([])
  const [mapRoute, setMapRoute] = useState<string[]>([])
  const [config, setConfig] = useState<TripConfig>({
    budget: 'moderate',
    days: 1,
    pace: 'moderate',
    interests: [],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize or load session from localStorage
  useEffect(() => {
    if (!user) return

    const loadOrCreateSession = async () => {
      const lastSessionId = localStorage.getItem(`lastSessionId_${user.uid}`)

      if (lastSessionId) {
        try {
          const sessionMessages = await getSessionMessages(lastSessionId)
          setCurrentSessionId(lastSessionId)
          setMessages(sessionMessages)
        } catch (error) {
          console.error('Error loading last session:', error)
          await createNewSession()
        }
      } else {
        await createNewSession()
      }
    }

    loadOrCreateSession()
    loadSessions()
  }, [user])

  const loadSessions = async () => {
    if (!user) return
    try {
      const userSessions = await getUserChatSessions(user.uid)
      setSessions(userSessions)
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const createNewSession = async () => {
    if (!user) return

    try {
      const sessionId = await createChatSession(user.uid, 'New Chat')
      setCurrentSessionId(sessionId)
      setMessages([])
      setMapPlaces([])
      setMapRoute([])
      localStorage.setItem(`lastSessionId_${user.uid}`, sessionId)
      await loadSessions()
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const handleNewChat = async () => {
    await createNewSession()
  }

  const handleSessionSelect = async (sessionId: string) => {
    if (!user) return

    try {
      const sessionMessages = await getSessionMessages(sessionId)
      setCurrentSessionId(sessionId)
      setMessages(sessionMessages)
      setMapPlaces([])
      setMapRoute([])
      localStorage.setItem(`lastSessionId_${user.uid}`, sessionId)
      setShowSidebar(false)
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!user || !currentSessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    // Removed: setShowMap(true) here, wait for result

    try {
      await saveMessage(currentSessionId, userMessage, user.uid)
    } catch (error) {
      console.error('Error saving user message:', error)
    }

    try {
      const response = await fetch('/api/agentic-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          config: config,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          places: data.places || [],
          events: data.events || [],
          timestamp: new Date(),
          followUpQuestions: data.followUpQuestions || [],
          showEventSuggestion: data.showEventSuggestion || false,
        }
        setMessages(prev => [...prev, assistantMessage])

        try {
          await saveMessage(currentSessionId, assistantMessage, user.uid)
          await loadSessions()
        } catch (error) {
          console.error('Error saving assistant message:', error)
        }

        if (data.places && data.places.length > 0) {
          setMapPlaces(data.places)
          setMapRoute(data.route || data.places.map((p: any) => p.id))
          setShowMap(true) // Auto-open map logic
        }
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const handlePlaceClick = (place: any) => {
    setMapPlaces([place])
    setMapRoute([place.id])
    setShowMap(true)
  }

  const handleSidebarMouseEnter = () => {
    if (sidebarTimeoutRef.current) {
      clearTimeout(sidebarTimeoutRef.current)
    }
    setShowSidebar(true)
  }

  const handleSidebarMouseLeave = () => {
    sidebarTimeoutRef.current = setTimeout(() => {
      setShowSidebar(false)
    }, 300)
  }

  const showWelcome = messages.length === 0
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Raf'

  return (
    <ProtectedRoute>
      <div className="h-screen flex relative overflow-hidden">
        {/* Three.js Wavy Background */}
        <ParticleWaveBackground />

        {/* Floating Particles */}
        <Particles />

        {/* Animated Orb Background */}
        <div className="orb-background" />
        <div className="grid-pattern" />

        {/* Premium Merged Sidebar */}
        <div
          className={`glass-panel flex flex-row h-full relative z-20 border-r border-white/5 shadow-[5px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${showSidebar ? 'w-80' : 'w-16'}`}
        >
          {/* Fixed Icon Strip */}
          <div className="w-16 flex flex-col items-center py-6 gap-6 border-r border-white/5 bg-black/20 shrink-0">
            {/* Animated Logo */}
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-10 h-10 bg-[#0A0A0A] border border-white/10 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300 overflow-hidden p-1">
                <PuneWandererLogo className="w-full h-full" />
              </div>
            </div>

            {/* Navigation Divider */}
            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            {/* Navigation Icons */}
            <div className="flex-1 flex flex-col gap-4 w-full items-center">

              {/* New Chat */}
              <button
                onClick={() => {
                  handleNewChat();
                  setActiveView('chat');
                  setShowSidebar(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 text-white shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 group relative"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-cyan-400" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1A1A1A] border border-white/10 text-white text-xs rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  New Trip
                </div>
              </button>

              {/* Chat History Toggle */}
              <button
                onClick={() => {
                  setActiveView('chat');
                  setShowSidebar(!showSidebar);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group relative border ${activeView === 'chat'
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10 text-white/40 hover:text-white'
                  }`}
              >
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1A1A1A] border border-white/10 text-white text-xs rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  {showSidebar ? 'Close History' : 'Chat History'}
                </div>
              </button>

              {/* Map View */}
              <button
                onClick={async () => {
                  setShowMap(true);
                  setActiveView('map');
                  setShowSidebar(false);
                  if (mapPlaces.length === 0) {
                    try {
                      const response = await fetch('/api/graph/subgraph?placeId=all');
                      const data = await response.json();
                      if (data.success && data.places) {
                        setMapPlaces(data.places);
                        setMapRoute(data.places.map((p: any) => p.id));
                      }
                    } catch (error) {
                      console.error('Error loading places:', error);
                    }
                  }
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group relative border ${activeView === 'map'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10 text-white/40 hover:text-white'
                  }`}
              >
                <MapIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1A1A1A] border border-white/10 text-white text-xs rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  Map Explorer
                </div>
              </button>

              {/* Calendar View */}
              <button
                onClick={() => {
                  setActiveView('calendar');
                  setShowSidebar(false);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group relative border ${activeView === 'calendar'
                  ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10 text-white/40 hover:text-white'
                  }`}
              >
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1A1A1A] border border-white/10 text-white text-xs rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  Itinerary
                </div>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 w-full items-center pb-4">
              <button
                onClick={() => {
                  console.log('Settings button clicked! Setting showSettings to true.');
                  setShowSettings(true);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all duration-300 group relative">
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>
          </div>

          {/* Collapsible History Panel - Merged */}
          <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${showSidebar ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
            <div className="p-5 border-b border-white/5">
              <h2 className="text-white font-medium text-base tracking-tight">Your Trips</h2>
              <p className="text-white/40 text-[10px] mt-1 uppercase tracking-wider">Recent conversations</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-white/30 text-xs border border-dashed border-white/10 rounded-xl mt-4">
                  No chat history.<br />Start a new trip!
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionSelect(session.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 group border ${currentSessionId === session.id
                      ? 'bg-white/5 border-white/10 shadow-lg'
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                      }`}
                  >
                    <p className={`text-sm font-medium truncate transition-colors ${currentSessionId === session.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                      {session.title}
                    </p>
                    {session.lastMessage && (
                      <p className="text-xs text-white/40 truncate mt-0.5 group-hover:text-white/50">
                        {session.lastMessage}
                      </p>
                    )}
                    <p className="text-[10px] text-white/20 mt-1.5 font-mono">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {/* Premium Top Bar with Gradient Theme */}
          <div className="h-16 glass-panel flex items-center justify-between px-8 border-b border-white/10 animate-slide-in-right shrink-0 relative z-30">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-white via-pink-400 to-violet-600 bg-clip-text text-transparent">
                PuneWanderer
              </h1>
              <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-pink-500/10 to-violet-500/10 text-pink-400 rounded-full border border-pink-500/20 animate-pulse">
                AI-Powered
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Map Toggle Button */}
              {activeView === 'chat' && mapPlaces.length > 0 && (
                <Button
                  onClick={() => setShowMap(!showMap)}
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${showMap ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/70 hover:text-white'}`}
                >
                  <MapIconLucide className="w-4 h-4" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              )}
              <UserMenu showName={true} />
            </div>
          </div>

          {/* Main Content Area - Conditional Rendering */}
          <div className="flex-1 overflow-hidden relative flex">
            {/* Chat/Calendar Area */}
            <div className={`flex-1 overflow-hidden relative transition-all duration-300 ${showMap && activeView === 'chat' ? 'mr-[400px]' : ''}`}>
              {activeView === 'calendar' ? (
                /* Trip Calendar View */
                <TripCalendar />
              ) : activeView === 'map' ? (
                /* Map View - Show all places */
                <div className="h-full">
                  {mapPlaces.length > 0 ? (
                    <RouteMap places={mapPlaces} route={mapRoute} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
                        <p className="text-white/60">Loading places...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : showWelcome ? (
                // ... Welcome Screen ...
                <div className="h-full flex items-center justify-center px-4 overflow-y-auto">
                  <div className="max-w-3xl w-full py-10">
                    <div className="mb-8 animate-fade-in">
                      <h1 className="animated-gradient-text font-normal text-5xl leading-tight mb-1">
                        Hello there,
                      </h1>
                      <br />
                      <h1 className="animated-gradient-text font-normal text-5xl leading-tight">
                        How can I help you?
                      </h1>
                      <p className="text-white/50 leading-tight tracking-tight mt-6 text-lg">
                        Use one of the most common prompts below <br />
                        or use one of your own prompt to begin
                      </p>
                    </div>

                    {/* Premium Quick Prompts with Arrows */}
                    <div className="flex w-full mb-8 gap-3 text-sm">
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickPrompt(prompt.description)}
                          className="group relative grow border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-[2px] hover:bg-white/5 rounded-xl p-4 transition-all duration-300 text-white/80 hover:text-white text-left"
                        >
                          {prompt.description}
                          <svg
                            className="absolute right-2 bottom-2 h-4 text-white/50 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                          >
                            <path d="M2 8a.75.75 0 0 1 .75-.75h8.787L8.25 4.309a.75.75 0 0 1 1-1.118L14 7.441a.75.75 0 0 1 0 1.118l-4.75 4.25a.75.75 0 1 1-1-1.118l3.287-2.941H2.75A.75.75 0 0 1 2 8z" fill="currentColor" />
                          </svg>
                        </button>
                      ))}
                    </div>

                    {/* Premium Input Box */}
                    <div className="relative z-20">
                      <ChatInput onSend={handleSendMessage} disabled={loading} />
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="max-w-3xl mx-auto space-y-4">
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          onPlaceClick={handlePlaceClick}
                          onFollowUpClick={handleSendMessage}
                        />
                      ))}
                      {loading && (
                        <div className="flex gap-3 p-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            <p className="text-sm text-white/60">Thinking...</p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <div className="border-t border-white/10 px-4 py-4 backdrop-blur-md bg-black/10 shrink-0">
                    <div className="max-w-3xl mx-auto">
                      <ChatInput onSend={handleSendMessage} disabled={loading} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Map Overlay/Panel */}
            {activeView === 'chat' && showMap && (
              <div className="absolute top-0 right-0 bottom-0 w-[400px] bg-black/40 backdrop-blur-xl border-l border-white/10 shadow-2xl z-30 animate-slide-in-right">
                <div className="h-full relative flex flex-col">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <MapIconLucide className="w-4 h-4 text-cyan-400" />
                      Trip Map
                    </h3>
                    <button
                      onClick={() => setShowMap(false)}
                      className="text-white/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    {/* Map goes here */}
                    {mapPlaces.length > 0 ? (
                      <RouteMap places={mapPlaces} route={mapRoute} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/40 p-4 text-center">
                        <MapIconLucide className="w-12 h-12 mb-2 opacity-20" />
                        <p>No places found yet.</p>
                        <p className="text-xs mt-1">Ask the AI to find places!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Config Panel */}
      <ConfigPanel
        config={config}
        onChange={setConfig}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </ProtectedRoute>
  )
}