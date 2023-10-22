const api = require("@forge/api");

export const getConfluencePageContent = async (contentId) => {
  const response = await api
    .asUser()
    .requestConfluence(
      api.route`/wiki/api/v2/pages/${contentId}?body-format=atlas_doc_format`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

  if (response.status === 200) {
    const data = await response.json();

    const pageContentJSON = JSON.parse(data.body.atlas_doc_format.value);

    let allParagraphsText = "";

    if (pageContentJSON.content) {
      pageContentJSON.content.forEach((block) => {
        if (block.type === "paragraph" && block.content) {
          const paragraphText = block.content
            .map((content) => content.text)
            .join(" "); // Join text elements within the paragraph

          allParagraphsText += paragraphText + "\n"; // Append paragraph text to the accumulator with a newline
        }
      });
    }

    return allParagraphsText;
  } else {
    throw new Error("Failed to fetch Confluence page data");
  }
};
