담당자 : 황현수, 오수빈

Front) react, nextjs, socket.io, typescript : 황현수

Server) redis, java, netty, socket.io : 오수빈

### frontend
https://github.com/carnad37/example_socket_io_client_nextjs

### 서버 라이브러리
socker.io: https://github.com/mrniko/netty-socketio

### 0. Intro
- Basic version
클라이언트에서 발급한 uuid(clientKey)로 현재 접속자 수 집계
clientKey로 접속자 집계
Redis 사용 O

- Simple version
소켓 연결 개수로 현재 접속자 수 집계
socketId(socket 연결)로 접속자 집계
Redis 사용 X

- Advanced Version
클러스터 환경을 고려한 서버
node:Cluster, Sticky-session, Redis-Adapter 사용
master 노드와 worker 노드 구현
서버간 socket broadcasting을 위한 redis adapter
basic version과 동일

### 1. 설계
#### Basic version
1. 유저가 페이지 접근
2. 유저에대한 고유키(userKey)를 next.js에서 ssr과 함께 제공.
3. socket.io를 이용해 서버와 Connect
4. 유저의 접근 또는 이탈에 대해, 서버와 소켓 통신
- 유저 접근 이벤트에 userKey, room 정보 전달 서버에서 해당 정보 소켓 client store에 저장 
- 유저 이탈 시 socket disconnect
5. [서버] Redis에 소켓 정보 저장/삭제
6. [서버] Redis에서 현재 네임스페이스 내에 ClientKey값들 조회해서 중복제거한 개수 전달
7. 클라이언트에서 표시되는 현재 페이지 유저수 업데이트.
  
![image](https://github.com/ohsoou/socket-node-server-project/assets/64073715/9407aba8-474a-4c0f-b2ce-4c07c7079dc8)


#### Advenced version
1. 유저가 페이지 접근
2. 유저에대한 고유키(userKey)를 next.js에서 ssr과 함께 제공.
3. socket.io를 이용해 서버와 Connect
4. 유저의 접근 또는 이탈에 대해, 서버와 소켓 통신
- 유저 접근 이벤트에 userKey, room 정보 전달 서버에서 해당 정보 소켓 client store에 저장 
- 유저 이탈 시 socket disconnect
5. [서버] 클러스터 구성, mater 노드 실행하고 sticky session으로 연결 보장
- worker 노드 생성 후 소켓 연결 처리  worker 노드에서 수행
6. [서버] Redis에 소켓 정보 저장/삭제
7. [서버] Redis에서 현재 네임스페이스 내에 ClientKey값들 조회해서 중복제거한 개수 전달
8. [서버] Redis Adapter를 사용해서 각 worker 노드에 있는 현재 네임스페이스들에 브로드캐스팅
9. 클라이언트에서 표시되는 현재 페이지 유저수 업데이트.
  
![image](https://github.com/ohsoou/socket-node-server-project/assets/64073715/52696497-5978-45e1-b67f-07efbe959ea9)
