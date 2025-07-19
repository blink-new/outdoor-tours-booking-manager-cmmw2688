import { useContext } from 'react'
import { BookingAttributesContext } from '@/contexts/BookingAttributesContext'

export function useBookingAttributes() {
  const context = useContext(BookingAttributesContext)
  if (context === undefined) {
    throw new Error('useBookingAttributes must be used within a BookingAttributesProvider')
  }
  return context
}