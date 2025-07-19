/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode } from 'react'
import { BookingAttribute, DEFAULT_BOOKING_ATTRIBUTES } from '@/types/booking'

export interface BookingAttributesContextType {
  attributes: BookingAttribute[]
  setAttributes: (attributes: BookingAttribute[]) => void
  getAttributeByName: (name: string) => BookingAttribute | undefined
  getSortedAttributes: () => BookingAttribute[]
}

export const BookingAttributesContext = createContext<BookingAttributesContextType | undefined>(undefined)

export function BookingAttributesProvider({ children }: { children: ReactNode }) {
  const [attributes, setAttributesState] = useState<BookingAttribute[]>(DEFAULT_BOOKING_ATTRIBUTES)

  // Load attributes from localStorage on mount
  useEffect(() => {
    // Clear old attributes and use new defaults
    localStorage.removeItem('booking-attributes')
    setAttributesState(DEFAULT_BOOKING_ATTRIBUTES)
  }, [])

  // Save attributes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('booking-attributes', JSON.stringify(attributes))
  }, [attributes])

  const setAttributes = (newAttributes: BookingAttribute[]) => {
    setAttributesState(newAttributes)
  }

  const getAttributeByName = (name: string) => {
    return attributes.find(attr => attr.name === name)
  }

  const getSortedAttributes = () => {
    return [...attributes].sort((a, b) => a.order - b.order)
  }

  const value = {
    attributes,
    setAttributes,
    getAttributeByName,
    getSortedAttributes
  }

  return (
    <BookingAttributesContext.Provider value={value}>
      {children}
    </BookingAttributesContext.Provider>
  )
}