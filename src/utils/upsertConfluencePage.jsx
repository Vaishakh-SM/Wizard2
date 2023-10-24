import api, { route } from "@forge/api";
import { labelMap } from "../model/prompts";

const WIZARD_DEFAULT_TITLE = "Wizard Alerts";

export const upsertConfluencePage = async (req) => {
  const spaceKey = req.payload.modifiedTeamId;
  const pageName = req.payload.label;
  const alertData = req.payload.message;

  const spaceId = await getSpaceIdWithKey(spaceKey);
  const wizardPageId = await getPageIdWithTitle(WIZARD_DEFAULT_TITLE, spaceId);

  if (wizardPageId) {
    const pageId = await getPageIdWithTitle(pageName, spaceId);

    if (pageId) {
      const pageData = await getPageContent(pageId);
      let pageContent = pageData["content"];
      const pageVersion = await getPageVersion(pageId);
      const messages = ["warning", "info", "note", "success"];

      // Generate a random index within the array length
      const index = Math.floor(Math.random() * messages.length);

      // Get the random string based on the random index
      const panelType = messages[index];

      pageContent.push({
        type: "panel",
        attrs: { panelType: panelType },
        content: [
          {
            type: "paragraph",
            content: [{ text: alertData, type: "text" }],
          },
        ],
      });
      const newPageData = {
        ...pageData,
        content: pageContent,
      };

      await updatePageContent(
        pageId,
        pageName,
        JSON.stringify(newPageData),
        pageVersion + 1
      );
    } else {
      await createPage(pageName, spaceId, wizardPageId);
      await upsertConfluencePage({
        payload: {
          modifiedTeamId: spaceKey,
          label: pageName,
          message: alertData,
        },
      });
    }
  } else {
    await createPage(WIZARD_DEFAULT_TITLE, spaceId);
    await upsertConfluencePage({
      payload: {
        modifiedTeamId: spaceKey,
        label: pageName,
        message: alertData,
      },
    });
  }
};

export const getSpaceIdWithKey = async (spaceKey) => {
  const spaceResponse = await api
    .asUser()
    .requestConfluence(route`/wiki/api/v2/spaces?keys=${spaceKey}`, {
      headers: {
        Accept: "application/json",
      },
    });

  const spaceData = await spaceResponse.json();

  const spaceId = spaceData["results"][0]["id"];
  return spaceId;
};

export const getPageIdWithTitle = async (pageTitle, spaceId) => {
  const spacePageResponse = await api
    .asUser()
    .requestConfluence(
      route`/wiki/api/v2/spaces/${spaceId}/pages?title=${pageTitle}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
  const spacePageData = await spacePageResponse.json();

  if (spacePageData["results"][0]) {
    const pageId = spacePageData["results"][0]["id"];
    return pageId;
  } else {
    return null;
  }
};

export const createPage = async (pageTitle, spaceId, parentId) => {
  if (parentId) {
    var bodyData = `{
    "spaceId": "${spaceId}",
    "status": "current",
    "title": "${pageTitle}",
    "parentId": "${parentId}"
  }`;
  } else {
    var bodyData = `{
      "spaceId": "${spaceId}",
      "status": "current",
      "title": "${pageTitle}"
    }`;
  }

  const response = await api
    .asUser()
    .requestConfluence(route`/wiki/api/v2/pages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: bodyData,
    });
};

const getPageContent = async (pageId) => {
  const response = await api
    .asUser()
    .requestConfluence(
      route`/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

  const responseData = await response.json();
  return JSON.parse(responseData["body"]["atlas_doc_format"]["value"]);
};

const getPageVersion = async (pageId) => {
  const response = await api
    .asUser()
    .requestConfluence(
      route`/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

  const responseData = await response.json();
  return JSON.parse(responseData["version"]["number"]);
};

const updatePageContent = async (
  pageId,
  pageTitle,
  atlas_doc_string,
  version
) => {
  let bodyData = {
    id: pageId,
    status: "current",
    title: pageTitle,
    body: {
      representation: "atlas_doc_format",
      value: atlas_doc_string,
    },
    version: {
      number: version,
      message: "lol",
    },
  };

  bodyData = JSON.stringify(bodyData);
  const response = await api
    .asUser()
    .requestConfluence(route`/wiki/api/v2/pages/${pageId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: bodyData,
    });
};
