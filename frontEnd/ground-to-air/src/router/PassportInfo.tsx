import styled from "styled-components";
import Title from "../components/Title";
import InfoBox from "../components/InfoBox";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { useRecoilValue } from "recoil";
import { JoinUserNo } from "../atom";

const Container = styled.div`
  padding-top: 50px;
`;

const GuideLine = styled.div`
  color: red;
  font-size: 11px;
  display: flex;
  justify-content: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 15px;
  gap: 15px;
`;

const Field = styled.div`
  position: relative;
  width: 80%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

const HalfFields = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-between;
`;
const HalfField = styled.div`
  position: relative;
  width: 45%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

const Label = styled.label`
  position: absolute;
  top: -7px;
  left: 8px;
  padding: 0 5px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => props.theme.white.bg};
`;

const WriteInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  padding: 5px 0 0 0;
  outline: none;
`;

const CalendarInput = styled.div`
  display: flex;
  justify-content: center;

  input {
    width: 600px;
  }
  @media (max-width: 480px) {
    input {
      width: 100px;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    input {
      width: 150px;
    }
  }

  @media (min-width: 769px) and (max-width: 1280px) {
    input {
      width: 300px;
    }
  }

  @media (min-width: 1281px) and (max-width: 1579px) {
    input {
      width: 500px;
    }
  }
`;

const SelectMenu = styled.div`
  display: flex;
  justify-content: center;
`;

const SelectInput = styled.select`
  width: 80%;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  // text-align: center;
`;

