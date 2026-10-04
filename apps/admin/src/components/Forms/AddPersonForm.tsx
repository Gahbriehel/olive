"use client";

import React from "react";
import { PersonForm, PersonFormProps } from "./PersonForm";

export type AddPersonFormProps = Omit<PersonFormProps, "initialValues">;

/**
 * @deprecated Use `PersonForm` directly instead.
 */
export const AddPersonForm: React.FC<AddPersonFormProps> = (props) => {
  return <PersonForm {...props} />;
};

export default AddPersonForm;
