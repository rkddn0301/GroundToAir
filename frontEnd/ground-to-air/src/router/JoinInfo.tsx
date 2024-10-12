// 회원정보입력 페이지

import styled from "styled-components";
import Title from "../components/Title";
import InfoBox from "../components/InfoBox";
import { useState } from "react";

const Container = styled.div`
  padding-top: 50px;
`;

function JoinInfo() {
  const [userId, setUserId] = useState(""); // 아이디
  const [password, setPassword] = useState(""); // 비밀번호
  const [userName, setUserName] = useState(""); // 성명
  const [birth, setBirth] = useState(""); // 생년월일
  const [gender, setGender] = useState(""); // 성별
  const [email, setEmail] = useState(""); // 이메일

  const genderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value);
  };

  const infoSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 새로고침 방지
    console.log(userId, password, userName, birth, gender, email);
  };

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <form>
          <div>
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              placeholder="gildong1231"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="name">성명</label>
            <input
              type="text"
              id="name"
              placeholder="홍길동"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div>
            <label>성별</label>
            <label>
              <input
                type="radio"
                name="gender"
                value="M"
                onChange={genderChange}
              />{" "}
              남
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="F"
                onChange={genderChange}
              />{" "}
              여
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="N"
                onChange={genderChange}
              />{" "}
              비공개
            </label>
          </div>

          <div>
            <label htmlFor="birthdate">생년월일</label>
            <input
              type="date"
              id="birthdate"
              placeholder="2000-12-31"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              placeholder="gildong1231@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button onClick={infoSubmit}>회원가입</button>
          </div>
        </form>
      </InfoBox>
    </Container>
  );
}

export default JoinInfo;
