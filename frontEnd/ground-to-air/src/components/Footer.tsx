import { useState } from "react";
import styled from "styled-components";

const Footers = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #595959;
  color: #f7fcfc;
`;

function Footer() {
  return <Footers>ⓒ GroundToAir {new Date().getFullYear()}</Footers>;
}

export default Footer;
