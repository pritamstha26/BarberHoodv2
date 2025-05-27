import React, { Fragment } from "react";
import { Image } from "react-bootstrap";
import BarberLogo from "../assets/Logo.png";
//
export default function Logo() {
  return (
    <Image
      src={BarberLogo}
      className="rounded rounded-circle  "
      style={{ width: "100px" }}
    />
  );
}