const SubmitField = styled.div`
  width: 50%;
`;
const SubmitBtn = styled.button`
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  width: 100%;
  padding: 15px 5px 15px 5px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// 국적, 여권발행국 Select 값
interface CountryCodeProps {
  codeNo: number;
  country: string;
  countryKor: string;
}

function PassportInfo() {
  const userNoData = useRecoilValue(JoinUserNo); // 회원정보를 JoinInfo.tsx 받아옴
  const [inputData, setInputData] = useState({
    userEngFN: "", // 성(영문)
    userEngLN: "", // 명(영문)
    passportNo: "", // 여권번호
    nationality: "", // 국적
    passportExDate: "", // 여권만료일
    passportCOI: "", // 여권발행국
  }); // input 입력 state

  const [countryCodes, setCountryCodes] = useState<CountryCodeProps[]>([]);

  const history = useHistory();

  const Alert = (textAlert: string, type: SweetAlertIcon) => {
    Swal.fire({
      text: textAlert,
      icon: type,
      confirmButtonText: "확인",
    });
  };

  const Confirm = async (textAlert: string, type: SweetAlertIcon) => {
    const result = await Swal.fire({
      text: textAlert,
      icon: type,
      confirmButtonText: "확인",
      showCancelButton: true,
      cancelButtonText: "취소",
    });
    return result;
  };

  // 초기에 필요한 데이터 가져오기
  useEffect(() => {
    countryCode();
  }, []);

  // 국적 데이터 가져오기
  const countryCode = async () => {
    const response = await axios.get(`http://localhost:8080/country/code`);

    setCountryCodes(response.data);
  };

  // 성(영문) 입력란 변경 시 동작
  const userEngFNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ""); // 대문자로만 작성
    setInputData({ ...inputData, userEngFN: value });
  };

  // 명(영문) 입력란 변경 시 동작
  const userEngLNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ""); // 대문자로만 작성
    setInputData({ ...inputData, userEngLN: value });
  };

  // 여권번호 입력란 변경 시 동작
  const passportNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputData({ ...inputData, passportNo: value });
  };

  // 국적 선택란 변경 시 동작
  const nationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, nationality: value });
  };

  // 여권만료일 달력 변경 시 동작
  const passPortExDateChange = (date: Date | null) => {
    if (date) {
      setInputData({
        ...inputData,
        passportExDate: format(date, "yyyy-MM-dd"),
      }); // Date --> String 변환하여 passPortExDate에 삽입
    } else {
      setInputData({ ...inputData, passportExDate: "" });
    }
  };

  // 여권발행국 선택란 변경 시 동작
  const passportCOIChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, passportCOI: value });
  };

  // 작성완료 버튼 클릭 시 동작
  const infoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 새로고침 방지

    // 1. 작성란이 전부 비어있을 경우
    // confirm 창을 켜서 안내문
    if (!inputData.userEngFN && !inputData.userEngLN && !inputData.passportNo) {
      const Confirmation = await Confirm(
        "다음에 입력하시겠습니까?",
        "question"
      );

      // 확인 선택 시
      if (Confirmation.isConfirmed) {
        history.push("/");
      }

      return;
    }

    // 2. 여권번호가 작성된 상태에서 국적, 여권만료일, 여권발행국 중 비어있을 경우
    if (
      inputData.passportNo &&
      (!inputData.nationality ||
        !inputData.passportExDate ||
        !inputData.passportCOI)
    ) {
      Alert(
        "여권번호가 입력된 경우 국적, 여권만료일, 여권발행국이 모두 작성되어야 합니다.",
        "warning"
      );
      return;
    }

    const engFullName = inputData.userEngFN + " " + inputData.userEngLN;

    console.log(
      userNoData,
      inputData.passportNo,
      engFullName,
      inputData.nationality,
      inputData.passportExDate,
      inputData.passportCOI
    );

    try {
      const response = await axios.post(
        `http://localhost:8080/user/passportRegister`,
        {
          userNo: userNoData,
          passportNo: inputData.passportNo,
          engName: engFullName,
          nationality:
            inputData.nationality === "" ? null : inputData.nationality, // null은 외래키 무결성 위반이 되지 않아 변환 후 전송
          expirationDate: inputData.passportExDate,
          countryOfIssue:
            inputData.passportCOI === "" ? null : inputData.passportCOI,
        }
      );
      console.log(response.data);
      Alert("여권정보 입력이 완료되었습니다.", "success");
      history.push("/");
    } catch (error) {
      console.error("여권정보 입력 실패: ", error);
      Alert(
        "알 수 없는 오류로 인하여 여권정보 입력에 실패하였습니다.",
        "error"
      );
    }
  };

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <GuideLine>
          여권 정보는 선택 사항이며, 추후에도 입력하실 수 있습니다.
        </GuideLine>
        <Form>
          <HalfFields>
            <HalfField>
              <Label htmlFor="userEngFN">성&#40;영문&#41;</Label>
              <WriteInput
                type="text"
                id="userEngFN"
                placeholder="HONG"
                value={inputData.userEngFN}
                onChange={userEngFNChange}
                minLength={1}
                maxLength={10}
              />
            </HalfField>
            <HalfField>
              <Label htmlFor="userEngLN">명&#40;영문&#41;</Label>
              <WriteInput
                type="text"
                id="userEngLN"
                placeholder="GILDONG"
                value={inputData.userEngLN}
                onChange={userEngLNChange}
                minLength={1}
                maxLength={15}
              />
            </HalfField>
          </HalfFields>
          <Field>
            <Label htmlFor="passportNo">여권번호</Label>
            <WriteInput
              type="text"
              id="passportNo"
              placeholder="A12345678"
              value={inputData.passportNo}
              onChange={passportNoChange}
              minLength={6}
              maxLength={10}
            />
          </Field>

          <Field>
            <Label htmlFor="password">국적</Label>
            <SelectMenu>
              <SelectInput
                value={inputData.nationality}
                onChange={nationalityChange}
                disabled={!inputData.passportNo}
              >
                <option value="">-- 국적을 선택해주세요. --</option>
                {countryCodes.map((code) => (
                  <option key={code.codeNo} value={code.country}>
                    {code.countryKor}
                  </option>
                ))}
              </SelectInput>
            </SelectMenu>
          </Field>

          <Field>
            <Label htmlFor="userName">여권만료일</Label>
            <CalendarInput>
              <DatePicker
                selected={
                  inputData.passportExDate
                    ? new Date(inputData.passportExDate)
                    : null
                }
                showIcon // 달력 아이콘 활성화
                isClearable // 초기화
                locale={ko} // 한국어로 변경
                onChange={passPortExDateChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                showYearDropdown // 연도 선택 기능
                scrollableYearDropdown // 연도 선택 스크롤 기능
                minDate={new Date()} // 현재 날짜
                maxDate={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() + 10)
                  )
                } // 10년 뒤
                yearDropdownItemNumber={
                  new Date().getFullYear() + 10 - new Date().getFullYear()
                } // 현재년도 ~ 10년 뒤 현재일 까지 표시
                showMonthDropdown // 월 선택 기능
                disabled={!inputData.passportNo}
              />
            </CalendarInput>
          </Field>

          <Field>
            <Label htmlFor="gender">여권발행국</Label>
            <SelectMenu>
              <SelectInput
                value={inputData.passportCOI}
                onChange={passportCOIChange}
                disabled={!inputData.passportNo}
              >
                <option value="">-- 국적을 선택해주세요. --</option>
                {countryCodes.map((code) => (
                  <option key={code.codeNo} value={code.country}>
                    {code.countryKor}
                  </option>
                ))}
              </SelectInput>
            </SelectMenu>
          </Field>

          <SubmitField>
            <SubmitBtn onClick={infoSubmit}>작성 완료</SubmitBtn>
          </SubmitField>
          <SubmitField>
            <SubmitBtn onClick={() => history.push("/")}>나중에 작성</SubmitBtn>
          </SubmitField>
        </Form>
      </InfoBox>
    </Container>
  );
}

export default PassportInfo;
