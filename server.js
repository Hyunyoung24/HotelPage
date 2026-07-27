/* KOPO 배포용 서버 진입점.
   json-server CLI의 --static 옵션 파싱이 이 환경에서 제대로 안 먹어서(정적 파일 대신
   json-server 기본 안내 페이지만 뜨는 문제), CLI 대신 json-server를 라이브러리로 직접
   불러와 static 옵션을 코드로 명확하게 지정한다. */
const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ static: __dirname });

server.use(middlewares);
server.use(router);

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
    console.log(`JSON Server is running on http://${host}:${port}`);
});
