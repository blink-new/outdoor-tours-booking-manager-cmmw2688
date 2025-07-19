import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Package, BookOpen, TrendingUp, Users, Clock } from 'lucide-react'

export function Dashboard() {
  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Bookings',
      value: '156',
      change: '+12%',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Today\'s Tours',
      value: '8',
      change: '+2',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Available Assets',
      value: '24',
      change: '92%',
      icon: Package,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue',
      value: '$12,450',
      change: '+18%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  const recentBookings = [
    {
      id: '1',
      customerName: 'John Smith',
      tourName: 'Mountain Hiking Adventure',
      date: '2024-01-20',
      time: '09:00',
      status: 'confirmed',
      participants: 2
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      tourName: 'Forest Trail Experience',
      date: '2024-01-20',
      time: '14:00',
      status: 'pending',
      participants: 4
    },
    {
      id: '3',
      customerName: 'Mike Wilson',
      tourName: 'Sunset Valley Tour',
      date: '2024-01-21',
      time: '16:00',
      status: 'confirmed',
      participants: 1
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{booking.customerName}</div>
                    <div className="text-sm text-muted-foreground">{booking.tourName}</div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {booking.participants}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Asset Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Asset Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Hiking Backpacks</div>
                  <div className="text-sm text-muted-foreground">Large capacity</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">18 available</div>
                  <div className="text-sm text-green-600">6 in use</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Day Packs</div>
                  <div className="text-sm text-muted-foreground">Medium capacity</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">12 available</div>
                  <div className="text-sm text-green-600">3 in use</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Kids Backpacks</div>
                  <div className="text-sm text-muted-foreground">Small capacity</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">8 available</div>
                  <div className="text-sm text-yellow-600">2 in maintenance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}