import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@blinkdotnew/sdk@latest";

const blink = createClient({
  projectId: 'outdoor-tours-booking-manager-cmmw2688',
  authRequired: false
});

interface ZapierBookingData {
  external_booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tour_name: string;
  tour_date: string;
  tour_time?: string;
  participants: number;
  total_price: number;
  currency?: string;
  booking_platform: string;
  special_requirements?: string;
  pickup_location?: string;
  status?: string;
  payment_status?: string;
  created_at?: string;
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
    const zapierData: ZapierBookingData = await req.json();
    
    // Validate required fields
    const requiredFields = ['external_booking_id', 'customer_name', 'customer_email', 'tour_name', 'tour_date', 'participants', 'total_price'];
    const missingFields = requiredFields.filter(field => !zapierData[field]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields', 
        missing: missingFields 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check if booking already exists
    const existingBookings = await blink.db.bookings.list({
      where: { externalBookingId: zapierData.external_booking_id }
    });

    if (existingBookings.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Booking already exists',
        booking_id: existingBookings[0].id
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Create new booking
    const newBooking = await blink.db.bookings.create({
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerName: zapierData.customer_name,
      customerEmail: zapierData.customer_email,
      customerPhone: zapierData.customer_phone || '',
      tourName: zapierData.tour_name,
      tourDate: zapierData.tour_date,
      tourTime: zapierData.tour_time || '09:00',
      participants: zapierData.participants,
      totalPrice: zapierData.total_price,
      currency: zapierData.currency || 'EUR',
      status: zapierData.status || 'confirmed',
      paymentStatus: zapierData.payment_status || 'paid',
      specialRequirements: zapierData.special_requirements || '',
      pickupLocation: zapierData.pickup_location || '',
      bookingPlatform: zapierData.booking_platform,
      webhookSource: 'zapier',
      externalBookingId: zapierData.external_booking_id,
      createdAt: zapierData.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Log the webhook
    await blink.db.webhookLogs.create({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'booking_created_from_zapier',
      payload: JSON.stringify(zapierData),
      responseStatus: 200,
      responseBody: JSON.stringify({ success: true, booking_id: newBooking.id }),
      createdAt: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Booking created successfully',
      booking_id: newBooking.id,
      booking: newBooking
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error processing Zapier webhook:', error);
    
    // Log the error
    try {
      await blink.db.webhookLogs.create({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType: 'booking_created_from_zapier',
        payload: JSON.stringify(await req.json().catch(() => ({}))),
        responseStatus: 500,
        errorMessage: error.message,
        createdAt: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

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