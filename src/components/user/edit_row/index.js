import React, { useState } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import _ from "lodash-es";
import {
  Button,
  Dialog,
  Intent,
  Classes,
  FormGroup,
  ProgressBar
} from "@blueprintjs/core";
import { handleNumberChange } from "@blueprintjs/docs-theme";
import { updateUser, getUsers } from "store/actions/user";
import { showToast } from "store/actions/toast";
import withToast from "hoc/withToast";
import { USER_FIELDS } from "constants/index";

const EditRow = props => {
  const { updateUser, params, getUsers, showToast, selectedRow } = props;
  const [isOpen, toggleDialog] = useState(false);
  const [value, setValue] = useState(selectedRow.role);
  const handleValueChange = handleNumberChange(value => setValue(value));

  const fieldList = [
    "firstName",
    "lastName",
    "email",
    "password",
    "role",
    "preferredWorkingHours"
  ];

  const validation = {};
  _.toPairs(_.pick(USER_FIELDS, fieldList)).map(
    a => (validation[a[0]] = _.get(a[1], "validate", null))
  );
  const validateSchema = Yup.object().shape(validation);

  const handleSubmit = (values, actions) => {
    values["role"] = value;
    if (values["password"].includes("******")) {
      _.omit(values, ["password"]);
    }
    updateUser({
      id: selectedRow._id,
      body: values,
      success: () => {
        actions.setSubmitting(false);
        getUsers({ params });
        showToast({
          message: "Successfully updated selected user!",
          intent: Intent.SUCCESS,
          timeout: 3000
        });
        toggleDialog(false);
      },
      fail: err => {
        actions.setSubmitting(false);
        showToast({
          message: err.response.data,
          intent: Intent.DANGER
        });
      }
    });
  };

  const passToProps = {
    onChange: handleValueChange,
    selectedValue: value
  };

  const initialValue = {};
  _.toPairs(_.pick(USER_FIELDS, fieldList)).map(
    a => (initialValue[a[0]] = _.get(selectedRow, a[0], ""))
  );
  initialValue["password"] = "********";

  return (
    <>
      <Button
        icon="edit"
        className={Classes.MINIMAL}
        intent={Intent.PRIMARY}
        onClick={() => toggleDialog(true)}
      >
        Edit
      </Button>
      <Dialog
        icon="edit"
        isOpen={isOpen}
        onClose={() => toggleDialog(false)}
        title="Edit User"
      >
        <div className={Classes.DIALOG_BODY}>
          <Formik
            onSubmit={handleSubmit}
            initialValues={initialValue}
            validationSchema={validateSchema}
          >
            {({ submitForm, isSubmitting, errors }) => {
              return (
                <Form>
                  {fieldList.map(field => {
                    return (
                      <FormGroup
                        helperText={errors[field]}
                        intent={errors[field] ? Intent.DANGER : Intent.NONE}
                        label={USER_FIELDS[field].form_label}
                        labelFor={USER_FIELDS[field].id}
                      >
                        <Field
                          {...USER_FIELDS[field]}
                          {...(field === "role" ? passToProps : null)}
                        />
                      </FormGroup>
                    );
                  })}
                  {isSubmitting && <ProgressBar />}
                  <br />
                  <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button text="Cancel" onClick={() => toggleDialog(false)} />
                    <Button
                      icon="edit"
                      intent={Intent.PRIMARY}
                      onClick={submitForm}
                      text="Edit"
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </Dialog>
    </>
  );
};

const mapStateToProps = state => ({
  params: state.user.params
});

const mapDispatchToProps = {
  updateUser: updateUser,
  getUsers: getUsers,
  showToast: showToast
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withToast(EditRow)
);
