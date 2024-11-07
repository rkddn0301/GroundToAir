// 회원가입, 로그인 등 정보입력에 사용될 박스 컴포넌트

import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";

const Box = styled.div`
  width: 50%;
  min-height: 80vh;
  border-radius: 25px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); // 그림자 효과 추가
`;

const BoxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px 15px 5px 15px; // 순서 : 위 오른 아래 왼
`;

const Icon = styled.svg`
  width: 36px;
  cursor: pointer;
`;

const BoxFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px 15px 15px 15px; // 순서 : 위 오른 아래 왼
`;

// children : 상위컴포넌트에서 InfoBox 안에 무언가 넣은 값을 의미함
function InfoBox({ children }: any) {
  const history = useHistory();
  const currentRoute = history.location.pathname; // 현재 Route 위치 파악

  return (
    <Box>
      <BoxHeader>
        <Icon
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
          onClick={() => history.goBack()} // 뒤로가기
        >
          <path
            fillRule="evenodd"
            d="M7.28 7.72a.75.75 0 0 1 0 1.06l-2.47 2.47H21a.75.75 0 0 1 0 1.5H4.81l2.47 2.47a.75.75 0 1 1-1.06 1.06l-3.75-3.75a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </Icon>
        <Link to="/">
          <Icon
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </Icon>
        </Link>
      </BoxHeader>

      {children}

      <BoxFooter>
        {/* 회원가입 페이지일 경우 */}
        {currentRoute === "/join" && (
          <div>
            <Link to="/login">로그인 페이지로 이동</Link>
          </div>
        )}

        {/* 로그인 페이지일 경우 */}
        {currentRoute === "/login" && (
          <div>
            <Link to="/join">회원가입</Link> {" | "}
            <Link to="/idFind">아이디찾기</Link> {" | "}
            <Link to="/pwFind">비밀번호 찾기</Link>
          </div>
        )}

        {/* 아이디 찾기 */}
        {currentRoute === "/idFind" && (
          <div>
            <Link to="/join">회원가입</Link> {" | "}
            <Link to="/login">로그인</Link> {" | "}
            <Link to="/pwFind">비밀번호 찾기</Link>
          </div>
        )}

        {/* 비밀번호 찾기 */}
        {currentRoute === "/pwFind" && (
          <div>
            <Link to="/join">회원가입</Link> {" | "}
            <Link to="/login">로그인</Link> {" | "}
            <Link to="/idFind">아이디 찾기</Link>
          </div>
        )}
      </BoxFooter>
    </Box>
  );
}

export default InfoBox;
