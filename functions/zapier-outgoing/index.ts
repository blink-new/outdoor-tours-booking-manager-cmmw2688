import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@blinkdotnew/sdk@latest";

const blink = createClient({
  projectId: 'outdoor-tours-booking-manager-cmmw2688',
  authRequired: false
});

interface WebhookPayload {
  event_type: string;
  booking_id: string;
  booking_data: any;
  timestamp: string;
  user_id?: string;
  action?: string;
}

async function sendWebhook(webhookUrl: string, payload: WebhookPayload, secretToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'OutdoorTours-BookingManager/1.0'
  };

  if (secretToken) {
    headers['X-Webhook-Secret'] = secretToken;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  return {
    status: response.status,
    body: await response.text().catch(() => ''),
    success: response.ok
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { event_type, booking_id, user_id, action, additional_data } = await req.json();

    if (!event_type || !booking_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: event_type and booking_id' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get booking data
    const bookings = await blink.db.bookings.list({
      where: { id: booking_id }
    });

    if (bookings.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Booking not found' 
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const booking = bookings[0];

    // Get active webhooks for this event type
    const webhookConfigs = await blink.db.webhookConfigs.list({
      where: { 
        eventType: event_type,
        isActive: "1"
      }
    });

    if (webhookConfigs.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No active webhooks configured for this event type',
        event_type 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const payload: WebhookPayload = {
      event_type,
      booking_id,
      booking_data: {
        ...booking,
        action,
        ...additional_data
      },
      timestamp: new Date().toISOString(),
      user_id,
      action
    };

    const results = [];

    // Send to all configured webhooks
    for (const config of webhookConfigs) {
      try {
        const result = await sendWebhook(config.url, payload, config.secretToken);
        
        // Log the webhook call
        await blink.db.webhookLogs.create({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          webhookConfigId: config.id,
          eventType: event_type,
          payload: JSON.stringify(payload),
          responseStatus: result.status,
          responseBody: result.body,
          errorMessage: result.success ? null : `HTTP ${result.status}`,
          createdAt: new Date().toISOString()
        });

        results.push({
          webhook_name: config.name,
          webhook_url: config.url,
          status: result.status,
          success: result.success
        });

      } catch (error) {
        // Log the error
        await blink.db.webhookLogs.create({
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          webhookConfigId: config.id,
          eventType: event_type,
          payload: JSON.stringify(payload),
          responseStatus: 0,
          errorMessage: error.message,
          createdAt: new Date().toISOString()
        });

        results.push({
          webhook_name: config.name,
          webhook_url: config.url,
          status: 0,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhooks processed',
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error processing outgoing webhook:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});