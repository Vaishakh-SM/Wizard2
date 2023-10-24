import Resolver from "@forge/resolver";
import { storage } from "@forge/api";
import { getAlertsForTranscript } from "./model/model";
import { Queue } from "@forge/events";

const resolver = new Resolver();

resolver.define("event-listener", async ({ payload, context }) => {
  const pageData = payload["pageData"];
  const cloudId = payload["cloudId"];
  const alerts = await getAlertsForTranscript(pageData, cloudId);
  await storage.set("alerts", alerts);
});

export const handler = resolver.getDefinitions();
export const importQueue = new Queue({ key: "alerts-queue" });
