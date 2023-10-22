import Button, { LoadingButton } from "@atlaskit/button";
import React, { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";
import { DynamicTableStateless } from "@atlaskit/dynamic-table";
import Lozenge from "@atlaskit/lozenge";
import Tag from "@atlaskit/tag";
import TagGroup from "@atlaskit/tag-group";
import { Box, xcss } from "@atlaskit/primitives";

function createKey(input) {
  return input ? input.replace(/^(the|a|an)/, "").replace(/\s/g, "") : input;
}

export const createHead = () => {
  return {
    cells: [
      {
        key: "alerts",
        content: "Alerts",
        isSortable: true,
        width: 25,
      },
      {
        key: "labels",
        content: "Labels",
        isSortable: true,
        width: 10,
      },
      {
        key: "teams",
        content: "Teams",
        shouldTruncate: true,
        isSortable: true,
        width: 15,
      },
      {
        key: "send",
        shouldTruncate: true,
        width: 7,
      },
      // {
      //   key: "edit",
      //   content: "Edit",
      //   shouldTruncate: true,
      //   width: 5,
      // },
      // {
      //   key: "Delete",
      //   content: "Delete",
      //   shouldTruncate: true,
      //   width: 5,
      // },
    ],
  };
};

export const createRows = (alerts, handleSendAlert) => {
  let retVal = alerts.map((el) => {
    return {
      key: `row-${el.id}`,
      isHighlighted: false,
      cells: [
        {
          key: createKey(el.message),
          content: el.message,
        },
        {
          key: createKey(el.label),
          content: (
            <Lozenge appearance="new" isBold>
              {el.label}
            </Lozenge>
          ),
        },
        {
          key: "teamIds",
          content: (
            <TagGroup>
              {el.componentNames.map((team) => {
                return (
                  <Tag
                    appearance="rounded"
                    removeButtonLabel="Remove"
                    text={team}
                  />
                );
              })}
            </TagGroup>
          ),
        },
        {
          key: "send",
          content: (
            // <Button
            //   onClick={async () => {
            //     console.log(
            //       "Clicked, will call handleSend Alert with ID: ",
            //       el
            //     );
            //     console.log("Clicked with alerts: ", alerts);
            //     await handleSendAlert(alerts, el.id);
            //   }}
            // >
            //   Send
            // </Button>

            <SendButton alerts={alerts} el={el} />
          ),
        },
        // {
        //   key: "edit",
        //   content: <Button> Edit </Button>,
        // },
        // {
        //   key: "delete",
        //   content: <Button> Delete </Button>,
        // },
      ],
    };
  });
  console.log("RETURNING: ", retVal);
  return retVal;
};

const handleSendAlert = async (alerts, id) => {
  const matchingAlerts = alerts.filter((alert) => alert.id === id);

  const result = matchingAlerts.map((alert) => ({
    message: alert.message,
    teamIds: alert.teamIds,
    label: alert.label,
  }));
  console.log("MATCHING ALERTS: ", result);

  const promises = result.map(async (data) => {
    return Promise.all(
      data.teamIds.map(async (teamId) => {
        const modifiedTeamId = teamId.split("/")[1].replace(/-/g, "");
        await invoke("upsertConfluencePage", {
          modifiedTeamId: modifiedTeamId,
          label: data.label,
          message: data.message,
        });
      })
    );
  });

  await Promise.all(promises);
};

const SendButton = (props) => {
  const [state, setState] = useState(0);
  useEffect(() => {
    console.log("PROPS: ", props);
  }, []);
  return (
    <div>
      {state == 0 && (
        <Button
          appearance="primary"
          onClick={async () => {
            setState(1);
            await handleSendAlert(props.alerts, props.el.id);
            setState(2);
          }}
        >
          Send
        </Button>
      )}

      {state == 1 && (
        <LoadingButton appearance="primary" isLoading>
          Send
        </LoadingButton>
      )}

      {state == 2 && <Lozenge appearance="success">Done!</Lozenge>}
    </div>
  );
};

const boxStyles = xcss({
  margin: "space.400",
});

export const AlertsTable = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(async () => {
    console.log("NEW TABLE");
    setInterval(async () => {
      let alertData = await invoke("getAlertsFromStorage");
      if (!Array.isArray(alertData)) {
        alertData = [];
      }
      console.log("Alert data: ", alertData);
      setAlerts(alertData);
    }, 5000);
  }, []);

  return (
    <Box padding="space.400" xcss={boxStyles}>
      <DynamicTableStateless
        head={createHead()}
        rows={createRows(alerts, handleSendAlert)}
        rowsPerPage={10}
        loadingSpinnerSize="large"
        isLoading={false}
        isFixedSize
        onSort={() => console.log("onSort")}
        onSetPage={() => console.log("onSetPage")}
      />
    </Box>
  );
};
