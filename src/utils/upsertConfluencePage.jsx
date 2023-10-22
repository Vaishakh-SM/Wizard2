import api, { route } from "@forge/api";

const WIZARD_DEFAULT_TITLE = "Wizard Alerts";

export const upsertConfluencePage = async (req) => {
  console.log("UPSERT CALLED!");
  const spaceKey = req.modifiedTeamId;
  const pageName = req.label;
  const alertData = req.message;

  const spaceId = await getSpaceIdWithKey(spaceKey);
  // console.log("SPACE ID: ", spaceId);
  const wizardPageId = await getPageIdWithTitle(WIZARD_DEFAULT_TITLE, spaceId);

  if (wizardPageId) {
    const pageId = await getPageIdWithTitle(pageName, spaceId);

    if (pageId) {
      const pageData = await getPageContent(pageId);

      console.log("Page data: ", pageData);

      let pageContent = pageData["content"];
      const pageVersion = await getPageVersion(pageId);
      pageContent.push({
        type: "panel",
        attrs: { panelType: "info" },
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
      console.log("NEW PAGE DATA: ", newPageData);
      await updatePageContent(
        pageId,
        pageName,
        JSON.stringify(newPageData),
        pageVersion + 1
      );
    } else {
      await createPage(pageName, spaceId, wizardPageId);
      await upsertConfluencePage(spaceKey, pageName, alertData);
    }
  } else {
    console.log("ELSE ENTERED");
    await createPage(WIZARD_DEFAULT_TITLE, spaceId);
    await upsertConfluencePage(spaceKey, pageName, alertData);
  }
};

export const getSpaceIdWithKey = async (spaceKey) => {
  console.log("SPACE ID CALLED with key, ", spaceKey);
  const spaceResponse = await api
    .asUser()
    .requestConfluence(route`/wiki/api/v2/spaces?keys=${spaceKey}`, {
      headers: {
        Accept: "application/json",
      },
    });

  console.log("SPACE RESPONSE: ", spaceResponse);
  const spaceData = await spaceResponse.json();

  const spaceId = spaceData["results"][0]["id"];
  console.log("Space data: ", spaceData);
  console.log("Space id", spaceId);

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
  console.log("Space page data: ", spacePageData);
  if (spacePageData["results"][0]) {
    const pageId = spacePageData["results"][0]["id"];

    console.log("Page id", pageId);
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

  console.log("Create response: ", response);
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

  console.log("Body data: ", bodyData);
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

  console.log(`UPDATE Response: ${response.status} ${response.statusText}`);
  console.log(await response.json());
};
