import { google } from 'googleapis'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // Initialize OAuth2 client for Google API
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URI
  )

  try {
    // Await the result of auth() to get the user
    const { userId } = await auth()

    if (!userId) {
      // Return 404 if user is not found
      console.error('User not found')
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Fetch the Clerk session
    const userSession = await clerkClient.sessions.getSession(userId)

    // Log the session for debugging
    console.log(userSession)

    if (!userSession?.oauthTokens?.google) {
      console.error('OAuth access token not found')
      return NextResponse.json({ message: 'OAuth access token not found' }, { status: 400 })
    }

    const accessToken = userSession.oauthTokens.google
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    // Initialize the Google Drive API client
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    })

    // Request to list files from the user's Google Drive
    const response = await drive.files.list()

    if (response.data.files && response.data.files.length > 0) {
      // Return the list of files found in the user's Google Drive
      return NextResponse.json(
        {
          message: 'Files found',
          files: response.data.files,
        },
        {
          status: 200,
        }
      )
    } else {
      // Return a message if no files are found
      return NextResponse.json(
        {
          message: 'No files found',
        },
        {
          status: 200,
        }
      )
    }
  } catch (error) {
    // Log the error and return a 500 response with the error message
    console.error('Error fetching Google Drive files:', error)
    return NextResponse.json(
      {
        message: 'Something went wrong',
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }
}
