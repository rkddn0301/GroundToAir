// 항공 출발지/도착지 자동완성 컴포넌트

import styled from "styled-components";
import { InputData } from "../../router/FlightSearch";
import { IataCodes } from "../../utils/api";

const AutoCompleteList = styled.ul`
  position: absolute;
  width: 15rem;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px; // 최대 높이 지정
  overflow-y: auto; // 최대 높이 초과 시 스크롤바 생성
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); // 그림자 순서 : x축, y축, 흐림효과, 색상
  margin: 0; // ul 기본 마진 제거
  padding: 0; // ul 기본 패딩 제거
  list-style-type: none; // 기본적인 목록 스타일(점, 번호 등) 제거
  /* 
  &::-webkit-scrollbar { // 스크롤바 없애는건데 잠시 보류 11/16
    display: none;
  } */
`;

const AutoCompleteItem = styled.li`
  display: flex;
  flex-direction: column;
  padding: 12px 12px; // 상하 / 좌우
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
  &:not(:last-child) {
    // 마지막 항목을 제외한 모든 항목에 하단 경계선 추가
    border-bottom: 1px solid ${(props) => props.theme.white.font};
  }
`;

const BuildingIcon = styled.svg`
  width: 14px;
  height: 14px;
  margin-right: 8px;
`;

const Flight = styled.span`
  width: 14px;
  height: 14px;
  margin-right: 8px;
`;

interface AutoCompleteProps {
  setInputData: React.Dispatch<React.SetStateAction<InputData>>;
  setAutoCompleteLocationSw: React.Dispatch<React.SetStateAction<boolean>>;
  autoCompleteLocations: IataCodes[];
  setAutoCompleteLocations: React.Dispatch<React.SetStateAction<IataCodes[]>>;
  type: "origin" | "destination";
}

function AutoComplete({
  setInputData,
  setAutoCompleteLocationSw,
  autoCompleteLocations,
  setAutoCompleteLocations,
  type,
}: AutoCompleteProps) {
  const locationCity = autoCompleteLocations.find(
    (location) => location.cityKor != null && location.cityCode != null
  );

  return (
    <AutoCompleteList>
      {/* 도시코드 출력 */}
      {autoCompleteLocations.length > 1 && locationCity && (
        <AutoCompleteItem
          key="cityCode"
          onClick={() => {
            if (locationCity) {
              setInputData((prev) => ({
                ...prev,
                [type === "origin"
                  ? "originLocationCode"
                  : "destinationLocationCode"]: `${locationCity.cityKor} (${locationCity.cityCode})`,
                [type === "origin"
                  ? "originLocationCodeNo"
                  : "destinationLocationCodeNo"]: `${locationCity.codeNo}`,
              }));
              setAutoCompleteLocationSw(false);
              setAutoCompleteLocations([]); // 제안 리스트 비우기
            }
          }}
        >
          <div>
            <BuildingIcon
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
              />
            </BuildingIcon>
            {locationCity?.cityKor} ({locationCity?.cityCode})
          </div>
          <div style={{ marginTop: "10px" }}>{locationCity?.countryKor}</div>
        </AutoCompleteItem>
      )}

      {autoCompleteLocations.map((location) => (
        <>
          {/* 공항코드만 출력 */}
          <AutoCompleteItem
            key={location.codeNo + "_airport"}
            onClick={() => {
              setInputData((prev) => ({
                ...prev,
                [type === "origin"
                  ? "originLocationCode"
                  : "destinationLocationCode"]: `${location.airportKor} (${location.iata})`,
                [type === "origin"
                  ? "originLocationCodeNo"
                  : "destinationLocationCodeNo"]: `${location.codeNo}_airport`,
              }));
              setAutoCompleteLocationSw(false);
              setAutoCompleteLocations([]); // 제안 리스트 비우기
            }}
          >
            <div>
              <Flight>✈</Flight>
              {location.airportKor} ({location.iata})
            </div>
            <div style={{ marginTop: "10px" }}>{location.countryKor}</div>
          </AutoCompleteItem>
        </>
      ))}
    </AutoCompleteList>
  );
}

export default AutoComplete;
