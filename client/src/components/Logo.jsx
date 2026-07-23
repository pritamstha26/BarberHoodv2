import React, { Fragment } from "react";
import { Image } from "react-bootstrap";
import restaurantLogo from "../assets/Logo.png";
//
export default function Logo() {
  return (
    <Image
      src={restaurantLogo}
      className="rounded rounded-circle  "
      style={{ width: "100px" }}
    />
  );
}
