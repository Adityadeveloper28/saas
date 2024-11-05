import { ConnectionTypes } from "@/lib/types";
// import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
type Props = {
  type: ConnectionTypes;
  icon: String;
  title: ConnectionTypes;
  description?: String;
  callback?: () => void;
  connected: {} & any;
};

const ConnectionCard = ({
  description,
  type,
  icon,
  title,
  connected,
}: Props) => {
  console.log(
    "Discord Redirect URL:",
    process.env.NEXT_PUBLIC_DISCORD_REDIRECT
  );
  console.log("Notion Auth URL:", process.env.NEXT_PUBLIC_NOTION_AUTH_URL);
  console.log("Slack Redirect URL:", process.env.NEXT_PUBLIC_SLACK_REDIRECT);

  return (
    <Card className="flex w-full items-center justify-between">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <Image
            src={icon}
            alt={title}
            height={30}
            width={30}
            className="object-contain"
          />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="">{description}</CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-col items-center gap-2 p-4">
        {
            connected[type] ? (
                <div
            
                className="border-bg-primary rounded-lg border-2 px-3 py-2 font-bold text-white">
                    connected

                </div>
            ):(
        <Link
          href={
            title === "Discord"
              ? process.env.NEXT_PUBLIC_DISCORD_REDIRECT || "#"
              : title === "Notion"
              ? process.env.NEXT_PUBLIC_NOTION_AUTH_URL || "#"
              : title === "Slack"
              ? process.env.NEXT_PUBLIC_SLACK_REDIRECT || "#"
              : "#"
          }
          className="bg-primary rounded-lg p-2 font-bold text-primary-foreground"
        >
          connect
        </Link>
         )
        } 
      </div>
    </Card>
  );
};

export default ConnectionCard;
