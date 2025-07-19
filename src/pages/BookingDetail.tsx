import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, Edit, X, Check, Calendar, Clock, Users, Mail, Phone, MapPin, Package, DollarSign } from 'lucide-react'
import { useBookingAttributes } from '@/hooks/useBookingAttributes'
import { BookingAttribute } from '@/types/booking'
import { blink } from '@/blink/client'

interface BookingDetailProps {
  bookingId: string
  onBack: () => void
}

export function BookingDetail({ bookingId, onBack }: BookingDetailProps) {
  const [booking, setBooking] = useState<any>(null)
  const [editedBooking, setEditedBooking] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { attributes } = useBookingAttributes()



  useEffect(() => {
    // Mock data - in real app, this would fetch from database
    const mockBookings = [
      {
        id: 'BK001',
        customer_name: 'John Smith',
        customer_email: 'john.smith@email.com',
        customer_phone: '+1 234 567 8900',
        tour_name: 'Mountain Hiking Adventure',
        tour_date: '2024-01-20',
        tour_time: '09:00',
        participants: 2,
        status: 'confirmed',
        booking_platform: 'GetYourGuide',
        total_price: 150,
        special_requirements: 'Vegetarian lunch required',
        assigned_backpack: 'BP-001',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:20:00Z'
      },
      {
        id: 'BK002',
        customer_name: 'Sarah Johnson',
        customer_email: 'sarah.j@email.com',
        customer_phone: '+1 234 567 8901',
        tour_name: 'Forest Trail Experience',
        tour_date: '2024-01-20',
        tour_time: '14:00',
        participants: 4,
        status: 'pending',
        booking_platform: 'Website',
        total_price: 280,
        special_requirements: '',
        assigned_backpack: '',
        created_at: '2024-01-16T09:15:00Z',
        updated_at: '2024-01-16T09:15:00Z'
      },
      {
        id: 'BK003',
        customer_name: 'Mike Wilson',
        customer_email: 'mike.wilson@email.com',
        customer_phone: '+1 234 567 8902',
        tour_name: 'Sunset Valley Tour',
        tour_date: '2024-01-21',
        tour_time: '16:00',
        participants: 1,
        status: 'confirmed',
        booking_platform: 'Viator',
        total_price: 85,
        special_requirements: 'Photography equipment needed',
        assigned_backpack: 'BP-003',
        created_at: '2024-01-14T16:45:00Z',
        updated_at: '2024-01-17T11:30:00Z'
      }
    ]

    // Simulate loading booking data
    const loadBooking = async () => {
      setLoading(true)
      // In real app: const booking = await blink.db.bookings.get(bookingId)
      const foundBooking = mockBookings.find(b => b.id === bookingId)
      if (foundBooking) {
        setBooking(foundBooking)
        setEditedBooking({ ...foundBooking })
      }
      setLoading(false)
    }

    loadBooking()
  }, [bookingId])

  const getStatusColor = (status: string) => {
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
    
    return 'bg-gray-100 text-gray-800'
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In real app: await blink.db.bookings.update(bookingId, editedBooking)
      console.log('Saving booking:', editedBooking)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setBooking({ ...editedBooking })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving booking:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedBooking({ ...booking })
    setIsEditing(false)
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setEditedBooking(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const renderField = (attribute: BookingAttribute) => {
    const value = isEditing ? editedBooking?.[attribute.name] : booking?.[attribute.name]
    const isRequired = attribute.required

    if (!isEditing) {
      // Display mode
      return (
        <div key={attribute.id} className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            {attribute.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="min-h-[40px] flex items-center">
            {attribute.fieldType === 'boolean' ? (
              <Badge variant={value ? 'default' : 'secondary'}>
                {value ? 'Yes' : 'No'}
              </Badge>
            ) : attribute.fieldType === 'select' && attribute.name === 'status' ? (
              <Badge className={getStatusColor(value || '')}>
                {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Not set'}
              </Badge>
            ) : (
              <span className={value ? 'text-foreground' : 'text-muted-foreground italic'}>
                {value || 'Not set'}
              </span>
            )}
          </div>
        </div>
      )
    }

    // Edit mode
    return (
      <div key={attribute.id} className="space-y-2">
        <Label htmlFor={attribute.name} className="text-sm font-medium">
          {attribute.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {attribute.fieldType === 'text' && (
          <Input
            id={attribute.name}
            value={value || ''}
            onChange={(e) => handleFieldChange(attribute.name, e.target.value)}
            placeholder={attribute.placeholder}
            required={isRequired}
          />
        )}
        {attribute.fieldType === 'email' && (
          <Input
            id={attribute.name}
            type="email"
            value={value || ''}
            onChange={(e) => handleFieldChange(attribute.name, e.target.value)}
            placeholder={attribute.placeholder}
            required={isRequired}
          />
        )}
        {attribute.fieldType === 'phone' && (
          <Input
            id={attribute.name}
            type="tel"
            value={value || ''}
            onChange={(e) => handleFieldChange(attribute.name, e.target.value)}
            placeholder={attribute.placeholder}
            required={isRequired}
          />
        )}
        {attribute.fieldType === 'number' && (
          <Input
            id={attribute.name}
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(attribute.name, e.target.value)}
            placeholder={attribute.placeholder}
            required={isRequired}
          />
        )}
        {attribute.fieldType === 'date' && (
          <Input
            id={attribute.name}
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(attribute.name, e.target.value)}
            required={isRequired}
          />
        )}
        {attribute.fieldType === 'datetime' && (
          <Input
            id={attribute.name}
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handleFieldChange(attribute.name, e.target.value)}
            required={isRequired}
          />
        )}
        {attribute.fieldType === 'textarea' && (
          <Textarea
            id={attribute.name}
            value={value || ''}
            onChange={(e) => handleFieldChange(attribute.name, e.target.value)}
            placeholder={attribute.placeholder}
            required={isRequired}
            rows={3}
          />
        )}
        {attribute.fieldType === 'select' && (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleFieldChange(attribute.name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${attribute.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {attribute.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {attribute.fieldType === 'boolean' && (
          <div className="flex items-center space-x-2">
            <Switch
              id={attribute.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(attribute.name, checked)}
            />
            <Label htmlFor={attribute.name} className="text-sm">
              {value ? 'Yes' : 'No'}
            </Label>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Booking not found</h3>
          <p className="text-muted-foreground">The booking you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  // Sort attributes by order
  const sortedAttributes = [...attributes].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
            <p className="text-muted-foreground">
              Created {new Date(booking.created_at).toLocaleDateString()} • 
              Last updated {new Date(booking.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Booking
            </Button>
          )}
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{booking.customer_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tour Date</p>
                <p className="font-medium">{booking.tour_date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="font-medium">${booking.total_price}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="w-5 h-5" />
                Edit Booking Details
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Booking Details
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedAttributes.map(renderField)}
          </div>
          
          {isEditing && (
            <>
              <Separator className="my-6" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Actions */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </Button>
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Assign Equipment
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}