import {
  getAllComponentDetails,
  getCompassComponents,
} from "../utils/getCompassComponents";
import { prompt1 } from "./prompts";
import { prompt2 } from "./prompts";
import { storage } from "@forge/api";

// Initialize the conversation with a system message
const chats = [
  { role: "system", content: "You are a helpful summarizer and classifier." },
];

let pr1 = prompt1;
let pr2 = prompt2;

export const getAlertsForTranscript = async (transcript, cloudId) => {
  // Use compass + transcript in the prompt
  console.log("CloudID is : ", cloudId);
  const componentDetails = await getAllComponentDetails(cloudId);
  console.log("Components are: ", componentDetails);

  let componentNames = Object.values(componentDetails).map(
    (component) => component.name
  );

  pr1 = pr1 + componentNames.join("\n");

  // Create a string with component names separated by newline characters
  console.log("Component Names:", componentNames);

  // Now get the labels from Forge database
  const labels = await storage.get("labels");
  const labels_string = labels.join("\n");

  const findata = await performInteractions(transcript, labels_string);
  let transcriptAlerts = findata;
  // let transcriptAlerts = JSON.parse(
  //   findata["message"]["function_call"]["arguments"]
  // );
  console.log("FINDATA: ", transcriptAlerts);

  const alertComponents = new Set();
  let componentNameSet = new Set(componentNames);
  transcriptAlerts["alerts"] = transcriptAlerts["alerts"].map((el, index) => {
    if (componentNameSet.has(el["component"])) {
      alertComponents.add(el["component"]);
      return { ...el, id: index };
    } else {
      alertComponents.add(componentNames[0]);
      return { ...el, component: componentNames[0], id: index };
    }
  });

  const alertTeams = {};

  Object.values(componentDetails).forEach((el) => {
    el.relationships.forEach((relationship) => {
      const dependsOn = componentDetails[relationship.nodeId]["name"];
      if (alertComponents.has(dependsOn)) {
        if (alertTeams.hasOwnProperty(dependsOn)) {
          alertTeams[dependsOn] = {
            teamIds: [...alertTeams[dependsOn]["teamIds"], el.ownerId],
            componentNames: [
              ...alertTeams[dependsOn]["componentNames"],
              el.name,
            ],
          };
        } else {
          alertTeams[dependsOn] = {
            teamIds: [el.ownerId],
            componentNames: [el.name],
          };
        }
      }
    });
  });
  console.log("ALERT TEAMS: ", alertTeams);
  console.log("TRANSCRIPT ALERTS BEFORE: ", transcriptAlerts);

  transcriptAlerts["alerts"] = transcriptAlerts["alerts"].map((el) => {
    if (alertTeams.hasOwnProperty(el.component)) {
      return {
        ...el,
        teamIds: alertTeams[el.component]["teamIds"],
        componentNames: alertTeams[el.component]["componentNames"],
      };
    } else {
      return {
        ...el,
        teamIds: [],
        componentNames: [],
      };
    }
  });
  console.log("Transcript Alerts: ", transcriptAlerts);
  return transcriptAlerts["alerts"];
};

const callOpenAI = async (chats) => {
  console.log("Inside the API call");
  //console.log(chats);
  const choiceCount = 1;
  const url = `https://api.openai.com/v1/chat/completions`;
  const payload = {
    model: "gpt-3.5-turbo",
    n: choiceCount,
    messages: chats,
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer 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`,
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify(payload),
  };

  console.log("Before API Call");

  try {
    const response = await api.fetch(url, options);
    const data = await response.json();
    console.log("API Call Successful !");
    console.log(data);

    // Check if the response contains choices and messages
    if (data.choices && data.choices[0].message) {
      const assistantResponse = data.choices[0].message.content;
      return assistantResponse;
    } else {
      console.error("No valid assistant response found in the API response.");
      return "No valid response";
    }
  } catch (error) {
    console.error("Error in API Call:", error);
    throw error;
  }
};

const callOpenAIfin = async (msg) => {
  console.log("Inside the FINAL API call");
  console.log(msg);
  const choiceCount = 1;
  const url = `https://api.openai.com/v1/chat/completions`;
  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: msg,
      },
    ],
    functions: [
      {
        name: "get_alerts",
        description:
          "Get the alert messages and alert labels for each component",
        parameters: {
          type: "object",
          properties: {
            alerts: {
              type: "array",
              items: {
                message: {
                  type: "string",
                  description: "The alert message",
                },
                component: {
                  type: "string",
                  description: "The alert component",
                },
                label: {
                  type: "string",
                  description: "The alert label",
                },
              },
              description:
                "List of alerts each containing component and message",
            },
          },
          required: ["alerts", "message", "component", "label"],
        },
      },
    ],
    function_call: "auto",
  };
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer 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`,
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify(payload),
  };

  try {
    const response = await api.fetch(url, options);
    const data = await response.json();
    console.log("FINAL API Call Successful !");
    console.log(data);
    const messageContent = data.choices[0].message.content;
    console.log(messageContent);
    return data; // Return the extracted JSON data
  } catch (error) {
    console.error("Error in API Call:", error);
    throw error;
  }
};

// Perform the interactions
async function performInteractions(transcript, labels_string) {
  let msg = "";
  for (let i = 0; i < 3; i++) {
    let assistantReply = "";

    if (i == 0) {
      const userMessage = pr1 + transcript; // User's message in this interaction
      chats.push({ role: "user", content: userMessage });
      assistantReply = await callOpenAI(chats);
      console.log(`Assistant's reply 1: ${assistantReply}`);
      chats.push({ role: "assistant", content: assistantReply });
      //console.log(chats);
    }

    if (i == 1) {
      const userMessage = pr2 + labels_string; // To get labels
      chats.push({ role: "user", content: userMessage });
      assistantReply = await callOpenAI(chats);
      console.log(`Assistant's reply 2: ${assistantReply}`);
      msg = assistantReply;
      chats.push({ role: "assistant", content: assistantReply });
      //console.log(chats);
    }

    if (i == 2) {
      // const userMessage = assistantReply; // To get labels
      // chats.push({ role: "user", content: userMessage });
      // assistantReply = await callOpenAIfin(msg);
      // console.log(`Assistant's reply 3: ${JSON.stringify(assistantReply)}`);
      // chats.push({ role: "assistant", content: assistantReply });
      // return assistantReply["choices"][0];

      return parseAlerts(msg);
    }
  }

  // Here, you can access the entire conversation stored in the 'chats' array if needed.
  //console.log('Full Conversation:', chats);
}

const getAlertsForJiraIssue = (jiraDesc) => {};

function parseAlerts(paragraph) {
  const alerts = [];
  const alertMatches = paragraph.match(/Alert \d+:([\s\S]*?)(?=Alert \d+|$)/g);

  if (alertMatches) {
    for (const alertText of alertMatches) {
      const messageMatch = alertText.match(
        /Message:\s*(.*?)(?=(Component:|Label:|$))/s
      );
      const componentMatch = alertText.match(
        /Component:\s*(.*?)(?=(Message:|Label:|$))/s
      );
      const labelMatch = alertText.match(
        /Label:\s*(.*?)(?=(Message:|Component:|$))/s
      );

      alerts.push({
        message: (messageMatch && messageMatch[1].trim()) || "",
        component: (componentMatch && componentMatch[1].trim()) || "",
        label: (labelMatch && labelMatch[1].trim()) || "",
      });
    }
  }

  return { alerts };
}
