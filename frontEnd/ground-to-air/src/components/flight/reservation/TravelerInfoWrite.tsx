// 예약상세정보 입력란

import styled from "styled-components";
import { travelerPricings } from "../../../utils/api";

interface TravelerInfoWriteProps {
  travelerPricings: travelerPricings;
}

function TravelerInfoWrite({ travelerPricings }: TravelerInfoWriteProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>
        탑승자 정보 {travelerPricings.travelerId}{" "}
        {travelerPricings.travelerType === "ADULT"
          ? "성인"
          : travelerPricings.travelerType === "CHILD"
          ? "어린이"
          : travelerPricings.travelerType === "HELD_INFANT"
          ? "유아"
          : "알 수 없음"}
      </div>

      <div>
        <div>
          <label>성(영문)</label>
          <input type="text" placeholder="Hong" />
        </div>
        <div>
          <label>명(영문)</label>
          <input type="text" placeholder="Gildong" />
        </div>
        <div>
          <label>생년월일</label>
          <input type="text" placeholder="2000-12-31" />
        </div>
        <div>
          <label>성별</label>
          <input type="text" placeholder="남" />
        </div>
        <div>
          <label>여권번호</label>
          <input type="text" placeholder="M12345678" />
        </div>
        <div>
          <label>국적</label>
          <input type="text" placeholder="Korea" />
        </div>
        <div>
          <label>여권만료일</label>
          <input type="text" placeholder="2029-04-09" />
        </div>
        <div>
          <label>여권발행국</label>
          <input type="text" placeholder="Korea" />
        </div>
        <div>
          <label>이메일</label>
          <input type="email" placeholder="gildong@gmail.com" />
        </div>
      </div>
    </div>
  );
}

export default TravelerInfoWrite;
