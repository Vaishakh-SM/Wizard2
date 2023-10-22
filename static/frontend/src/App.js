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
import { AlertsTable, createHead, createRows } from "./tableContent";

const App = () => {
  const [isNotifyOpen, setNotifyOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [editedAlertId, setEditedAlertId] = useState(null);
  const [labels, setLabels] = useState(["API-Depreciation", "Library-Changes"]);
  const [isLabelOpen, setLabelOpen] = useState(false);
  const [sendAlertId, setSendAlertId] = useState(null);

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

    setInterval(async () => {
      let alertData = await invoke("getAlertsFromStorage");
      if (!Array.isArray(alertData)) {
        alertData = [];
      }
      console.log("Alert data: ", alertData);
      setAlerts(alertData);
    }, 5000);

    const existingLabels = await invoke("getLabelsFromStorage");
    console.log("LABELS:", existingLabels);
    if (!Array.isArray(existingLabels)) await invoke("setLabels", labels);
    else setLabels(existingLabels);

    const confluencePages = await invoke("getConfluencePages");
    setApiData(confluencePages);
    console.log(confluencePages);
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
                  console.log("ask Wizard formdata: ", formData);
                  // const alertData = await getAlertsForTranscript(
                  //   formData.customTranscripts
                  // );

                  await invoke("getAlertsForTranscript", {
                    pageData: formData.customTranscripts,
                  });
                }}
              >
                {({ formProps, submitting }) => (
                  <form {...formProps}>
                    <FormSection>
                      <Field
                        name="customTranscripts"
                        label="What do you want to ask wizard?"
                      >
                        {({ fieldProps }) => <Textfield {...fieldProps} />}
                      </Field>
                    </FormSection>
                    <FormFooter>
                      <ButtonGroup>
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
          const pageData = await invoke(
            "getConfluencePageContent",
            formData.PageId.value
          );
          console.log("PageData: ", pageData);
          await invoke("getAlertsForTranscript", {
            pageData: pageData,
          });
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
                <LoadingButton
                  type="submit"
                  appearance="primary"
                  isLoading={submitting}
                >
                  Get Alerts
                </LoadingButton>
              </ButtonGroup>
            </FormFooter>
          </form>
        )}
      </Form>

      <AlertsTable />

      {isLabelOpen && (
        <ModalTransition>
          <Modal onClose={() => setLabelOpen(false)}>
            <ModalHeader>
              <ModalTitle>Add Label</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={async (formData) => {
                  console.log("Label: ", formData.label);
                  let existingLabels = await invoke("getLabelsFromStorage");

                  // Append a value to the array
                  existingLabels.push(formData.label);

                  // Set the modified array back to storage
                  await invoke("setLabels", existingLabels);

                  console.log("Array with appended value:", existingLabels);
                  setLabels(existingLabels);
                }}
              >
                {({ formProps, submitting }) => (
                  <form {...formProps}>
                    <FormSection>
                      <Field
                        name="label"
                        label="Write a label name"
                        defaultValue=""
                      >
                        {({ fieldProps }) => <Textfield {...fieldProps} />}
                      </Field>
                    </FormSection>

                    <FormFooter>
                      <ButtonGroup>
                        <LoadingButton
                          type="submit"
                          appearance="primary"
                          isLoading={submitting}
                        >
                          Add
                        </LoadingButton>
                      </ButtonGroup>
                    </FormFooter>
                  </form>
                )}
              </Form>
            </ModalBody>
          </Modal>
        </ModalTransition>
      )}
    </div>
  );
};

export default App;
