// theme.ts에서 이용할 모듈 지정

import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    background: string;
    black: {
      bg: string;
      font: string;
      warning: string;
    };
    white: {
      bg: string;
      font: string;
      warning: string;
    };
  }
}
