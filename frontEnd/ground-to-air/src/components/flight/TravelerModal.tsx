// 인원 및 좌석등급 모달 컴포넌트

import { useState } from "react";
import styled from "styled-components";
import { InputData, SeatClass } from "../../router/FlightSearch";

// TravelerModal 전체 컴포넌트 구성
const Container = styled.div`
  position: absolute;
  width: 100%;
  top: 105%; /* TravelerButton 바로 아래에 위치하게 설정 */
  left: 0;
  z-index: 10;
  background-color: ${(props) => props.theme.white.bg};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  padding: 10px;
`;

// 좌석 등급 제목 디자인
const Label = styled.label`
  font-size: 12px;
  padding: 0 5px 0 0;
  margin-bottom: 8px;
`;

// 좌석 등급 구분 디자인
const Field = styled.div`
  width: 20%;
  height: 85%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 15px;
  max-width: 200px; // 최대 크기 200px로 고정
`;

// 연령별 팁 관련 전체 디자인
const QuestionGroups = styled.div`
  position: relative;
  display: inline-block; // 1줄로 표현
`;

// 연령별 팁 아이콘
const QuestionIcon = styled.svg`
  width: 12px;
  height: 12px;
  cursor: pointer;
`;

// 연령별 팁
const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%; // left+transform 을 통해 Tooltip을 출력시키는 부모 요소의 수평 중앙에 위치
  transform: translateX(-50%);
  background-color: ${(props) => props.theme.black.bg};
  color: ${(props) => props.theme.black.font};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 100;
  margin-top: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.2; // 글자 사이의 간격
`;

// 인원 카운팅 전체 디자인
const CounterField = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 0;
`;

// 인원 카운팅 제목
const CounterLabel = styled.span`
  font-size: 1em;
  font-weight: 500;
`;

