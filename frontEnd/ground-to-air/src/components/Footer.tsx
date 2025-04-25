// 모든 페이지에서 전체적으로 보여주는 하단바
import { useState } from "react";
import styled from "styled-components";

// Footer의 전체 컴포넌트 구성
const Bottom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: ${(props) =>
    `${props.theme.black.bg}E6`}; // 색상 투명도를 16진수로 계산한다.('E6'의 경우 10진수 기준으로 90% 투명도에 해당)
  color: ${(props) => props.theme.black.font};
`;

function Footer() {
  return <Bottom>ⓒ GroundToAir {new Date().getFullYear()}</Bottom>;
}

export default Footer;
