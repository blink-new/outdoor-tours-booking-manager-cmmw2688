import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Bookings } from './pages/Bookings'
import { BookingDetail } from './pages/BookingDetail'
import { Assets } from './pages/Assets'
import { Calendar } from './pages/Calendar'
import { Settings } from './pages/Settings'
import { BookingAttributesProvider } from './contexts/BookingAttributesContext'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Outdoor Tours</h1>
          <h2 className="text-xl text-muted-foreground mb-6">Booking Management System</h2>
          <p className="text-muted-foreground mb-8">
            Manage your outdoor tour bookings, track rental equipment, and schedule tours with ease.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const handleViewBooking = (bookingId: string) => {
    setCurrentBookingId(bookingId)
    setCurrentPage('booking-detail')
  }

  const handleBackToBookings = () => {
    setCurrentBookingId(null)
    setCurrentPage('bookings')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'bookings':
        return <Bookings onViewBooking={handleViewBooking} />
      case 'booking-detail':
        return currentBookingId ? (
          <BookingDetail 
            bookingId={currentBookingId} 
            onBack={handleBackToBookings}
          />
        ) : <Bookings onViewBooking={handleViewBooking} />
      case 'assets':
        return <Assets />
      case 'calendar':
        return <Calendar />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <BookingAttributesProvider>
      <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </AppLayout>
    </BookingAttributesProvider>
  )
}

export default App