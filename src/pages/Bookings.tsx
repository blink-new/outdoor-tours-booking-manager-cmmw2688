import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Users, Mail, Phone, MapPin, Package, Search, Filter, Eye, Upload, BookOpen } from 'lucide-react'
import { CSVImporter } from '@/components/CSVImporter'
import { useBookingAttributes } from '@/hooks/useBookingAttributes'

interface BookingsProps {
  onViewBooking?: (bookingId: string) => void
}

export function Bookings({ onViewBooking }: BookingsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { getAttributeByName } = useBookingAttributes()

  // Mock data for demonstration
  const bookings = [
    {
      id: 'BK001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '+1 234 567 8900',
      tourName: 'Mountain Hiking Adventure',
      tourDate: '2024-01-20',
      tourTime: '09:00',
      participants: 2,
      status: 'confirmed',
      bookingPlatform: 'GetYourGuide',
      totalPrice: 150,
      specialRequirements: 'Vegetarian lunch required',
      assignedBackpack: 'BP-001'
    },
    {
      id: 'BK002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      customerPhone: '+1 234 567 8901',
      tourName: 'Forest Trail Experience',
      tourDate: '2024-01-20',
      tourTime: '14:00',
      participants: 4,
      status: 'pending',
      bookingPlatform: 'Website',
      totalPrice: 280,
      specialRequirements: null,
      assignedBackpack: null
    },
    {
      id: 'BK003',
      customerName: 'Mike Wilson',
      customerEmail: 'mike.wilson@email.com',
      customerPhone: '+1 234 567 8902',
      tourName: 'Sunset Valley Tour',
      tourDate: '2024-01-21',
      tourTime: '16:00',
      participants: 1,
      status: 'confirmed',
      bookingPlatform: 'Viator',
      totalPrice: 85,
      specialRequirements: 'Photography equipment needed',
      assignedBackpack: 'BP-003'
    }
  ]

  // Get status attribute configuration
  const statusAttribute = getAttributeByName('status')
  const statusOptions = statusAttribute?.options || ['pending', 'confirmed', 'completed', 'cancelled']

  const getStatusColor = (status: string) => {
    // Dynamic color mapping based on common status patterns
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes('confirm') || statusLower.includes('accept') || statusLower.includes('approv')) {
      return 'bg-green-100 text-green-800'
    }
    if (statusLower.includes('pending') || statusLower.includes('wait') || statusLower.includes('review')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    if (statusLower.includes('complet') || statusLower.includes('finish') || statusLower.includes('done')) {
      return 'bg-blue-100 text-blue-800'
    }
    if (statusLower.includes('cancel') || statusLower.includes('reject') || statusLower.includes('decline')) {
      return 'bg-red-100 text-red-800'
    }
    if (statusLower.includes('draft') || statusLower.includes('new')) {
      return 'bg-gray-100 text-gray-800'
    }
    if (statusLower.includes('progress') || statusLower.includes('active')) {
      return 'bg-purple-100 text-purple-800'
    }
    
    // Default fallback
    return 'bg-gray-100 text-gray-800'
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage tour bookings and assignments</p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            All Bookings
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          {/* Filters and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1" />
            <Button className="bg-primary hover:bg-primary/90">
              Add Booking
            </Button>
          </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{booking.customerName}</CardTitle>
                  <p className="text-sm text-muted-foreground">#{booking.id}</p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">{booking.tourName}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {booking.tourDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.tourTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {booking.participants} people
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {booking.bookingPlatform}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm">
                  <span className="font-medium">${booking.totalPrice}</span>
                  {booking.assignedBackpack && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Package className="w-3 h-3" />
                      {booking.assignedBackpack}
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewBooking?.(booking.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first booking'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="import">
          <CSVImporter />
        </TabsContent>
      </Tabs>
    </div>
  )
}