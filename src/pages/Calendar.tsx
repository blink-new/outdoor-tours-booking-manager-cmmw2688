import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, MapPin, Package, Clock, MessageCircle } from 'lucide-react'
import { blink } from '@/blink/client'

interface Booking {
  id: string
  clientFirstName: string
  clientLastName: string
  bookedTour: string
  bookingDate: string
  tourTime: string
  numberOfPlayers: number
  status: string
  city?: string
  assignedAsset1?: string
  assignedAsset2?: string
}

interface Asset {
  id: string
  name: string
  type: string
  brand: string
  model: string
  size: string
  color: string
  condition: string
  status: string
  assignedBookingId?: string
}

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showAssetDialog, setShowAssetDialog] = useState(false)

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format date for database query (YYYY-MM-DD)
  const formatDateForDB = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Parse time string to minutes for sorting
  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0
    const [hours, minutes] = timeStr.split(':').map(Number)
    return (hours || 0) * 60 + (minutes || 0)
  }

  // Load bookings for selected date
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      const dateStr = formatDateForDB(selectedDate)
      
      const result = await blink.db.bookings.list({
        where: { bookingDate: dateStr }
      })
      
      // Sort bookings by tour time (earliest first)
      const sortedBookings = (result || []).sort((a, b) => {
        const timeA = parseTimeToMinutes(a.tourTime)
        const timeB = parseTimeToMinutes(b.tourTime)
        return timeA - timeB
      })
      
      setBookings(sortedBookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // Load available assets
  const loadAssets = useCallback(async () => {
    try {
      const result = await blink.db.assets.list({
        where: { status: 'available' }
      })
      setAssets(result || [])
    } catch (error) {
      console.error('Error loading assets:', error)
      setAssets([])
    }
  }, [])

  useEffect(() => {
    loadBookings()
    loadAssets()
  }, [loadBookings, loadAssets])

  // Navigate dates
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  // Handle booking click to assign asset
  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowAssetDialog(true)
  }

  // Assign asset to booking
  const assignAsset = async (assetId: string, slotNumber: 1 | 2) => {
    if (!selectedBooking) return

    try {
      const updateField = slotNumber === 1 ? 'assignedAsset1' : 'assignedAsset2'
      
      // Update booking with assigned asset
      await blink.db.bookings.update(selectedBooking.id, {
        [updateField]: assetId
      })

      // Update asset status and assigned booking
      await blink.db.assets.update(assetId, {
        status: 'in-use',
        assignedBookingId: selectedBooking.id
      })

      // Refresh data
      await loadBookings()
      await loadAssets()
      
      console.log(`Successfully assigned asset ${assetId} to slot ${slotNumber} for booking ${selectedBooking.id}`)
      
      // Don't close dialog - allow assigning second asset
      // setShowAssetDialog(false)
      // setSelectedBooking(null)
    } catch (error) {
      console.error('Error assigning asset:', error)
      alert('Failed to assign asset. Please try again.')
    }
  }

  // Remove asset assignment
  const removeAssetAssignment = async (booking: Booking, slotNumber?: 1 | 2) => {
    try {
      const updates: any = {}
      const assetUpdates: string[] = []

      if (slotNumber === 1 && booking.assignedAsset1) {
        updates.assignedAsset1 = null
        assetUpdates.push(booking.assignedAsset1)
      } else if (slotNumber === 2 && booking.assignedAsset2) {
        updates.assignedAsset2 = null
        assetUpdates.push(booking.assignedAsset2)
      } else if (!slotNumber) {
        // Remove both assets if no specific slot
        if (booking.assignedAsset1) {
          updates.assignedAsset1 = null
          assetUpdates.push(booking.assignedAsset1)
        }
        if (booking.assignedAsset2) {
          updates.assignedAsset2 = null
          assetUpdates.push(booking.assignedAsset2)
        }
      }

      if (Object.keys(updates).length === 0) return

      // Update booking to remove asset assignment(s)
      await blink.db.bookings.update(booking.id, updates)

      // Update asset status back to available
      for (const assetId of assetUpdates) {
        await blink.db.assets.update(assetId, {
          status: 'available',
          assignedBookingId: null
        })
      }

      console.log(`Successfully removed asset assignments for booking ${booking.id}`)

      // Refresh data
      await loadBookings()
      await loadAssets()
    } catch (error) {
      console.error('Error removing asset assignment:', error)
      alert('Failed to remove asset assignment. Please try again.')
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get booking card style based on asset assignment
  const getBookingCardStyle = (booking: Booking) => {
    const hasAsset1 = booking.assignedAsset1
    const hasAsset2 = booking.assignedAsset2
    
    if (hasAsset1 && hasAsset2) {
      return 'border-green-200 bg-green-50 hover:bg-green-100'
    } else if (hasAsset1 || hasAsset2) {
      return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
    }
    return 'hover:shadow-md'
  }

  // Get asset assignment status text
  const getAssetStatusText = (booking: Booking) => {
    const hasAsset1 = booking.assignedAsset1
    const hasAsset2 = booking.assignedAsset2
    
    if (hasAsset1 && hasAsset2) {
      return 'Both Assets Assigned'
    } else if (hasAsset1 || hasAsset2) {
      return 'Partially Assigned'
    }
    return 'No Assets Assigned'
  }

  // Get asset status color
  const getAssetStatusColor = (booking: Booking) => {
    const hasAsset1 = booking.assignedAsset1
    const hasAsset2 = booking.assignedAsset2
    
    if (hasAsset1 && hasAsset2) {
      return 'text-green-600'
    } else if (hasAsset1 || hasAsset2) {
      return 'text-yellow-600'
    }
    return 'text-gray-500'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Date Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button onClick={goToPreviousDay} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} scheduled
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={goToNextDay} variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button onClick={goToToday} variant="outline" size="sm">
                Today
              </Button>
              <Button 
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                size="sm"
                onClick={() => {
                  // TODO: Implement WhatsApp welcome message functionality
                  console.log('Send WhatsApp welcome messages')
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send WA Welcome messages
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-600">Loading bookings...</div>
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-600">
                No bookings scheduled for this date
              </div>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card 
              key={booking.id} 
              className={`cursor-pointer transition-all ${getBookingCardStyle(booking)}`}
              onClick={() => handleBookingClick(booking)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-6">
                      {/* Prominent Time Display */}
                      <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        <div className="text-xl font-bold text-primary">
                          {booking.tourTime || 'No time set'}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {booking.bookedTour}
                        </h3>
                        <p className="text-gray-600">
                          {booking.clientFirstName} {booking.clientLastName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{booking.numberOfPlayers} participants</span>
                      </div>
                      {booking.city && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.city}</span>
                        </div>
                      )}
                      <div className={`flex items-center space-x-1 ${getAssetStatusColor(booking)}`}>
                        <Package className="h-4 w-4" />
                        <span>{getAssetStatusText(booking)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    {(booking.assignedAsset1 || booking.assignedAsset2) ? (
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeAssetAssignment(booking)
                          }}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Remove All
                        </Button>
                        <Button variant="outline" size="sm">
                          <Package className="h-4 w-4 mr-1" />
                          Manage Assets
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4 mr-1" />
                        Assign Assets
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Asset Assignment Dialog */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Asset Assignment</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Tour:</strong> {selectedBooking.bookedTour}</div>
                  <div><strong>Time:</strong> {selectedBooking.tourTime}</div>
                  <div><strong>Client:</strong> {selectedBooking.clientFirstName} {selectedBooking.clientLastName}</div>
                  <div><strong>Participants:</strong> {selectedBooking.numberOfPlayers}</div>
                </div>
              </div>

              {/* Current Asset Assignments */}
              <div className="grid grid-cols-2 gap-6">
                {/* Asset Slot 1 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Asset Slot 1</h4>
                    {selectedBooking.assignedAsset1 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => removeAssetAssignment(selectedBooking, 1)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {selectedBooking.assignedAsset1 ? (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="font-medium text-green-800">Asset Assigned</div>
                      <div className="text-sm text-green-600">ID: {selectedBooking.assignedAsset1}</div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-gray-600">No asset assigned</div>
                    </div>
                  )}
                </div>

                {/* Asset Slot 2 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Asset Slot 2</h4>
                    {selectedBooking.assignedAsset2 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => removeAssetAssignment(selectedBooking, 2)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {selectedBooking.assignedAsset2 ? (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="font-medium text-green-800">Asset Assigned</div>
                      <div className="text-sm text-green-600">ID: {selectedBooking.assignedAsset2}</div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-gray-600">No asset assigned</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Assets */}
              <div>
                <h4 className="font-medium mb-3">Available Assets</h4>
                {assets.length === 0 ? (
                  <p className="text-gray-600">No available assets</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-gray-600">
                            {asset.brand} {asset.model} - {asset.size} - {asset.color}
                          </div>
                          <div className="text-xs text-gray-500">
                            Condition: {asset.condition}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={selectedBooking.assignedAsset1 === asset.id}
                            onClick={() => assignAsset(asset.id, 1)}
                          >
                            Assign to Slot 1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={selectedBooking.assignedAsset2 === asset.id}
                            onClick={() => assignAsset(asset.id, 2)}
                          >
                            Assign to Slot 2
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAssetDialog(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Day Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {bookings.length}
                </div>
                <div className="text-sm text-gray-600">Total Tours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {bookings.reduce((sum, booking) => sum + booking.numberOfPlayers, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.assignedAsset1 && b.assignedAsset2).length}
                </div>
                <div className="text-sm text-gray-600">Fully Equipped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}