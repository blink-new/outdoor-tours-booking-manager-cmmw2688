import { useState } from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Calendar, Package, BookOpen, BarChart3, Menu, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'bookings', name: 'Bookings', icon: BookOpen },
  { id: 'assets', name: 'Assets', icon: Package },
  { id: 'calendar', name: 'Calendar', icon: Calendar },
  { id: 'settings', name: 'Settings', icon: Settings },
]

export function AppLayout({ children, currentPage, onPageChange }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Outdoor Tours</h1>
                <p className="text-xs text-muted-foreground">Booking Manager</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-3 py-4">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onPageChange(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      currentPage === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 flex items-center gap-4">
            <SidebarTrigger className="lg:hidden">
              <Menu className="w-4 h-4" />
            </SidebarTrigger>
            <div className="flex-1">
              <h2 className="text-xl font-semibold capitalize">{currentPage}</h2>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}