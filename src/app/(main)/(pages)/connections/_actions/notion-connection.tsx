'use server';

import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import { Client } from '@notionhq/client';

// Connect to Notion
export const onNotionConnect = async (
  access_token: string,
  workspace_id: string,
  workspace_icon: string,
  workspace_name: string,
  database_id: string,
  id: string
) => {
  if (access_token) {
    // Check if Notion is already connected
    const notion_connected = await db.notion.findFirst({
      where: {
        accessToken: access_token,
      },
      include: {
        connections: {
          select: {
            type: true,
          },
        },
      },
    });

    // Create a new connection if none exists
    if (!notion_connected) {
      await db.notion.create({
        data: {
          userId: id,
          workspaceIcon: workspace_icon!,
          accessToken: access_token,
          workspaceId: workspace_id!,
          workspaceName: workspace_name!,
          databaseId: database_id,
          connections: {
            create: {
              userId: id,
              type: 'Notion',
            },
          },
        },
      });
    } else {
      console.log("Notion connection already exists for this access token.");
    }
  } else {
    console.error("Access token is missing.");
  }
};

// Retrieve the user's Notion connection
export const getNotionConnection = async () => {
  const user = await currentUser();
  if (user) {
    const connection = await db.notion.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (connection) {
      return connection;
    } else {
      console.warn("No Notion connection found for the user.");
    }
  } else {
    console.warn("No user is currently authenticated.");
  }
};

// Retrieve the Notion database
export const getNotionDatabase = async (
  databaseId: string,
  accessToken: string
) => {
  const notion = new Client({ auth: accessToken });
  try {
    const response = await notion.databases.retrieve({ database_id: databaseId });
    return response;
  } catch (error) {
    console.error('Error retrieving Notion database:', error);
    throw error;
  }
};

// Create a new page in the Notion database
export const onCreateNewPageInDatabase = async (
  databaseId: string,
  accessToken: string,
  content: string
) => {
  const notion = new Client({
    auth: accessToken,
  })

  console.log(databaseId)
  const response = await notion.pages.create({
    parent: {
      type: 'database_id',
      database_id: databaseId,
    },
    properties: {
      name: [
        {
          text: {
            content: content,
          },
        },
      ],
    },
  })
  if (response) {
    return response
  }
}



