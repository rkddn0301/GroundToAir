import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { theme } from "./utils/theme";
import { RecoilRoot } from "recoil";

const GlobalStyle = createGlobalStyle`

@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400&display=swap');

/* 해당 스타일 전부 초기화 */
  html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* 구형 브라우저에서 HTML5의 display 역할을 초기화 */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
* {
  box-sizing: border-box;
}
body {
  font-family: 'Source Sans Pro', sans-serif;
 
}
a {
  text-decoration: none; // 밑줄 제거
  color: inherit; // 부모 요소의 텍스트 색상을 상속받음
}

   /* SweetAlert2 팝업에 대한 스타일 조정 */
   .swal2-popup {
    padding: 20px; // 팝업창 내부 공간 확보
  }

  .swal2-icon {
    margin: 0 auto; // 아이콘 중앙 정렬
  }

  /* DatePicker 입력창 스타일 수정 */
  .react-datepicker__input-container input {
    width: 100%;
    border: 1px solid ${(props) => props.theme.white.font}; 
    border-radius: 5px; /* 모서리 둥글게 */
    font-size: 12px; /* 폰트 크기 */
  }

  .react-datepicker__calendar-icon  {
    max-width : 10px;
    margin-top: -1.5%;
  }

`;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <RecoilRoot>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </RecoilRoot>
);
