// 항공편 데이터(SQL) 추출 함수

import axios from "axios";

// 항공사 데이터 추출(AIRLINE_CODE)
export const fetchAirlineCodes = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_SPRINGBOOT_URL}/air/airlineCode`
  );
  return response.data;
};

// 공항 데이터 추출(WORLD_AIRPORT_CODE)
export const fetchIataCodes = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_SPRINGBOOT_URL}/air/iataCode`
  );
  return response.data;
};

// 국적 데이터 추출(COUNTRY_CODE)
export const fetchCountryCodes = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_SPRINGBOOT_URL}/country/code`
  );
  return response.data;
};
