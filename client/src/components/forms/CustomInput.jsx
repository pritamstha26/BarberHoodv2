import React from "react";
import { Form } from "react-bootstrap";
//
export default function CustomInput({
  type,
  value,
  placeholder,
  change,

  name,
}) {
  return (
    <>
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={change}
      />
    </>
  );
}
