import graphqlGateway from "@atlassian/forge-graphql";

export const getCompassComponents = async (cloudId) => {
  try {
    console.log("Call");
    const response = await graphqlGateway.compass.asApp().searchComponents({
      cloudId: cloudId,
    });

    return response["data"]["components"];
  } catch (error) {
    console.error("Error fetching components:", error);
  }
};

export const getComponentDetails = async (id) => {
  try {
    const response = await graphqlGateway.compass
      .asApp()
      .getComponent({ componentId: id });
    return response;
  } catch (error) {
    console.error("Error fetching components:", error);
  }
};

export async function getAllComponentDetails(cloudId) {
  try {
    const allComponentResponse = await getCompassComponents(cloudId);
    const listOfIds = allComponentResponse.map((obj) => obj.id);

    const promises = listOfIds.map((id) => getComponentDetails(id));
    const responses = await Promise.all(promises);

    const componentDetails = {};
    responses.forEach((response) => {
      componentDetails[response.data.component.id] = {
        relationships: [
          ...response.data.component.relationships,
          { nodeId: response.data.component.id },
        ],
      };
    });

    allComponentResponse.forEach((el) => {
      const newValue = {
        ...componentDetails[el.id],
        name: el.name,
        ownerId: el.ownerId,
      };
      componentDetails[el.id] = newValue;
    });
    console.log("MAP: ", componentDetails);

    return componentDetails;
  } catch (error) {
    // Handle errors if needed
    console.error("An error occurred:", error);
    throw error;
  }
}
