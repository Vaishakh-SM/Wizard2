// import { getConfluencePages } from "./utils/getConfluence";
// import { getConfluencePageContent } from "./utils/getConfluencePageContent";
// import { getAlertsForTranscript } from "./model/model";
// import { upsertConfluencePage } from "./utils/upsertConfluencePage";
import React, { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";
import Select from "@atlaskit/select";
import Button from "@atlaskit/button";
import Textfield from "@atlaskit/textfield";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalDialog,
} from "@atlaskit/modal-dialog";

import ButtonGroup from "@atlaskit/button/button-group";
import LoadingButton from "@atlaskit/button/loading-button";
import Form, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormFooter,
  FormHeader,
  FormSection,
  HelperMessage,
  RequiredAsterisk,
  ValidMessage,
  Label,
} from "@atlaskit/form";
import { DynamicTableStateless } from "@atlaskit/dynamic-table";

import TextArea from "@atlaskit/textarea";
import { createHead, createRows } from "./tableContent";

const App = () => {
  const [isNotifyOpen, setNotifyOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [editedAlertId, setEditedAlertId] = useState(null);
  const [labels, setlabels] = useState(["API-Depreciation", "Library-Changes"]);
  const [updateAlerts, setUpdateAlerts] = useState(0);
  const [isLabelOpen, setLabelOpen] = useState(false);
  const [sendAlertId, setSendAlertId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const handleEditAlert = (alertId) => {
    setEditedAlertId(alertId);
  };

  const handleSubmitEditAlert = (formData) => {
    let updatedAlerts = alerts.map((alert) =>
      alert.id === editedAlertId
        ? {
            ...alert,
            message: formData.editedAlert,
            teamIds: formData.selectedTeams,
          }
        : alert
    );

    setAlerts(updatedAlerts); // Update the state with the modified alerts array
    setEditedAlertId(null); // Clear the edited alert ID
  };

  const handleSendAlert = async (id) => {
    // Code to send to diff confluence pages.

    // Filter the alerts array to find elements with a matching "id"
    const matchingAlerts = alerts.filter((alert) => alert.id === id);

    const result = matchingAlerts.map((alert) => ({
      message: alert.message,
      teamIds: alert.teamIds,
      label: alert.label,
    }));

    const promises = result.map(async (data) => {
      return Promise.all(
        data.teamIds.map(async (teamId) => {
          const modifiedTeamId = teamId.split("/")[1].replace(/-/g, "");
          // await upsertConfluencePage(modifiedTeamId, data.label, data.message);
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

  const handleDeleteAlert = (alertId) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
    setAlerts(updatedAlerts);
  };

  useEffect(async () => {
    // const confluencePages = await getConfluencePages();
    // await invoke("setLabels", labels);
    setInterval(async () => {
      const alertData = await invoke("getAlertsFromStorage");
      console.log("Alert data: ", alertData);
      setAlerts(alertData);
    }, 2000);
    const confluencePages = await invoke("getConfluencePages");
    setApiData(confluencePages);
    console.log(confluencePages);

    const existingArray = await invoke("getLabelsFromStorage");
    if (existingArray) setlabels(existingArray);
    else await await invoke("setLabels", labels);
  }, []);

  return (
    <div
      style={{
        overflowY: "visible !important",
      }}
    >
      <Button
        onClick={() => {
          setNotifyOpen(true);
        }}
      >
        Ask Wizard
      </Button>
      <ModalTransition>
        {isNotifyOpen && (
          <Modal onClose={() => setNotifyOpen(false)}>
            <ModalHeader>
              <ModalTitle>Ask Wizard!</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={async (formData) => {
                  console.log("ID: ", formData.customTranscripts);
                  // const alertData = await getAlertsForTranscript(
                  //   formData.customTranscripts
                  // );

                  await invoke("getAlertsForTranscript", {
                    pageData: formData.customTranscripts,
                    cloudId: productContext.cloudId,
                  });
                  const alertData = await invoke("getAlertsFromStorage");
                  setAlerts(alertData);
                }}
              >
                {({ formProps, submitting }) => (
                  <form {...formProps}>
                    <FormSection>
                      <Field
                        name="customTranscripts"
                        label="Enter your message here"
                      >
                        {(fieldProps) => (
                          <TextArea {...fieldProps} defaultValue="Type..." />
                        )}
                      </Field>
                    </FormSection>
                    <FormFooter>
                      <ButtonGroup>
                        <Button appearance="subtle">Cancel</Button>
                        <LoadingButton
                          type="submit"
                          appearance="primary"
                          isLoading={submitting}
                        >
                          Ask Wizard
                        </LoadingButton>
                      </ButtonGroup>
                    </FormFooter>
                  </form>
                )}
              </Form>
            </ModalBody>
          </Modal>
        )}
      </ModalTransition>
      <Button
        onClick={() => {
          setLabelOpen(true);
        }}
      >
        Add Label
      </Button>
      <Form
        onSubmit={async (formData) => {
          console.log("ID: ", formData.PageId.label);
          // const pageData = await getConfluencePageContent(formData.id);
          // setAlertFormData(0);
          const pageData = await invoke(
            "getConfluencePageContent",
            formData.PageId.value
          );
          console.log("PageData: ", pageData);
          await invoke("getAlertsForTranscript", {
            pageData: pageData,
          });
          // const jobId = await importQueue.push({
          //   pageData: pageData,
          //   cloudId: productContext.cloudId,
          // });
        }}
      >
        {({ formProps, submitting }) => (
          <form {...formProps}>
            <Field label="Select page" name="PageId">
              {({ fieldProps: { id, ...rest }, error }) => {
                console.log("ID FORM: ", id);
                return (
                  <div>
                    <Select
                      inputId={id}
                      options={apiData.map((el) => {
                        return { value: el.id, label: el.title };
                      })}
                      {...rest}
                    />
                    {error && <div>{error}</div>}
                  </div>
                );
              }}
            </Field>
            <FormFooter>
              <ButtonGroup>
                <Button appearance="subtle">Cancel</Button>
                <LoadingButton
                  type="submit"
                  appearance="primary"
                  isLoading={submitting}
                >
                  Submit
                </LoadingButton>
              </ButtonGroup>
            </FormFooter>
          </form>
        )}
      </Form>
      <DynamicTableStateless
        head={createHead()}
        rows={createRows(alerts, handleSendAlert)}
        rowsPerPage={5}
        page={pageNumber}
        loadingSpinnerSize="large"
        isLoading={false}
        isFixedSize
        onSort={() => console.log("onSort")}
        onSetPage={() => console.log("onSetPage")}
      />
      {/* <Table>
        <Head>
          <Cell>Alert</Cell>
          <Cell>Teams</Cell>

          <Cell>Label</Cell>

          <Cell>Send</Cell>

          <Cell>Edit</Cell>

          <Cell>Delete</Cell>
        </Head>
        {alerts.map((alert) => (
          <Row>
            <Cell>{alert.message}</Cell>
            <Cell>
              {alert.componentNames.map((team, index) => (
                <div>
                  {index > 0 && " "}
                  {team}
                </div>
              ))}
            </Cell>

            <Cell>{alert.label}</Cell>

            <Cell>
              <Button
                text="Send"
                onClick={async () => {
                  await handleSendAlert(alert.id);
                }}
              />
            </Cell>

            <Cell>
              <Button
                text="Edit the Alert"
                onClick={() => handleEditAlert(alert.id)}
              />
              {editedAlertId === alert.id && (
                <ModalDialog
                  header="Edit the Alert"
                  onClose={() => setEditedAlertId(null)}
                >
                  <Form
                    onSubmit={handleSubmitEditAlert}
                    submitButtonText="Save"
                  >
                    <Textfield
                      label="Edit Alert"
                      name="editedAlert"
                      defaultValue={alert.message}
                    />

                    <Select
                      label="Select Teams"
                      name="selectedTeams"
                      isMulti
                      options={() =>
                        alert.teamIds.map((team) => ({
                          value: team,
                          label: team,
                        }))
                      }
                    />
                  </Form>
                </ModalDialog>
              )}
            </Cell>

            <Cell>
              <Button
                text="Delete"
                onClick={() => handleDeleteAlert(alert.id)}
              />
            </Cell>
          </Row>
        ))}
      </Table> */}

      {isLabelOpen && (
        <ModalTransition>
          <Modal onClose={() => setLabelOpen(false)}>
            <ModalHeader>Labels</ModalHeader>
            <ModalBody>
              {/* <Form
                onSubmit={async (formData) => {
                  console.log("Label: ", formData.createLabel);
                  const existingArray = await invoke("getLabelsFromStorage");

                  // Append a value to the array
                  existingArray.push(formData.createLabel);

                  // Set the modified array back to storage
                  await invoke("setLabels", existingArray);

                  console.log("Array with appended value:", existingArray);
                  setlabels(existingArray);
                }}
              >
                <FormSection>
                  <Field label="Search your label" name="id">
                    <Select
                      options={() =>
                        labels.map((label, index) => {
                          return { value: index, label: label };
                        })
                      }
                    />
                  </Field>
                </FormSection>
                <Textfield name="createLabel" defaultValue="Add a new Label" />
              </Form> */}
            </ModalBody>
          </Modal>
        </ModalTransition>
      )}
    </div>
  );
};

export default App;
