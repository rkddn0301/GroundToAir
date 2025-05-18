import { createProxyMiddleware } from "http-proxy-middleware";

/* 
 - '/api'로 들어오는 모든 요청을 프록시 하도록 설정한다.
 - target : 프록시 할 대상 서버의 주소를 지정한다.
 - changeOrigin : 프록시 서버(react)가 대상 서버(spring)에 요청을 보낼 때 요청의 출처를 변경하는 역할
*/
module.exports = function (app: any) {
  app.use(
    ["/air", "/user", "/reservation", "/country", "/payment"],
    createProxyMiddleware({
      target: process.env.REACT_APP_SPRINGBOOT_URL,
      changeOrigin: true,
    })
  );
};
