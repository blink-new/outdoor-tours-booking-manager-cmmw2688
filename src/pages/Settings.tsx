import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2, Plus, Edit, Settings as SettingsIcon, Database, Type, Calendar, Hash, ToggleLeft, FileText, Mail, Phone, Users, UserPlus, Shield, Clock, CheckCircle, XCircle, MoreHorizontal, Zap, Link, Activity, Copy, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useBookingAttributes } from '@/hooks/useBookingAttributes'
import { BookingAttribute } from '@/types/booking'
import { blink } from '@/blink/client'



const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'datetime', label: 'Date & Time', icon: Calendar },
  { value: 'textarea', label: 'Long Text', icon: FileText },
  { value: 'select', label: 'Dropdown', icon: ToggleLeft },
  { value: 'boolean', label: 'Yes/No', icon: ToggleLeft },
]

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: 'admin' | 'manager' | 'member'
  status: 'active' | 'inactive'
  invited_by?: string
  invited_at: string
  last_login?: string
  created_at: string
}

interface UserInvitation {
  id: string
  email: string
  role: 'admin' | 'manager' | 'member'
  invited_by: string
  invitation_token: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: string
  created_at: string
  accepted_at?: string
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  event_type: string
  is_active: boolean
  secret_token?: string
  created_at: string
  updated_at: string
}

interface WebhookLog {
  id: string
  webhook_config_id?: string
  event_type: string
  payload: string
  response_status?: number
  response_body?: string
  error_message?: string
  created_at: string
}

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member', description: 'Can view and manage bookings' },
  { value: 'manager', label: 'Manager', description: 'Can manage bookings and assets' },
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
]

