const api = require("@forge/api");

export const getConfluencePages = async () => {
  const response = await api
    .asUser()
    .requestConfluence(api.route`/wiki/rest/api/content?type=page`);

  if (response.status === 200) {
    const data = await response.json();
    return data.results;
  } else {
    throw new Error("Failed to fetch Confluence pages");
  }
};
