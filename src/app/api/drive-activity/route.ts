// pages/api/drive-activity.ts

import { postContentToWebHook } from '@/app/(main)/(pages)/connections/_actions/discord-connection';
import { onCreateNewPageInDatabase } from '@/app/(main)/(pages)/connections/_actions/notion-connection';
import { postMessageToSlack } from '@/app/(main)/(pages)/connections/_actions/slack-connection';
import { db } from '@/lib/db';
import axios from 'axios';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('🔴 Fetching Google Drive data');

  const headersList = headers();
  let channelResourceId: string | undefined;

  // Extract the Google resource ID from headers
  headersList.forEach((value, key) => {
    if (key === 'x-goog-resource-id') {
      channelResourceId = value;
    }
  });

  if (!channelResourceId) {
    return NextResponse.json(
      { message: 'Missing Google resource ID' },
      { status: 400 }
    );
  }

  // Fetch the user based on the resource ID
  const user = await db.user.findFirst({
    where: {
      googleResourceId: channelResourceId,
    },
    select: { clerkId: true, credits: true },
  });

  if (!user || (parseInt(user.credits!) <= 0 && user.credits !== 'Unlimited')) {
    return NextResponse.json(
      { message: 'Insufficient credits or user not found' },
      { status: 400 }
    );
  }

  // Fetch workflows associated with the user
  const workflows = await db.workflows.findMany({
    where: {
      userId: user.clerkId,
    },
  });

  if (!workflows || workflows.length === 0) {
    return NextResponse.json(
      { message: 'No workflows found for user' },
      { status: 404 }
    );
  }

  // Process each workflow
  for (const flow of workflows) {
    const flowPath = JSON.parse(flow.flowPath!);
    let current = 0;

    // Iterate over the steps in the workflow
    while (current < flowPath.length) {
      try {
        switch (flowPath[current]) {
          case 'Discord':
            await handleDiscordStep(flow, user.clerkId);
            break;
          case 'Slack':
            await handleSlackStep(flow);
            break;
          case 'Notion':
            await handleNotionStep(flow);
            break;
          case 'Wait':
            await handleWaitStep(flow, flowPath, current);
            return; // Stop here if we are waiting for cron job response
          default:
            console.log(`Unknown flow path step: ${flowPath[current]}`);
            break;
        }

        // Remove the completed step
        flowPath.splice(current, 1);
      } catch (error) {
        console.error(`Error processing step: ${flowPath[current]}`, error);
        return NextResponse.json(
          { message: `Error processing step: ${flowPath[current]}` },
          { status: 500 }
        );
      }

      current++;
    }

    // After workflow steps are completed, update the user's credits
    await db.user.update({
      where: {
        clerkId: user.clerkId,
      },
      data: {
        credits: `${parseInt(user.credits!) - 1}`,
      },
    });
  }

  // If everything is successful
  return NextResponse.json(
    {
      message: 'Flow completed successfully',
    },
    {
      status: 200,
    }
  );
}

// Handle the Discord step
async function handleDiscordStep(flow, userId) {
  const discordMessage = await db.discordWebhook.findFirst({
    where: {
      userId: flow.userId,
    },
    select: {
      url: true,
    },
  });

  if (discordMessage) {
    await postContentToWebHook(flow.discordTemplate!, discordMessage.url);
  }
}

// Handle the Slack step
async function handleSlackStep(flow) {
  const channels = flow.slackChannels.map((channel) => ({
    label: '',
    value: channel,
  }));

  await postMessageToSlack(flow.slackAccessToken!, channels, flow.slackTemplate!);
}

// Handle the Notion step
async function handleNotionStep(flow) {
  await onCreateNewPageInDatabase(
    flow.notionDbId!,
    flow.notionAccessToken!,
    JSON.parse(flow.notionTemplate!)
  );
}

// Handle the Wait step, set up cron job and update the flow path
async function handleWaitStep(flow, flowPath, current) {
  try {
    const res = await axios.put(
      'https://api.cron-job.org/jobs',
      {
        job: {
          url: `${process.env.NGROK_URI}?flow_id=${flow.id}`,
          enabled: 'true',
          schedule: {
            timezone: 'Europe/Istanbul',
            expiresAt: 0,
            hours: [-1],
            mdays: [-1],
            minutes: ['*****'],
            months: [-1],
            wdays: [-1],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CRON_JOB_KEY!}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (res.status === 200) {
      flowPath.splice(current, 1); // Remove the Wait step after setting cron job
      await db.workflows.update({
        where: {
          id: flow.id,
        },
        data: {
          cronPath: JSON.stringify(flowPath),
        },
      });
    } else {
      console.error('Failed to set up cron job:', res.statusText);
    }
  } catch (error) {
    console.error('Error during cron job setup:', error);
  }
}
