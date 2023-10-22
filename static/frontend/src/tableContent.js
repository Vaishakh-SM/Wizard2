import Button from "@atlaskit/button";

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
        content: "Send",
        shouldTruncate: true,
        isSortable: true,
        width: 15,
      },
      {
        key: "edit",
        content: "Edit",
        shouldTruncate: true,
        width: 5,
      },
      {
        key: "Delete",
        content: "Delete",
        shouldTruncate: true,
        width: 5,
      },
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
          content: el.label,
        },
        {
          key: "teamIds",
          content: (
            <div>
              {el.componentNames.map((team) => {
                return <div>{team}</div>;
              })}
            </div>
          ),
        },
        {
          key: "send",
          content: (
            <Button
              onClick={async (el) => {
                await handleSendAlert(el.id);
              }}
            >
              Send
            </Button>
          ),
        },
        {
          key: "edit",
          content: <Button> Edit </Button>,
        },
        {
          key: "delete",
          content: <Button> Delete </Button>,
        },
      ],
    };
  });
  console.log("RETURNING: ", retVal);
  return retVal;
};
// {
//         "message": "Performance bottlenecks observed in Fern Database. Kubernetes can improve scalability and ensure high availability.",
//         "component": "Fern Database",
//         "label": "Library-Changes",
//         "id": 0,
//         "teamIds": [
//             "ari:cloud:teams::team/1624cf39-bd43-43f0-8ab1-552f436b57b8"
//         ],
//         "componentNames": [
//             "Fern Database"
//         ]
//     }

// {
//     key: `row-${index}-${president.name}`,
//     isHighlighted: false,
//     cells: [
//       {
//         key: createKey(president.name),
//         content: (
//           <NameWrapper>
//             <AvatarWrapper>
//               <Avatar name={president.name} size="medium" />
//             </AvatarWrapper>
//             <a href="https://atlassian.design">{president.name}</a>
//           </NameWrapper>
//         ),
//       },
//       {
//         key: createKey(president.party),
//         content: president.party,
//       },
//       {
//         key: president.id,
//         content: president.term,
//       },
//       {
//         key: 'Lorem',
//         content: iterateThroughLorem(index),
//       },
//       {
//         key: 'MoreDropdown',
//         content: (
//           <DropdownMenu trigger="More">
//             <DropdownItemGroup>
//               <DropdownItem>{president.name}</DropdownItem>
//             </DropdownItemGroup>
//           </DropdownMenu>
//         ),
//       },
//     ],
//   }
