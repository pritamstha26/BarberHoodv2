import React from "react";
import { Form } from "react-bootstrap";
//
export default function InputType() {
  return (
    <div>
      <Form.Control
        placeholder="Username"
        aria-label="Username"
        aria-describedby="basic-addon1"
      />
    </div>
  );
}
