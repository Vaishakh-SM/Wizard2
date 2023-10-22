import Resolver from "@forge/resolver";
import { upsertConfluencePage } from "./utils/upsertConfluencePage";
import { getConfluencePages } from "./utils/getConfluence";
import { getConfluencePageContent } from "./utils/getConfluencePageContent";
import { getAlertsForTranscript } from "./model/model";
import { importQueue } from "./consumer";
import { storage } from "@forge/api";

const resolver = new Resolver();

resolver.define("upsertConfluencePage", upsertConfluencePage);

resolver.define("getConfluencePages", getConfluencePages);

resolver.define("getConfluencePageContent", async (req) => {
  console.log("PAGEID: ", req);
  return await getConfluencePageContent(req.payload);
});

resolver.define("getAlertsForTranscript", async (req) => {
  console.log("REQ IS ", req);
  await importQueue.push({
    pageData: req.payload.pageData,
    cloudId: req.context.cloudId,
  });
});

resolver.define("getAlertsFromStorage", async () => {
  return await storage.get("alerts");
});

resolver.define("getLabelsFromStorage", async () => {
  return await storage.get("labels");
});

resolver.define("setLabels", async (req) => {
  console.log("FOR SETLABEL, req is : ", req);
  storage.set("labels", req.payload);
});
export const handler = resolver.getDefinitions();