export function Settings() {
  const { attributes, setAttributes, getSortedAttributes } = useBookingAttributes()
  const [editingAttribute, setEditingAttribute] = useState<BookingAttribute | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [formData, setFormData] = useState<Partial<BookingAttribute>>({})
  const [rawOptionsText, setRawOptionsText] = useState('')

  // User management state
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<UserInvitation[]>([])
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Zapier integration state
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [loadingWebhooks, setLoadingWebhooks] = useState(true)
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null)
  const [webhookFormData, setWebhookFormData] = useState({
    name: '',
    url: '',
    event_type: '',
    secret_token: ''
  })

  // Load current user and users data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const user = await blink.auth.me()
        setCurrentUser(user)

        // Load users and invitations
        await Promise.all([loadUsers(), loadInvitations(), loadWebhookConfigs(), loadWebhookLogs()])
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        })
      } finally {
        setLoadingUsers(false)
      }
    }

    loadData()
  }, [])

  const loadUsers = async () => {
    try {
      const result = await blink.db.users.list({
        orderBy: { created_at: 'desc' }
      })
      setUsers(result)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadInvitations = async () => {
    try {
      const result = await blink.db.user_invitations.list({
        where: { status: 'pending' },
        orderBy: { created_at: 'desc' }
      })
      setInvitations(result)
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  const loadWebhookConfigs = async () => {
    try {
      const result = await blink.db.webhookConfigs.list({
        orderBy: { created_at: 'desc' }
      })
      setWebhookConfigs(result)
    } catch (error) {
      console.error('Error loading webhook configs:', error)
    } finally {
      setLoadingWebhooks(false)
    }
  }

  const loadWebhookLogs = async () => {
    try {
      const result = await blink.db.webhookLogs.list({
        orderBy: { created_at: 'desc' },
        limit: 50
      })
      setWebhookLogs(result)
    } catch (error) {
      console.error('Error loading webhook logs:', error)
    }
  }

  const validateTeamGameEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@team-game.de')
  }

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      })
      return
    }

    if (!validateTeamGameEmail(inviteEmail)) {
      toast({
        title: "Invalid Email Domain",
        description: "Only @team-game.de email addresses are allowed",
        variant: "destructive"
      })
      return
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase())
    if (existingUser) {
      toast({
        title: "User Already Exists",
        description: "This email is already registered",
        variant: "destructive"
      })
      return
    }

    // Check if invitation already exists
    const existingInvitation = invitations.find(i => i.email.toLowerCase() === inviteEmail.toLowerCase())
    if (existingInvitation) {
      toast({
        title: "Invitation Already Sent",
        description: "An invitation has already been sent to this email",
        variant: "destructive"
      })
      return
    }

    try {
      const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      await blink.db.user_invitations.create({
        id: `invitation_${Date.now()}`,
        email: inviteEmail.toLowerCase(),
        role: inviteRole,
        invited_by: currentUser?.id || 'unknown',
        invitation_token: invitationToken,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}. They can sign in with Google to accept.`
      })

      setInviteEmail('')
      setInviteRole('member')
      setIsInviteDialogOpen(false)
      await loadInvitations()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await blink.db.users.delete(userId)
      toast({
        title: "Success",
        description: "User removed successfully"
      })
      await loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive"
      })
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await blink.db.user_invitations.delete(invitationId)
      toast({
        title: "Success",
        description: "Invitation revoked successfully"
      })
      await loadInvitations()
    } catch (error) {
      console.error('Error revoking invitation:', error)
      toast({
        title: "Error",
        description: "Failed to revoke invitation",
        variant: "destructive"
      })
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'member') => {
    try {
      await blink.db.users.update(userId, { role: newRole })
      toast({
        title: "Success",
        description: "User role updated successfully"
      })
      await loadUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield
      case 'manager': return Users
      default: return Users
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      default: return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Webhook management functions
  const handleSaveWebhook = async () => {
    if (!webhookFormData.name || !webhookFormData.url || !webhookFormData.event_type) {
      toast({
        title: "Validation Error",
        description: "Name, URL, and event type are required",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingWebhook) {
        await blink.db.webhookConfigs.update(editingWebhook.id, {
          name: webhookFormData.name,
          url: webhookFormData.url,
          eventType: webhookFormData.event_type,
          secretToken: webhookFormData.secret_token || null,
          updatedAt: new Date().toISOString()
        })
        toast({
          title: "Success",
          description: "Webhook updated successfully"
        })
      } else {
        await blink.db.webhookConfigs.create({
          id: `webhook_${Date.now()}`,
          name: webhookFormData.name,
          url: webhookFormData.url,
          eventType: webhookFormData.event_type,
          isActive: true,
          secretToken: webhookFormData.secret_token || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        toast({
          title: "Success",
          description: "Webhook created successfully"
        })
      }

      setIsWebhookDialogOpen(false)
      setEditingWebhook(null)
      setWebhookFormData({ name: '', url: '', event_type: '', secret_token: '' })
      await loadWebhookConfigs()
    } catch (error) {
      console.error('Error saving webhook:', error)
      toast({
        title: "Error",
        description: "Failed to save webhook",
        variant: "destructive"
      })
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await blink.db.webhookConfigs.delete(webhookId)
      toast({
        title: "Success",
        description: "Webhook deleted successfully"
      })
      await loadWebhookConfigs()
    } catch (error) {
      console.error('Error deleting webhook:', error)
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive"
      })
    }
  }

  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      await blink.db.webhookConfigs.update(webhookId, {
        isActive: isActive ? "1" : "0",
        updatedAt: new Date().toISOString()
      })
      toast({
        title: "Success",
        description: `Webhook ${isActive ? 'enabled' : 'disabled'} successfully`
      })
      await loadWebhookConfigs()
    } catch (error) {
      console.error('Error toggling webhook:', error)
      toast({
        title: "Error",
        description: "Failed to update webhook status",
        variant: "destructive"
      })
    }
  }

  const startEditingWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook)
    setWebhookFormData({
      name: webhook.name,
      url: webhook.url,
      event_type: webhook.event_type,
      secret_token: webhook.secret_token || ''
    })
    setIsWebhookDialogOpen(true)
  }

  const startAddingWebhook = () => {
    setEditingWebhook(null)
    setWebhookFormData({ name: '', url: '', event_type: '', secret_token: '' })
    setIsWebhookDialogOpen(true)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Text copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }

  const triggerTestWebhook = async (eventType: string) => {
    try {
      // Create a test booking for demonstration
      const testBooking = {
        id: 'test_booking_123',
        customer_name: 'Test Customer',
        tour_name: 'Test Tour',
        status: 'confirmed'
      }

      const response = await fetch('https://cmmw2688-y3cbpejr0eeh.deno.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: eventType,
          booking_id: testBooking.id,
          user_id: currentUser?.id,
          action: 'test_trigger',
          additional_data: testBooking
        })
      })

      if (response.ok) {
        toast({
          title: "Test Webhook Sent",
          description: `Test ${eventType} webhook triggered successfully`
        })
        await loadWebhookLogs()
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Error triggering test webhook:', error)
      toast({
        title: "Error",
        description: "Failed to trigger test webhook",
        variant: "destructive"
      })
    }
  }

  const handleSaveAttribute = () => {
    if (!formData.name || !formData.label || !formData.fieldType) {
      toast({
        title: "Validation Error",
        description: "Name, label, and field type are required.",
        variant: "destructive"
      })
      return
    }

    // Check for duplicate names (except when editing the same attribute)
    const isDuplicate = attributes.some(attr => 
      attr.name === formData.name && attr.id !== editingAttribute?.id
    )
    
    if (isDuplicate) {
      toast({
        title: "Validation Error",
        description: "An attribute with this name already exists.",
        variant: "destructive"
      })
      return
    }

    const newAttribute: BookingAttribute = {
      id: editingAttribute?.id || `attr_${Date.now()}`,
      name: formData.name!,
      fieldType: formData.fieldType!,
      label: formData.label!,
      required: formData.required || false,
      placeholder: formData.placeholder || '',
      options: formData.options || [],
      defaultValue: formData.defaultValue || '',
      description: formData.description || '',
      order: formData.order || attributes.length + 1
    }

    if (editingAttribute) {
      setAttributes(prev => prev.map(attr => 
        attr.id === editingAttribute.id ? newAttribute : attr
      ))
      toast({
        title: "Success",
        description: "Attribute updated successfully."
      })
    } else {
      setAttributes(prev => [...prev, newAttribute])
      toast({
        title: "Success", 
        description: "New attribute added successfully."
      })
    }

    resetForm()
  }

  const handleDeleteAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id))
    toast({
      title: "Success",
      description: "Attribute deleted successfully."
    })
  }

  const resetForm = () => {
    setFormData({})
    setEditingAttribute(null)
    setIsAddingNew(false)
    setRawOptionsText('')
  }

  const startEditing = (attribute: BookingAttribute) => {
    setEditingAttribute(attribute)
    setFormData(attribute)
    setRawOptionsText(attribute.options?.join('\n') || '')
    setIsAddingNew(true)
  }

  const startAdding = () => {
    setFormData({
      fieldType: 'text',
      required: false,
      order: attributes.length + 1
    })
    setEditingAttribute(null)
    setRawOptionsText('')
    setIsAddingNew(true)
  }

  const getFieldTypeIcon = (type: string) => {
    const option = FIELD_TYPE_OPTIONS.find(opt => opt.value === type)
    return option?.icon || Type
  }

  const sortedAttributes = getSortedAttributes()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure booking attributes and system settings</p>
      </div>

      <Tabs defaultValue="attributes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Booking Attributes
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="zapier" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Zapier Integration
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attributes" className="space-y-6">
          {/* Add New Attribute Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Booking Attributes</h3>
              <p className="text-sm text-muted-foreground">
                Define custom fields for your booking data structure
              </p>
            </div>
            <Button onClick={startAdding} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Attribute
            </Button>
          </div>

          {/* Attributes List */}
          <div className="grid gap-4">
            {sortedAttributes.map((attribute) => {
              const IconComponent = getFieldTypeIcon(attribute.fieldType)
              return (
                <Card key={attribute.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{attribute.label}</h4>
                            {attribute.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono">{attribute.name}</span>
                            <span>•</span>
                            <span className="capitalize">{attribute.fieldType}</span>
                            {attribute.options && attribute.options.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{attribute.options.length} options</span>
                              </>
                            )}
                          </div>
                          {attribute.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {attribute.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(attribute)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttribute(attribute.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {attributes.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No attributes defined</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first booking attribute
              </p>
              <Button onClick={startAdding}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Attribute
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Management Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Team Members</h3>
              <p className="text-sm text-muted-foreground">
                Manage team access with Google authentication (@team-game.de only)
              </p>
            </div>
            <Button onClick={() => setIsInviteDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No users yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by inviting your first team member
                  </p>
                  <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite First User
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const RoleIcon = getRoleIcon(user.role)
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(newRole) => handleUpdateUserRole(user.id, newRole as any)}
                              disabled={user.id === currentUser?.id}
                            >
                              <SelectTrigger className="w-32">
                                <div className="flex items-center gap-2">
                                  <RoleIcon className="w-4 h-4" />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div className="flex items-center gap-2">
                                      <span className="capitalize">{role.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status === 'active' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.last_login ? formatDate(user.last_login) : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            {user.id !== currentUser?.id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {user.name} from the team? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Remove User
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Invitations ({invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => {
                      const RoleIcon = getRoleIcon(invitation.role)
                      const isExpired = new Date(invitation.expires_at) < new Date()
                      return (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">{invitation.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <RoleIcon className="w-4 h-4" />
                              <span className="capitalize">{invitation.role}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(invitation.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className={isExpired ? 'text-destructive' : ''}>
                              {formatDate(invitation.expires_at)}
                              {isExpired && ' (Expired)'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to revoke the invitation for {invitation.email}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRevokeInvitation(invitation.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Revoke Invitation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Google Auth Info */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Google Authentication</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Users can sign in with their Google account. Only @team-game.de email addresses are allowed.
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><strong>Domain Restriction:</strong> @team-game.de</p>
                <p><strong>Authentication Method:</strong> Google OAuth</p>
                <p><strong>Invitation Expiry:</strong> 7 days</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          {/* Zapier Integration Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Zapier Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect your booking system with Zapier for automated workflows
              </p>
            </div>
            <Button onClick={startAddingWebhook} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          {/* Incoming Webhooks Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Incoming Webhooks (Zapier → System)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Webhook Endpoint for New Bookings</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Use this URL in your Zapier webhook action to send booking data to the system.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                        https://cmmw2688-dkm7f7tzxf5r.deno.dev
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard('https://cmmw2688-dkm7f7tzxf5r.deno.dev')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Required Fields for Incoming Bookings:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">external_booking_id</code>
                    <p className="text-muted-foreground">Unique booking ID from source</p>
                  </div>
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">customer_name</code>
                    <p className="text-muted-foreground">Customer full name</p>
                  </div>
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">customer_email</code>
                    <p className="text-muted-foreground">Customer email address</p>
                  </div>
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">tour_name</code>
                    <p className="text-muted-foreground">Name of the tour</p>
                  </div>
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">tour_date</code>
                    <p className="text-muted-foreground">Date of the tour (YYYY-MM-DD)</p>
                  </div>
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">participants</code>
                    <p className="text-muted-foreground">Number of participants</p>
                  </div>
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">total_price</code>
                    <p className="text-muted-foreground">Total booking price</p>
                  </div>
                  <div className="space-y-1">
                    <code className="bg-muted px-2 py-1 rounded">booking_platform</code>
                    <p className="text-muted-foreground">Source platform (e.g., GetYourGuide)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outgoing Webhooks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Outgoing Webhooks (System → Zapier) ({webhookConfigs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWebhooks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading webhooks...</p>
                </div>
              ) : webhookConfigs.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first webhook to start sending events to Zapier
                  </p>
                  <Button onClick={startAddingWebhook}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Webhook
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhookConfigs.map((webhook) => (
                    <div key={webhook.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{webhook.name}</h4>
                              <Badge variant={Number(webhook.is_active) > 0 ? 'default' : 'secondary'}>
                                {Number(webhook.is_active) > 0 ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium">Event:</span>
                              <code className="bg-muted px-2 py-1 rounded text-xs">{webhook.event_type}</code>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium">URL:</span>
                              <code className="bg-muted px-2 py-1 rounded text-xs font-mono truncate max-w-md">
                                {webhook.url}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(webhook.url)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={Number(webhook.is_active) > 0}
                            onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => triggerTestWebhook(webhook.event_type)}
                          >
                            <Activity className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingWebhook(webhook)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{webhook.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteWebhook(webhook.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete Webhook
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhook Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Webhook Activity ({webhookLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {webhookLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No webhook activity yet</h3>
                  <p className="text-muted-foreground">
                    Webhook calls will appear here once you start triggering events
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhookLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={log.response_status && log.response_status >= 200 && log.response_status < 300 ? 'default' : 'destructive'}>
                            {log.response_status || 'Failed'}
                          </Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{log.event_type}</code>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                        {log.error_message && (
                          <span className="text-sm text-destructive">{log.error_message}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                General system settings will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Attribute Dialog */}
      <Dialog open={isAddingNew} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Field Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., customer_age"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Used in database and API. Use lowercase with underscores.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="label">Display Label *</Label>
                <Input
                  id="label"
                  value={formData.label || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Customer Age"
                />
                <p className="text-xs text-muted-foreground">
                  Shown to users in forms and displays.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type *</Label>
              <Select
                value={formData.fieldType || ''}
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    fieldType: value as BookingAttribute['fieldType'],
                    options: value === 'select' ? prev.options || [] : undefined
                  }))
                  // Reset raw options text when changing field type
                  if (value !== 'select') {
                    setRawOptionsText('')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPE_OPTIONS.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder Text</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                  placeholder="Enter placeholder text..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input
                  id="defaultValue"
                  value={formData.defaultValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                  placeholder="Enter default value..."
                />
              </div>
            </div>

            {formData.fieldType === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="options">Dropdown Options</Label>
                <Textarea
                  id="options"
                  value={rawOptionsText}
                  onChange={(e) => {
                    const rawValue = e.target.value
                    
                    // Prevent more than 2 consecutive newlines
                    const cleanedRawValue = rawValue.replace(/\n{3,}/g, '\n\n')
                    
                    setRawOptionsText(cleanedRawValue)
                    
                    // Update the actual options array by filtering out empty lines
                    const lines = cleanedRawValue.split('\n')
                    const cleanOptions = lines
                      .map(opt => opt.trim())
                      .filter(opt => opt.length > 0)
                    
                    setFormData(prev => ({ 
                      ...prev, 
                      options: cleanOptions
                    }))
                  }}
                  placeholder="Enter each option on a new line..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Enter each option on a separate line. Empty lines are automatically filtered out.
                </p>
                {formData.options && formData.options.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Preview ({formData.options.length} options):</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.options.map((option, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this field..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={formData.required || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
              />
              <Label htmlFor="required">Required field</Label>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveAttribute} className="bg-primary hover:bg-primary/90">
                {editingAttribute ? 'Update Attribute' : 'Add Attribute'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Team Member
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address *</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@team-game.de"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only @team-game.de email addresses are allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role *</Label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => {
                    const RoleIcon = getRoleIcon(role.value)
                    return (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-start gap-2">
                          <RoleIcon className="w-4 h-4 mt-0.5" />
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900">Google Authentication Required</p>
                  <p className="text-amber-700 mt-1">
                    The invited user will need to sign in with their Google account to accept the invitation.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleInviteUser} className="flex-1 bg-primary hover:bg-primary/90">
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Webhook Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookName">Webhook Name *</Label>
              <Input
                id="webhookName"
                value={webhookFormData.name}
                onChange={(e) => setWebhookFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Booking Status Updates"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Zapier Webhook URL *</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookFormData.url}
                onChange={(e) => setWebhookFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="w-full font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Get this URL from your Zapier webhook trigger
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookEventType">Event Type *</Label>
              <Select 
                value={webhookFormData.event_type} 
                onValueChange={(value) => setWebhookFormData(prev => ({ ...prev, event_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking_status_change">Booking Status Change</SelectItem>
                  <SelectItem value="booking_created">Booking Created</SelectItem>
                  <SelectItem value="booking_completed">Booking Completed</SelectItem>
                  <SelectItem value="asset_assigned">Asset Assigned</SelectItem>
                  <SelectItem value="asset_returned">Asset Returned</SelectItem>
                  <SelectItem value="payment_received">Payment Received</SelectItem>
                  <SelectItem value="customer_message">Customer Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookSecret">Secret Token (Optional)</Label>
              <Input
                id="webhookSecret"
                type="password"
                value={webhookFormData.secret_token}
                onChange={(e) => setWebhookFormData(prev => ({ ...prev, secret_token: e.target.value }))}
                placeholder="Optional security token"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Optional token for webhook verification (sent in X-Webhook-Secret header)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">How it works</p>
                  <p className="text-blue-700 mt-1">
                    When the selected event occurs in your booking system, we'll send a POST request to your Zapier webhook URL with the booking data.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveWebhook} className="flex-1 bg-primary hover:bg-primary/90">
                {editingWebhook ? 'Update Webhook' : 'Create Webhook'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}