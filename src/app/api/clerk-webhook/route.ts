import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log("Webhook received");

    // Check for valid content type
    const contentType = req.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Invalid Content-Type:", contentType);
      return NextResponse.json({ message: "Invalid content type" }, { status: 400 });
    }

    // Parse the request body
    const body = await req.json();
    console.log('Received Body:', body); // Log the entire body for inspection

    if (!body?.data) {
      console.error("Invalid or missing 'data' in request body:", body);
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { id, email_addresses, first_name, image_url } = body.data;

    // Validate required fields
    if (!id || !email_addresses || !email_addresses[0]?.email_address) {
      console.error("Missing required fields in webhook data:", body.data);
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const email = email_addresses[0].email_address;
    console.log('Processed webhook data:', { id, email, first_name, image_url });

    // Upsert the user data into the database
    await db.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name: first_name || '',
        profileImage: image_url || '',
      },
      create: {
        clerkId: id,
        email,
        name: first_name || '',
        profileImage: image_url || '',
      },
    });

    console.log("User updated in database successfully");
    return NextResponse.json({ message: "User updated in database successfully" }, { status: 200 });

  } catch (error) {
    console.error('Error updating database:', error);
    return NextResponse.json({ message: 'Error updating user in database' }, { status: 500 });
  }
}
