// Webhook utility functions for triggering Zapier integrations

export interface WebhookTriggerData {
  event_type: string
  booking_id: string
  user_id?: string
  action?: string
  additional_data?: any
}

/**
 * Triggers a webhook for the specified event type
 * This will send the event to all configured Zapier webhooks
 */
export async function triggerWebhook(data: WebhookTriggerData): Promise<boolean> {
  try {
    const response = await fetch('https://cmmw2688-y3cbpejr0eeh.deno.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    return response.ok
  } catch (error) {
    console.error('Failed to trigger webhook:', error)
    return false
  }
}

/**
 * Triggers a booking status change webhook
 */
export async function triggerBookingStatusChange(
  bookingId: string, 
  oldStatus: string, 
  newStatus: string, 
  userId?: string
) {
  return triggerWebhook({
    event_type: 'booking_status_change',
    booking_id: bookingId,
    user_id: userId,
    action: 'status_updated',
    additional_data: {
      old_status: oldStatus,
      new_status: newStatus,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Triggers a booking completion webhook
 */
export async function triggerBookingCompleted(
  bookingId: string, 
  userId?: string
) {
  return triggerWebhook({
    event_type: 'booking_completed',
    booking_id: bookingId,
    user_id: userId,
    action: 'booking_completed',
    additional_data: {
      completed_at: new Date().toISOString()
    }
  })
}

/**
 * Triggers an asset assignment webhook
 */
export async function triggerAssetAssigned(
  bookingId: string, 
  assetId: string, 
  assetType: string,
  userId?: string
) {
  return triggerWebhook({
    event_type: 'asset_assigned',
    booking_id: bookingId,
    user_id: userId,
    action: 'asset_assigned',
    additional_data: {
      asset_id: assetId,
      asset_type: assetType,
      assigned_at: new Date().toISOString()
    }
  })
}

/**
 * Triggers an asset return webhook
 */
export async function triggerAssetReturned(
  bookingId: string, 
  assetId: string, 
  assetType: string,
  userId?: string
) {
  return triggerWebhook({
    event_type: 'asset_returned',
    booking_id: bookingId,
    user_id: userId,
    action: 'asset_returned',
    additional_data: {
      asset_id: assetId,
      asset_type: assetType,
      returned_at: new Date().toISOString()
    }
  })
}

/**
 * Triggers a payment received webhook
 */
export async function triggerPaymentReceived(
  bookingId: string, 
  amount: number, 
  currency: string,
  userId?: string
) {
  return triggerWebhook({
    event_type: 'payment_received',
    booking_id: bookingId,
    user_id: userId,
    action: 'payment_received',
    additional_data: {
      amount,
      currency,
      received_at: new Date().toISOString()
    }
  })
}

/**
 * Triggers a customer message webhook
 */
export async function triggerCustomerMessage(
  bookingId: string, 
  message: string, 
  messageType: string,
  userId?: string
) {
  return triggerWebhook({
    event_type: 'customer_message',
    booking_id: bookingId,
    user_id: userId,
    action: 'message_received',
    additional_data: {
      message,
      message_type: messageType,
      received_at: new Date().toISOString()
    }
  })
}