// 인원 카운팅 버튼 전체 디자인
const CounterButtonGroup = styled.div`
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// 인원 카운팅 버튼 디자인
const CounterButton = styled.button<{ disabled?: boolean }>`
  width: 30px;
  height: 30px;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 50%;
  background-color: ${(props) => props.theme.white.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  cursor: pointer;
  &:hover {
    background-color: ${(props) =>
      props.disabled ? props.theme.white.bg : props.theme.black.bg};
    color: ${(props) => !props.disabled && props.theme.black.font};
  }
`;

// 구분선 디자인
const HorizontalLine = styled.hr`
  border: none;
  border-top: 1px solid #ccc;
  margin: 1em 0;
`;

// 선택완료 버튼 디자인
const ChoiceBtn = styled.button`
  margin-top: 10px;
  width: 100%;
  height: 30px;
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// TravelerModal의 props 타입 정의
interface TravelerModalProps {
  setInputData: React.Dispatch<React.SetStateAction<InputData>>;
  setTravelerBtnSw: React.Dispatch<React.SetStateAction<boolean>>;
}

function TravelerModal({ setInputData, setTravelerBtnSw }: TravelerModalProps) {
  const [tempData, setTempData] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: SeatClass.ECONOMY,
  }); // 선택완료 이전 작성 데이터

  const [showTooltip, setShowTooltip] = useState({
    adults: false,
    children: false,
    infants: false,
  }); // 인원 규칙사항 안내 툴팁 데이터

  // 인원 카운팅 동작
  const travelerCounterChange = (
    e: React.MouseEvent<HTMLButtonElement>,
    operation: "increment" | "decrement"
  ) => {
    e.preventDefault();
    const { name } = e.currentTarget;

    setTempData((prev: any) => {
      let newValue = prev[name];

      /*
      * 인원(성인;adults, 어린이;children, 유아;infants) !성인만 필수
      - 성인은 만 12세 이상, 어린이는 만 2세 ~ 만 12세 미만, 유아는 ~ 만 2세 미만
      - 성인은 1명 이상이어야 한다.
      - 좌석 예약 중 총 인원(성인과 어린이)은 9명을 초과할 수 없다.
      - 유아는 성인 수를 초과할 수 없다.
      */

      if (name === "adults") {
        if (operation === "increment") {
          newValue += 1;
        } else if (operation === "decrement") {
          newValue -= 1;
          // 성인 수가 줄어들었을 때, 유아 수가 성인을 초과하면 유아 수를 성인 수에 맞게 줄임
          if (prev.infants > newValue) {
            return {
              ...prev,
              adults: newValue,
              infants: newValue,
            };
          }
        }
      }
      // 어린이 증가 / 감소
      else if (name === "children") {
        newValue = operation === "increment" ? newValue + 1 : newValue - 1;
      }
      // 유아 증가 / 감소
      else if (name === "infants") {
        newValue = operation === "increment" ? newValue + 1 : newValue - 1;
      }
      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  // 좌석등급 선택
  const travelClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SeatClass;
    setTempData((prev) => ({ ...prev, travelClass: value }));
  };

  // 인원 및 좌석등급 선택완료
  const travelerConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    setInputData((prev) => ({
      ...prev,
      adults: tempData.adults,
      children: tempData.children,
      infants: tempData.infants,
      travelClass: tempData.travelClass,
    }));
    setTravelerBtnSw(false);
  };

  return (
    <Container>
      {/* 성인 Counter */}
      <CounterField>
        <CounterLabel>
          성인
          <QuestionGroups>
            <QuestionIcon
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
              onMouseEnter={() =>
                setShowTooltip((prev) => ({
                  ...prev,
                  adults: true,
                }))
              }
              onMouseLeave={() =>
                setShowTooltip((prev) => ({
                  ...prev,
                  adults: false,
                }))
              }
            >
              <path
                fillRule="evenodd"
                d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z"
                clipRule="evenodd"
              />
            </QuestionIcon>
            {showTooltip.adults && (
              <Tooltip>성인은 만 12세 이상입니다.</Tooltip>
            )}
          </QuestionGroups>
        </CounterLabel>
        <CounterButtonGroup>
          <CounterButton
            name="adults"
            onClick={(e) => travelerCounterChange(e, "decrement")}
            disabled={tempData.adults <= 1} // 성인 최소 1명 제한
            style={{
              cursor: tempData.adults <= 1 ? "not-allowed" : "pointer",
            }}
          >
            -
          </CounterButton>
          <span>{tempData.adults}</span>
          <CounterButton
            name="adults"
            onClick={(e) => travelerCounterChange(e, "increment")}
            disabled={
              tempData.adults + tempData.children + tempData.infants >= 9
            }
            style={{
              cursor:
                tempData.adults + tempData.children + tempData.infants >= 9
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            +
          </CounterButton>
        </CounterButtonGroup>
      </CounterField>

      {/* 어린이 Counter */}
      <CounterField>
        <CounterLabel>
          어린이
          <QuestionGroups>
            <QuestionIcon
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
              onMouseEnter={() =>
                setShowTooltip((prev) => ({
                  ...prev,
                  children: true,
                }))
              }
              onMouseLeave={() =>
                setShowTooltip((prev) => ({
                  ...prev,
                  children: false,
                }))
              }
            >
              <path
                fillRule="evenodd"
                d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z"
                clipRule="evenodd"
              />
            </QuestionIcon>
            {showTooltip.children && (
              <Tooltip>어린이는 만 2세 ~ 만 12세 미만 입니다.</Tooltip>
            )}
          </QuestionGroups>
        </CounterLabel>
        <CounterButtonGroup>
          <CounterButton
            name="children"
            onClick={(e) => travelerCounterChange(e, "decrement")}
            disabled={tempData.children <= 0} // 어린이 최소 0명 제한
            style={{
              cursor: tempData.children <= 0 ? "not-allowed" : "pointer",
            }}
          >
            -
          </CounterButton>
          <span>{tempData.children}</span>
          <CounterButton
            name="children"
            onClick={(e) => travelerCounterChange(e, "increment")}
            disabled={
              tempData.adults + tempData.children + tempData.infants >= 9
            } // 총 인원 제한
            style={{
              cursor:
                tempData.adults + tempData.children + tempData.infants >= 9
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            +
          </CounterButton>
        </CounterButtonGroup>
      </CounterField>

      {/* 유아 Counter */}
      <CounterField>
        <CounterLabel>
          유아
          <QuestionGroups>
            <QuestionIcon
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
              onMouseEnter={() =>
                setShowTooltip((prev) => ({
                  ...prev,
                  infants: true,
                }))
              }
              onMouseLeave={() =>
                setShowTooltip((prev) => ({
                  ...prev,
                  infants: false,
                }))
              }
            >
              <path
                fillRule="evenodd"
                d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z"
                clipRule="evenodd"
              />
            </QuestionIcon>
            {showTooltip.infants && (
              <Tooltip>
                유아는 만 2세미만 입니다.
                <br />
                유아는 성인 인원보다 많이 지정할 수 없습니다.
              </Tooltip>
            )}
          </QuestionGroups>
        </CounterLabel>
        <CounterButtonGroup>
          <CounterButton
            name="infants"
            onClick={(e) => travelerCounterChange(e, "decrement")}
            disabled={tempData.infants <= 0} // 유아 최소 0명 제한
            style={{
              cursor: tempData.infants <= 0 ? "not-allowed" : "pointer",
            }}
          >
            -
          </CounterButton>
          <span>{tempData.infants}</span>
          <CounterButton
            name="infants"
            onClick={(e) => travelerCounterChange(e, "increment")}
            disabled={
              tempData.infants >= tempData.adults || // 유아는 성인 수 이상일 수 없음
              tempData.adults + tempData.children + tempData.infants >= 9 // 총 인원 제한
            }
            style={{
              cursor:
                tempData.infants >= tempData.adults ||
                tempData.adults + tempData.children + tempData.infants >= 9
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            +
          </CounterButton>
        </CounterButtonGroup>
      </CounterField>

      <HorizontalLine />

      {/* 좌석 등급 */}
      <Field style={{ width: "100%" }}>
        <Label>좌석 등급</Label>
        <select value={tempData.travelClass} onChange={travelClassChange}>
          <option value={SeatClass.ECONOMY}>일반석</option>
          <option value={SeatClass.PREMIUM_ECONOMY}>프리미엄 일반석</option>
          <option value={SeatClass.BUSINESS}>비즈니스석</option>
          <option value={SeatClass.FIRST}>일등석</option>
        </select>
      </Field>
      <br />
      <span style={{ fontSize: "11px" }}>! 총 예약 인원은 9명입니다.</span>
      <ChoiceBtn onClick={travelerConfirm}>선택완료</ChoiceBtn>
    </Container>
  );
}

export default TravelerModal;
