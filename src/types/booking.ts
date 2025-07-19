export interface BookingAttribute {
  id: string
  name: string
  fieldType: 'text' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'textarea' | 'select' | 'boolean'
  label: string
  required: boolean
  placeholder?: string
  options?: string[] // For select fields
  defaultValue?: string
  description?: string
  order: number
}

export interface Booking {
  id: string
  [key: string]: any // Dynamic fields based on attributes
}

export const DEFAULT_BOOKING_ATTRIBUTES: BookingAttribute[] = [
  {
    id: 'status',
    name: 'status',
    fieldType: 'select',
    label: 'Status',
    required: true,
    options: ['pending', 'confirmed', 'completed', 'cancelled'],
    defaultValue: 'pending',
    order: 1
  },
  {
    id: 'city',
    name: 'city',
    fieldType: 'text',
    label: 'City',
    required: false,
    placeholder: 'Enter city',
    order: 2
  },
  {
    id: 'tour_date',
    name: 'tour_date',
    fieldType: 'date',
    label: 'Tour Date',
    required: false,
    order: 3
  },
  {
    id: 'tour_time',
    name: 'tour_time',
    fieldType: 'text',
    label: 'Tour Time',
    required: false,
    placeholder: '09:00',
    order: 4
  },
  {
    id: 'tour_date_time_iso',
    name: 'tour_date_time_iso',
    fieldType: 'datetime',
    label: 'Tour Date & Time ISO Format',
    required: false,
    order: 5
  },
  {
    id: 'booked_tour',
    name: 'booked_tour',
    fieldType: 'text',
    label: 'Booked Tour',
    required: false,
    placeholder: 'Enter tour name',
    order: 6
  },
  {
    id: 'comments',
    name: 'comments',
    fieldType: 'textarea',
    label: 'Comments',
    required: false,
    placeholder: 'Enter comments',
    order: 7
  },
  {
    id: 'number_of_players',
    name: 'number_of_players',
    fieldType: 'number',
    label: 'Number of Players',
    required: false,
    placeholder: '1',
    order: 8
  },
  {
    id: 'tags',
    name: 'tags',
    fieldType: 'text',
    label: 'Tags',
    required: false,
    placeholder: 'Enter tags',
    order: 9
  },
  {
    id: 'company',
    name: 'company',
    fieldType: 'text',
    label: 'Company',
    required: false,
    placeholder: 'Enter company name',
    order: 10
  },
  {
    id: 'client_first_name',
    name: 'client_first_name',
    fieldType: 'text',
    label: 'Client First Name',
    required: false,
    placeholder: 'Enter first name',
    order: 11
  },
  {
    id: 'client_last_name',
    name: 'client_last_name',
    fieldType: 'text',
    label: 'Client Last Name',
    required: false,
    placeholder: 'Enter last name',
    order: 12
  },
  {
    id: 'client_city',
    name: 'client_city',
    fieldType: 'text',
    label: 'Client City',
    required: false,
    placeholder: 'Enter client city',
    order: 13
  },
  {
    id: 'client_mail',
    name: 'client_mail',
    fieldType: 'email',
    label: 'Client Mail',
    required: false,
    placeholder: 'client@example.com',
    order: 14
  },
  {
    id: 'client_phone',
    name: 'client_phone',
    fieldType: 'phone',
    label: 'Client Phone',
    required: false,
    placeholder: '+1 234 567 8900',
    order: 15
  },
  {
    id: 'wa',
    name: 'wa',
    fieldType: 'boolean',
    label: 'WA?',
    required: false,
    order: 16
  },
  {
    id: 'channel',
    name: 'channel',
    fieldType: 'text',
    label: 'Channel',
    required: false,
    placeholder: 'Enter channel',
    order: 17
  },
  {
    id: 'source',
    name: 'source',
    fieldType: 'text',
    label: 'Source',
    required: false,
    placeholder: 'Enter source',
    order: 18
  },
  {
    id: 'booking_date',
    name: 'booking_date',
    fieldType: 'date',
    label: 'Booking Date',
    required: false,
    order: 19
  },
  {
    id: 'booking_number',
    name: 'booking_number',
    fieldType: 'text',
    label: 'Booking Number',
    required: false,
    placeholder: 'Enter booking number',
    order: 20
  },
  {
    id: 'days_between',
    name: 'days_between',
    fieldType: 'number',
    label: 'Days between',
    required: false,
    placeholder: '0',
    order: 21
  },
  {
    id: 'revenue_incl_vat',
    name: 'revenue_incl_vat',
    fieldType: 'number',
    label: 'Revenue (incl. VAT)',
    required: false,
    placeholder: '0.00',
    order: 22
  },
  {
    id: 'cash_in_amount_incl_vat',
    name: 'cash_in_amount_incl_vat',
    fieldType: 'number',
    label: 'Cash-In Amount (incl. VAT)',
    required: false,
    placeholder: '0.00',
    order: 23
  },
  {
    id: 'cash_in_amount_without_vat',
    name: 'cash_in_amount_without_vat',
    fieldType: 'number',
    label: 'Cash-In Amount (without VAT)',
    required: false,
    placeholder: '0.00',
    order: 24
  },
  {
    id: 'revenue_month',
    name: 'revenue_month',
    fieldType: 'text',
    label: 'Revenue Month',
    required: false,
    placeholder: 'Enter revenue month',
    order: 25
  },
  {
    id: 'cash_in_month',
    name: 'cash_in_month',
    fieldType: 'text',
    label: 'Cash In Month',
    required: false,
    placeholder: 'Enter cash in month',
    order: 26
  },
  {
    id: 'payment_type',
    name: 'payment_type',
    fieldType: 'select',
    label: 'Payment Type',
    required: false,
    options: ['Cash', 'Credit Card', 'Bank Transfer', 'PayPal', 'Other'],
    order: 27
  },
  {
    id: 'utc_time_formatted',
    name: 'utc_time_formatted',
    fieldType: 'datetime',
    label: 'UTC Time Formatted',
    required: false,
    order: 28
  },
  {
    id: 'assigned_asset_1',
    name: 'assigned_asset_1',
    fieldType: 'text',
    label: 'Assigned Asset 1',
    required: false,
    placeholder: 'Asset ID',
    order: 29
  },
  {
    id: 'assigned_asset_2',
    name: 'assigned_asset_2',
    fieldType: 'text',
    label: 'Assigned Asset 2',
    required: false,
    placeholder: 'Asset ID',
    order: 30
  }
]