// 항공 조회 필터링 컴포넌트

import styled from "styled-components";

// FlightFiltering 전체 컴포넌트 구성
const Banner = styled.div`
  width: 15%;
  position: absolute;
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.white.bg};
  height: 100%;
  box-shadow: 5px 3px 2px rgba(0, 0, 0, 0.2); // 오른쪽 + 아래쪽 그림자
  z-index: 0; // 검색결과(ResultFont)가 덮어써야해서 적용
`;

// 경유지 필터
const Stopover = styled.div``;

// 출발 시간대 필터
const DepartureTime = styled.div``;

// 가격 조정 필터
const Price = styled.div``;

// 항공사 선택 필터
const Airlines = styled.div``;

// 필터 제목
const Title = styled.h2`
  font-size: 25px;
  font-weight: 600px;
`;

function FlightFiltering() {
  return (
    <Banner>
      <Stopover>
        <Title>경유</Title>

        <input type="checkbox" />
        <label>직항만</label>
        <br />
        <input type="checkbox" />
        <label>경유 1회</label>
        <br />

        <input type="checkbox" />
        <label>경유 2회 이상</label>
        <br />
      </Stopover>
      <DepartureTime>
        <Title>출발 시간대</Title>
      </DepartureTime>
      <Price>
        <Title>가격 조정</Title>
      </Price>
      <Airlines>
        <Title>항공사</Title>
      </Airlines>
    </Banner>
  );
}

export default FlightFiltering;
