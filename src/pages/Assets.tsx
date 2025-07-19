import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Package, Search, Filter, Plus, Edit, Eye, AlertCircle } from 'lucide-react'

export function Assets() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedAsset, setSelectedAsset] = useState<any>(null)

  // Mock data for demonstration
  const assets = [
    {
      id: 'BP-001',
      name: 'Osprey Atmos 65L',
      type: 'backpack',
      brand: 'Osprey',
      model: 'Atmos 65',
      size: 'Large',
      condition: 'excellent',
      status: 'in-use',
      purchaseDate: '2023-03-15',
      purchasePrice: 280,
      notes: 'Great for multi-day hikes',
      assignedTo: 'BK001 - John Smith'
    },
    {
      id: 'BP-002',
      name: 'Deuter Futura 32L',
      type: 'backpack',
      brand: 'Deuter',
      model: 'Futura 32',
      size: 'Medium',
      condition: 'good',
      status: 'available',
      purchaseDate: '2023-05-20',
      purchasePrice: 150,
      notes: 'Perfect for day hikes',
      assignedTo: null
    },
    {
      id: 'BP-003',
      name: 'Gregory Baltoro 75L',
      type: 'backpack',
      brand: 'Gregory',
      model: 'Baltoro 75',
      size: 'Large',
      condition: 'good',
      status: 'in-use',
      purchaseDate: '2023-01-10',
      purchasePrice: 320,
      notes: 'Heavy duty for extended trips',
      assignedTo: 'BK003 - Mike Wilson'
    },
    {
      id: 'BP-004',
      name: 'Patagonia Black Hole 25L',
      type: 'backpack',
      brand: 'Patagonia',
      model: 'Black Hole 25',
      size: 'Small',
      condition: 'fair',
      status: 'maintenance',
      purchaseDate: '2022-08-12',
      purchasePrice: 120,
      notes: 'Zipper needs repair',
      assignedTo: null
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'in-use':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'retired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'fair':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter
    const matchesType = typeFilter === 'all' || asset.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const statusCounts = {
    available: assets.filter(a => a.status === 'available').length,
    inUse: assets.filter(a => a.status === 'in-use').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    total: assets.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assets</h1>
          <p className="text-muted-foreground">Manage rental equipment inventory</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.available}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Use</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.inUse}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.maintenance}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search assets..."
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="backpack">Backpacks</SelectItem>
            <SelectItem value="tent">Tents</SelectItem>
            <SelectItem value="sleeping-bag">Sleeping Bags</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand/Model</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.id}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{asset.brand}</div>
                      <div className="text-sm text-muted-foreground">{asset.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>{asset.size}</TableCell>
                  <TableCell>
                    <Badge className={getConditionColor(asset.condition)}>
                      {asset.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.assignedTo ? (
                      <div className="text-sm">
                        <div className="font-medium">{asset.assignedTo.split(' - ')[1]}</div>
                        <div className="text-muted-foreground">{asset.assignedTo.split(' - ')[0]}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAsset(asset)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Asset Details - {asset.id}</DialogTitle>
                          </DialogHeader>
                          {selectedAsset && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Basic Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Name:</strong> {selectedAsset.name}</div>
                                      <div><strong>Type:</strong> {selectedAsset.type}</div>
                                      <div><strong>Brand:</strong> {selectedAsset.brand}</div>
                                      <div><strong>Model:</strong> {selectedAsset.model}</div>
                                      <div><strong>Size:</strong> {selectedAsset.size}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Status</h4>
                                    <div className="space-y-2">
                                      <Badge className={getConditionColor(selectedAsset.condition)}>
                                        Condition: {selectedAsset.condition}
                                      </Badge>
                                      <Badge className={getStatusColor(selectedAsset.status)}>
                                        Status: {selectedAsset.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Purchase Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Purchase Date:</strong> {selectedAsset.purchaseDate}</div>
                                      <div><strong>Purchase Price:</strong> ${selectedAsset.purchasePrice}</div>
                                    </div>
                                  </div>
                                  
                                  {selectedAsset.assignedTo && (
                                    <div>
                                      <h4 className="font-medium mb-2">Current Assignment</h4>
                                      <div className="text-sm">
                                        <div className="font-medium">{selectedAsset.assignedTo.split(' - ')[1]}</div>
                                        <div className="text-muted-foreground">{selectedAsset.assignedTo.split(' - ')[0]}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {selectedAsset.notes && (
                                    <div>
                                      <h4 className="font-medium mb-2">Notes</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedAsset.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-4 border-t">
                                <Button variant="outline">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Asset
                                </Button>
                                <Button variant="outline">Update Status</Button>
                                {selectedAsset.status === 'available' && (
                                  <Button>Assign to Booking</Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No assets found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first asset'
            }
          </p>
        </div>
      )}
    </div>
  )
}