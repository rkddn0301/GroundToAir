// 예약상세정보 입력란

import styled from "styled-components";
import { travelerPricings } from "../../../utils/api";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { CountryCodeProps, InputData } from "./TravelerInfo";
import { format } from "date-fns";
import React from "react";

// 강조 혹은 작성 오류 안내 메시지 디자인 구성
const GuideLine = styled.div`
  color: ${(props) => props.theme.white.warning};
  font-size: 11px;
  display: flex;
  justify-content: center;
`;

// 작성란 폼 전체 디자인 구성
const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px;
  gap: 15px;
  width: 100%;
`;

// 제목 구분
const TitleClassfication = styled.div`
  width: 80%;
  margin-bottom: 20px;
`;

// 제목 디자인 구성
const MainTitle = styled.h3`
  color: ${(props) => props.theme.white.font};
  font-size: 25px;
  font-weight: 600;
`;

// 작은 크기 작성란 전체 디자인 구성
const HalfFields = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-between;
`;

// 작은 크기 작성란 구분 디자인 구성
const HalfField = styled.div`
  position: relative;
  width: 45%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

const HalfLine = styled.div`
  width: 45%;
`;

// 성별 선택란 디자인 구성
const GenderMenu = styled.div`
  display: flex;
  justify-content: space-around;
`;

// 작성란 제목 디자인 구성
const Label = styled.label`
  position: absolute;
  top: -7px;
  left: 8px;
  padding: 0 5px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => props.theme.white.bg};
`;

// 작성란 디자인 구성
const WriteInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  padding: 5px 0 0 0;
  outline: none;
`;

// 달력 전체 디자인 구성
const CalendarInput = styled.div`
  display: flex;
  justify-content: center;

  input {
    width: 370px;
  }
  @media (max-width: 480px) {
    input {
      width: 80px;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    input {
      width: 150px;
    }
  }

  @media (min-width: 769px) and (max-width: 1280px) {
    input {
      width: 200px;
    }
  }

  @media (min-width: 1281px) and (max-width: 1579px) {
    input {
      width: 300px;
    }
  }
`;

// 선택란 전체 디자인 구성
const SelectMenu = styled.div`
  display: flex;
  justify-content: center;
`;

// 국적, 여권발행국 선택란 디자인 구성
const SelectInput = styled.select`
  width: 80%;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  // text-align: center;
`;

interface TravelerInfoWriteProps {
  index: number;
  travelerPricings: travelerPricings;
  inputData: InputData;
  setInputData: React.Dispatch<
    React.SetStateAction<{ [key: number]: InputData }>
  >; // 탑승자 입력 데이터를 형식에 맞게 삽입하여 부모에게 전송
  countryCodes: CountryCodeProps[]; // 국적 데이터
  errorMsg: InputData;
  setErrorMsg: React.Dispatch<
    React.SetStateAction<{ [key: number]: InputData }>
  >; // 탑승자 입력 데이터를 형식에 맞게 삽입하여 부모에게 전송
}

