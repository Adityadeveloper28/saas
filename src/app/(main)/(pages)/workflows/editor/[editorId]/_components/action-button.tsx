import React, { useCallback } from "react";
import { Option } from "./content-based-on-title";
import { ConnectionProviderProps } from "@/providers/connections-provider";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { postContentToWebHook } from "@/app/(main)/(pages)/connections/_actions/discord-connection";
import { onCreateNodeTemplate } from "../../../_actions/workflow-connections";
import { toast } from "sonner";
import { onCreateNewPageInDatabase } from "@/app/(main)/(pages)/connections/_actions/notion-connection";
import { postMessageToSlack } from "@/app/(main)/(pages)/connections/_actions/slack-connection"
type NotionNodeType = {
  content: string;
  databaseId: string;
  accessToken: string;
};

type Props = {
  currentService: string;
  nodeConnection: ConnectionProviderProps;
  channels?: Option[];
  setChannels?: (value: Option[]) => void;
};

const ActionButton = ({
  currentService,
  nodeConnection,
  channels,
  setChannels,
}: Props) => {
  const pathname = usePathname();

  const handleDiscordMessage = useCallback(async () => {
    try {
      const response = await postContentToWebHook(
        nodeConnection.discordNode.content,
        nodeConnection.discordNode.webhookURL
      );

      if (response.message === "success") {
        nodeConnection.setDiscordNode((prev) => ({
          ...prev,
          content: "",
        }));
        toast.success("Discord message sent successfully!");
      } else {
        toast.error("Failed to send Discord message.");
      }
    } catch (error) {
      toast.error("Error sending Discord message: " + error.message);
      console.error("Discord message error:", error);
    }
  }, [nodeConnection.discordNode]);

  const handleNotionContent = useCallback(async () => {
    try {
      const response = await onCreateNewPageInDatabase(
        nodeConnection.notionNode.databaseId,
        nodeConnection.notionNode.accessToken,
        nodeConnection.notionNode.content
      );

      if (response) {
        nodeConnection.setNotionNode((prev: NotionNodeType) => ({
          ...prev,
          content: "",
        }));
        toast.success("Content stored successfully in Notion!");
      } else {
        toast.error("Failed to store content in Notion.");
      }
    } catch (error) {
      console.log(content)
      toast.error("Error storing content in Notion: " + error.message);
      console.error("Notion error:", error);
    }
  }, [nodeConnection.notionNode]);

  const handleSlackContent = useCallback(async () => {
    try {
      const response = await postMessageToSlack(
        nodeConnection.slackNode.slackAccessToken,
        channels || [],
        nodeConnection.slackNode.content
      );

      if (response.message === "Success") {
        toast.success("Slack message sent successfully!");
        nodeConnection.setSlackNode((prev) => ({
          ...prev,
          content: "",
        }));
        setChannels && setChannels([]);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error sending Slack message: " + error.message);
      console.error("Slack error:", error);
    }
  }, [nodeConnection.slackNode, channels, setChannels]);

  const createLocalNodeTemplate = useCallback(async () => {
    try {
      const content = currentService === "Notion" 
        ? JSON.stringify(nodeConnection.notionNode.content) 
        : nodeConnection[`${currentService.toLowerCase()}Node`].content;

      const response = await onCreateNodeTemplate(
        content,
        currentService,
        pathname.split("/").pop()!,
        channels,
        nodeConnection[`${currentService.toLowerCase()}Node`].accessToken,
        currentService === "Notion" ? nodeConnection.notionNode.databaseId : undefined
      );

      if (response) {
        toast.success("Template saved successfully!");
        console.log("Template response:", response);
      }
    } catch (error) {
      toast.error("Error saving template: " + error.message);
      console.error("Template save error:", error);
    }
  }, [currentService, nodeConnection, channels]);

  const renderActionButton = () => {
    const buttonActions = {
      Discord: (
        <>
          <Button variant="outline" onClick={handleDiscordMessage}>
            Test Message
          </Button>
          <Button onClick={createLocalNodeTemplate} variant="outline">
            Save Template
          </Button>
        </>
      ),
      Notion: (
        <>
          <Button variant="outline" onClick={handleNotionContent}>
            Test
          </Button>
          <Button onClick={createLocalNodeTemplate} variant="outline">
            Save Template
          </Button>
        </>
      ),
      Slack: (
        <>
          <Button variant="outline" onClick={handleSlackContent}>
            Send Message
          </Button>
          <Button onClick={createLocalNodeTemplate} variant="outline">
            Save Template
          </Button>
        </>
      ),
    };

    return buttonActions[currentService] || null;
  };

  return renderActionButton();
};

export default ActionButton;
