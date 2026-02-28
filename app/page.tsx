import ChatInterface from '@/components/chat-interface'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Rhizome Recovery Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your compassionate companion for navigating addiction recovery — meetings, support, and hope
          </p>
        </div>
        <ChatInterface />
      </div>
    </main>
  )
}
