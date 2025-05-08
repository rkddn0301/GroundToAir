# 🚀 GroundToAir: 항공편 예약 시스템

## 📌 프로젝트 개요  
**GroundToAir**는 실제 항공 예약 서비스를 클론하여, 항공편 조회부터 결제까지의 전체 흐름을 구현한 웹 애플리케이션입니다. 사용자 중심의 간편한 예약 경험을 제공하며, 웹 개발 전반에 대한 실습을 목적으로 제작되었습니다.

---

## 🧑‍💻 기술 스택  

- **Frontend**: React, TypeScript, Styled-components, FramerMotion, EncryptJS, Recoil, SweetAlert2
- **Backend**: Spring Boot, Spring Security, JPA, JWT, Lombok
- **Infra**: MariaDB, Ubuntu
- **API**: Amadeus API, Kakao API, TossPayments API, Google API
- **Tools**: Git, GitHub, Notion, Postman  

---

## 🏗️ 시스템 구조  

### 프론트엔드
- React : 컴포넌트 기반 UI 구성 및 SPA(Single Page Application) 구현
- TypeScript : 정적 타입을 적용하여 코드 안정성 및 유지보수성 향상
- Styled-components : CSS-in-JS 방식으로 컴포넌트별 스타일링 분리 및 재사용
- FramerMotion : 부드럽고 직관적인 UI 애니메이션 구현
- EncryptJS : localStorage, sessionStorage에 저장되는 민감 정보 암호화를 위한 라이브러리 사용
- Recoil : 전역 상태 관리를 통해 로그인 정보 관리
- SweetAlert2 : 사용자 친화적인 팝업창 구성 및 경고/확인 창 출력

### 백엔드  
- Spring Boot : REST API 서버 구현을 위한 프레임워크, 빠른 개발과 설정 자동화를 지원
- Spring Security : 사용자 인증 및 권한 관리를 위한 보안 프레임워크
- JPA (Java Persistence API) : 데이터베이스와의 객체-관계 매핑(ORM)을 처리하는 표준 인터페이스
- JWT (JSON Web Token) : 인증된 사용자임을 증명하기 위한 토큰 기반 인증 방식
- Lombok : 반복되는 getter/setter, 생성자 코드 작성을 줄여주는 코드 자동 생성 라이브러리

### 인프라  
- MariaDB: 사용자, 여권 정보, 항공편, 찜/예약 내역 등 핵심 데이터를 저장 및 관리
- Ubuntu: Oracle VM에 구성된 리눅스 서버 환경으로, MariaDB 운영 및 관리 용도

---

## 🛠️ 주요 기능  

### 1. 항공편 조회  
- 출발지, 도착지, 날짜, 인원, 좌석 등급 등 필터링 후 항공편 조회  
- 직항, 경유, 공동운항, 시간대 등 조건 필터 제공

### 2. 항공편 예약  
- 탑승자 정보 입력 → 결제 진행 → 예약 등록  
- **카카오페이 / 토스** 결제 연동
- 회원은 예약 내역을 통해 조회 가능

### 3. 찜 기능  
- 항공편 조회 시 ‘♡’ 클릭으로 찜 등록/해제  
- 로그인한 사용자에 한해 찜 내역 저장 및 표시  

### 4. 회원 / 비회원 예약  
- 일반 로그인, 타사 인증(카카오, 구글) 지원  
- 비회원은 예약자명 + 예약코드로 예약 조회 가능  

---

## 📸 작품 화면
### 항공편 조회
![01  항공편 조회](https://github.com/user-attachments/assets/2a47352e-f468-43a6-a189-ebadcea8cdf4)


### 항공편 정보 확인
![03  항공편 정보 확인](https://github.com/user-attachments/assets/a31062ef-9977-44ab-bc4c-41147cecdfb5)


### 탑승자 정보 입력
![04  탑승자 정보 입력(연락처 수정)](https://github.com/user-attachments/assets/6328cc6e-b58d-4a74-89a9-a54e6eed5e8f) 
![04-1  탑승자 정보 입력](https://github.com/user-attachments/assets/8646a742-6bff-4226-ab41-f2161a1a20c7)


### 예약 완료
![07-1  예약완료 내역](https://github.com/user-attachments/assets/c9ab7039-6369-4dc9-876e-7c24ddafbf6c)


---

## 📂 프로젝트 구조  

### 💠 React
<pre><code> 
/src
├── components                # router 하위 컴포넌트
│   ├── auth                 # 타사 인증 관련
│   ├── flight               # 항공편 관련
│   │   └── reservation      # 항공편 예약
│   ├── payment              # 결제
│   ├── revList              # 예약 내역
│   └── wish                 # 찜 내역
├── img                      # UI 이미지
├── router                   # 라우팅 설정
└── utils                    # interface, function, module 등 유틸
</code></pre>

### 🧩 Spring Boot
<pre><code> 
/src
├── main
│   ├── java
│   │   └── groundToAir.airReservation
│   │       ├── controller     # REST API 엔드포인트
│   │       ├── entity         # DB 엔티티 클래스
│   │       ├── enumType       # SeatClass, SocialType 등 열거형 정의
│   │       ├── repository     # JPA 기반 DB 접근
│   │       ├── service        # 비즈니스 로직 처리
│   │       └── utils          # Amadeus API 토큰, JWT, AOP 관련 유틸
│   └── resources
│       └── application.properties   # 환경 설정
└── test                           # 테스트 코드
</code></pre>

---

## 🗂️ ERD (Entity-Relationship Diagram)  

- **GROUND_TO_AIR_USER** : 회원 정보
- **GROUND_TO_AIR_USER_PASSPORT** : 회원 여권정보
- **AIRLINE_CODE** : 세계 항공사 코드
- **WORLD_AIRPORT_CODE** : 세계 공항 코드
- **COUNTRY_CODE** : 국가 코드
- **WISH_LIST** : 찜 내역
- **RESERVATION_LIST** : 예약 내역