function TravelerInfoWrite({
  index,
  travelerPricings,
  inputData,
  setInputData,
  countryCodes,
  errorMsg,
  setErrorMsg,
}: TravelerInfoWriteProps) {
  // 정보 입력 함수
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [index]: { ...prevState[index], [name]: value },
    }));
    // 성(영문) 입력
    if (name === "userEngFN") {
      setInputData((prevState) => ({
        ...prevState,
        [index]: {
          ...prevState[index],
          userEngFN: value.toUpperCase().replace(/[^A-Z]/g, ""),
        },
      }));
    }

    // 명(영문) 입력
    else if (name === "userEngLN") {
      setInputData((prevState) => ({
        ...prevState,
        [index]: {
          ...prevState[index],
          userEngLN: value.toUpperCase().replace(/[^A-Z]/g, ""),
        },
      }));
    }

    // 여권번호 입력
    else if (name === "passportNo") {
      setInputData((prevState) => ({
        ...prevState,
        [index]: {
          ...prevState[index],
          passportNo: value,
          nationality: value === "" ? "" : prevState[index].nationality,
          passportExDate: value === "" ? "" : prevState[index].passportExDate,
          passportCOI: value === "" ? "" : prevState[index].passportCOI,
        },
      }));
    }
  };

  // 달력 입력 함수
  const calendarDateChange = (date: Date | null, name: string) => {
    setInputData((prevState) => ({
      ...prevState,
      [index]: {
        ...prevState[index],
        [name]: date ? format(date, "yyyy-MM-dd") : "",
      },
    }));
  };

  // 국적 선택란 함수
  const nationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [index]: { ...prevState[index], [name]: value },
    }));
  };

  return (
    <Form>
      <TitleClassfication>
        <MainTitle>
          탑승자 정보 {travelerPricings.travelerId}{" "}
          {travelerPricings.travelerType === "ADULT"
            ? "성인"
            : travelerPricings.travelerType === "CHILD"
            ? "어린이"
            : travelerPricings.travelerType === "HELD_INFANT"
            ? "유아"
            : "알 수 없음"}
        </MainTitle>
      </TitleClassfication>
      <HalfFields>
        <HalfField>
          <Label htmlFor="userEngFN">성(영문)</Label>
          <WriteInput
            type="text"
            id="userEngFN"
            name="userEngFN"
            placeholder="HONG"
            value={inputData.userEngFN || ""}
            onChange={handleChange}
            minLength={1}
            maxLength={10}
          />
        </HalfField>
        <HalfField>
          <Label htmlFor="userEngLN">명(영문)</Label>
          <WriteInput
            type="text"
            id="userEngLN"
            name="userEngLN"
            placeholder="GILDONG"
            value={inputData.userEngLN || ""}
            onChange={handleChange}
            minLength={1}
            maxLength={15}
          />
        </HalfField>
      </HalfFields>
      {(errorMsg.userEngFN || errorMsg.userEngLN) && (
        <HalfFields>
          <HalfLine>
            {errorMsg.userEngFN && <GuideLine>{errorMsg.userEngFN}</GuideLine>}
          </HalfLine>
          <HalfLine>
            {errorMsg.userEngLN && <GuideLine>{errorMsg.userEngLN}</GuideLine>}
          </HalfLine>
        </HalfFields>
      )}

      <HalfFields>
        <HalfField>
          <Label htmlFor="birth">생년월일</Label>
          <CalendarInput>
            <DatePicker
              selected={inputData.birth ? new Date(inputData.birth) : null}
              showIcon // 달력 아이콘 활성화
              isClearable // 초기화
              locale={ko} // 한국어로 변경
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              onChange={(date) => calendarDateChange(date, "birth")}
              showYearDropdown // 연도 선택 기능
              scrollableYearDropdown // 연도 선택 스크롤 기능
              minDate={new Date(1900, 0, 1)} // 1900년 1월 1일
              maxDate={new Date()} // 현재 날짜
              yearDropdownItemNumber={new Date().getFullYear() - 1900 + 1} // 1900년 ~ 현재년도 까지 표시
              showMonthDropdown // 월 선택 기능
              autoComplete="off"
              id="birth"
              name="birth"
            />
          </CalendarInput>
        </HalfField>
        <HalfField>
          <Label htmlFor="gender">성별</Label>
          <GenderMenu>
            <label>
              <input
                type="radio"
                name="gender"
                value="M"
                onChange={handleChange}
                checked={inputData.gender === "M"}
              />{" "}
              남
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="F"
                onChange={handleChange}
                checked={inputData.gender === "F"}
              />{" "}
              여
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="N"
                onChange={handleChange}
                checked={inputData.gender === "N"}
              />{" "}
              비공개
            </label>
          </GenderMenu>
        </HalfField>
      </HalfFields>

      {(errorMsg.birth || errorMsg.gender) && (
        <HalfFields>
          <HalfLine>
            {errorMsg.birth && <GuideLine>{errorMsg.birth}</GuideLine>}
          </HalfLine>
          <HalfLine>
            {errorMsg.gender && <GuideLine>{errorMsg.gender}</GuideLine>}
          </HalfLine>
        </HalfFields>
      )}

      <HalfFields>
        <HalfField>
          <Label htmlFor="passportNo">여권번호</Label>
          <WriteInput
            type="text"
            id="passportNo"
            name="passportNo"
            placeholder="A12345678"
            value={inputData.passportNo || ""}
            onChange={handleChange}
            minLength={6}
            maxLength={10}
          />
        </HalfField>
        <HalfField>
          <Label htmlFor="nationality">국적</Label>
          <SelectMenu>
            <SelectInput
              name="nationality"
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
        </HalfField>
      </HalfFields>
      {(errorMsg.passportNo || errorMsg.nationality) && (
        <HalfFields>
          <HalfLine>
            {errorMsg.passportNo && (
              <GuideLine>{errorMsg.passportNo}</GuideLine>
            )}
          </HalfLine>
          <HalfLine>
            {errorMsg.nationality && (
              <GuideLine>{errorMsg.nationality}</GuideLine>
            )}
          </HalfLine>
        </HalfFields>
      )}

      <HalfFields>
        <HalfField>
          <Label htmlFor="passportExDate">여권만료일</Label>
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
              onChange={(date) => calendarDateChange(date, "passportExDate")}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              showYearDropdown // 연도 선택 기능
              scrollableYearDropdown // 연도 선택 스크롤 기능
              minDate={new Date()} // 현재 날짜
              maxDate={
                new Date(new Date().setFullYear(new Date().getFullYear() + 10))
              } // 10년 뒤
              yearDropdownItemNumber={
                new Date().getFullYear() + 10 - new Date().getFullYear()
              } // 현재년도 ~ 10년 뒤 현재일 까지 표시
              showMonthDropdown // 월 선택 기능
              autoComplete="off"
              disabled={!inputData.passportNo}
            />
          </CalendarInput>
        </HalfField>
        <HalfField>
          <Label htmlFor="passportCOI">여권발행국</Label>
          <SelectMenu>
            <SelectInput
              name="passportCOI"
              value={inputData.passportCOI}
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
        </HalfField>
      </HalfFields>
      {(errorMsg.passportExDate || errorMsg.passportCOI) && (
        <HalfFields>
          <HalfLine>
            {errorMsg.passportExDate && (
              <GuideLine>{errorMsg.passportExDate}</GuideLine>
            )}
          </HalfLine>
          <HalfLine>
            {errorMsg.passportCOI && (
              <GuideLine>{errorMsg.passportCOI}</GuideLine>
            )}
          </HalfLine>
        </HalfFields>
      )}
      <HalfFields>
        <HalfField>
          <Label>이메일</Label>
          <WriteInput
            type="email"
            id="email"
            name="email"
            placeholder="gildong1231@email.com"
            value={inputData.email || ""}
            onChange={handleChange}
            minLength={1}
            maxLength={30}
          />
        </HalfField>
      </HalfFields>
      {errorMsg.email && (
        <HalfFields>
          <HalfLine>
            {errorMsg.email && <GuideLine>{errorMsg.email}</GuideLine>}
          </HalfLine>
          <HalfLine></HalfLine>
        </HalfFields>
      )}
    </Form>
  );
}

export default TravelerInfoWrite;
