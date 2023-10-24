// import { getConfluencePages } from "./utils/getConfluence";
// import { getConfluencePageContent } from "./utils/getConfluencePageContent";
// import { getAlertsForTranscript } from "./model/model";
// import { upsertConfluencePage } from "./utils/upsertConfluencePage";
import React, { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";
import Select from "@atlaskit/select";
import Button from "@atlaskit/button";
import Textfield from "@atlaskit/textfield";
import PremiumIcon from "@atlaskit/icon/glyph/premium";
import LabelIcon from "@atlaskit/icon/glyph/label";
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
import { Box, Flex, Stack, xcss } from "@atlaskit/primitives";
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

  useEffect(async () => {
    // const confluencePages = await getConfluencePages();

    setInterval(async () => {
      let alertData = await invoke("getAlertsFromStorage");
      if (!Array.isArray(alertData)) {
        alertData = [];
      }
      setAlerts(alertData);
    }, 5000);

    const existingLabels = await invoke("getLabelsFromStorage");
    if (!Array.isArray(existingLabels)) await invoke("setLabels", labels);
    else setLabels(existingLabels);

    const confluencePages = await invoke("getConfluencePages");
    setApiData(confluencePages);
  }, []);

  return (
    <div
      style={{
        overflowY: "visible !important",
      }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Box
          xcss={xcss({
            width: "50%",
          })}
        >
          <Form
            onSubmit={async (formData) => {
              const pageData = await invoke(
                "getConfluencePageContent",
                formData.PageId.value
              );

              await invoke("getAlertsForTranscript", {
                pageData: pageData,
              });
            }}
          >
            {({ formProps, submitting }) => (
              <form {...formProps}>
                <Field label="Select page" name="PageId">
                  {({ fieldProps: { id, ...rest }, error }) => {
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
        </Box>
        <Stack space="space.150">
          <Button
            onClick={() => {
              setNotifyOpen(true);
            }}
            iconBefore={<PremiumIcon label="" size="medium" />}
          >
            Ask Wizard
          </Button>

          <Button
            onClick={() => {
              setLabelOpen(true);
            }}
            iconBefore={<LabelIcon label="" size="medium" />}
          >
            Add Label
          </Button>
        </Stack>
      </Flex>
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
                  let existingLabels = await invoke("getLabelsFromStorage");

                  // Append a value to the array
                  existingLabels.push(formData.label);

                  // Set the modified array back to storage
                  await invoke("setLabels", existingLabels);

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

      <ModalTransition>
        {isNotifyOpen && (
          <Modal onClose={() => setNotifyOpen(false)}>
            <ModalHeader>
              <ModalTitle>Ask Wizard!</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Form
                onSubmit={async (formData) => {
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
    </div>
  );
};

export default App;
