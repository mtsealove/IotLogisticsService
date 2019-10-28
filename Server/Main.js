const express = require('express');   //서버 라우팅 모듈
const app = express();
const session = require('express-session');
const body_parser = require('body-parser');   //HTTP 통신을 통해 데이터를 받아 파싱하는 모듈
const port = 3700; //서버의 포트 번호
const DB = require('./DBConn');
const fs = require('fs');
const InputCheck = require('./InputCheck');
const Android=require('./Android');


app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true, limit: '150mb' }));
app.set('view engine', 'ejs');
app.set('views', 'Views');
app.use(express.static('Src'));
app.use(body_parser.json());
app.use(session({
    key: 'sid',
    secret: 'secret',
    resave: 'false',
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 10  //로그인 유지 시간(10시간)
    }
}));


//배경 이미지 라우팅
app.get('/background', (req, res) => {
    fs.readFile('./Src/web_background.png', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

//송장번호를 입력, 화물의 상태 반환
app.get('/Get/ItemStatus', (req, res) => {
    const InvoiceNum = req.query.InvoiceNum;
    const Data = DB.GetItemStatus(InvoiceNum);
    res.json(Data);
});

//웹 메인 페이지 출력
app.get('/Main', (req, res) => {
    //로그인 되었는지 확인
    const userID=req.session.userID;
    res.render('Main', { 'title': '물류추적 서비스', 'current': 0, 'personal_div': 'div_left', 'userID':userID });
});

//기본 페이지 리다이렉트
app.get('/', (req, res) => {
    res.redirect('/Main');
});

//개인 조회 페이지
app.get('/Personal', (req, res) => {
    const InvoiceNum = req.query.InvoiceNum;
    console.log(InvoiceNum);

    //아무것도 입력하지 않은 상태
    if ((!InvoiceNum)) {
        //기본 페이지 표시
        res.render('Personal_default', { 'title': '개인 택배 조회', 'current': 1, 'personal_div': 'div_center' });
        console.log('no input');
    } else { //모든 것이 정상적으로 입력된 상태
        //결과 페이지 표시
        let result = DB.GetItem(InvoiceNum);
        if (result.Result == 'OK') {
            let TimeLine = DB.GetTimeLine(InvoiceNum);
            console.log('타임라인');
            console.log(TimeLine);
            console.log(result);
            res.render('Personal_result', { 'title': '개인 택배 조회', 'current': 1, 'content': result, 'timeline': TimeLine });
            console.log('normal');
        } else {
            InvoiceError(res);
        }
    }
})

//기업용 조회 페이지
app.get('/Company', (req, res) => {
    console.log(req.session);
    //세션이 존재하는지 확인
    if (req.session.userID) {
        console.log('로그인됨');
        const driver_id = req.query.driver_id;
        console.log(driver_id);
        //기사를 입력한 경우
        if (driver_id) {
            const driver_info = DB.GetItemByDriver(driver_id);
            const driver_list=DB.GetDriverList(req.session.userID);
            console.log(driver_info);
            //정확한 결과가 도출된 경우
            if (driver_info.Result == 'OK') {
                res.render('Company_result', { 'title': '기업 조회', 'current': 2, 'driver_info': driver_info.data, 'All':driver_info.All, 'Done':driver_info.Done , 'driver_list':driver_list});
            } else {
                //검색 결과가 존재하지 않는 경우
                res.render('Company_result', { 'title': '기업 조회', 'current': 2, 'driver_info': null, 'driver_list':null });
            }
        } else {    //검색어 자체가 존재하지 않는 경우
            res.render('Company_result', { 'title': '기업 조회', 'current': 2, 'driver_info': null });
        }


    } else {
        console.log('로그인 안됨');
        res.render('Company_login', { 'title': '로그인', 'current': 2 });
    }
});

//기업 회원 로그인
app.post('/Company/Login', (req, res) => {
    const userID = req.body['ID'];
    const password = req.body['password'];
    console.log(userID);
    console.log(password);
    //로그인 성공
    const data = DB.Login(userID, password);
    if (data.Result == 'OK') {
        console.log(data);
        req.session.userID = data.ID;
        req.session.userName = data.Name;
        res.redirect('/Company');
    } //실패
    else {
        res.send('<script>alert("ID와 비밀번호를 확인하세요");history.go(-1)</script>');
    }
});

//연락처 페이지
app.get('/Contact', (req, res)=>{
   res.render('Contact', {'title':'연락처', 'current':3}); 
});

//송장번호 오류 페이지 출력
function InvoiceError(res) {
    res.render('InvoiceError', { 'title': '오류', 'current': 1 });
    console.log('송장번호 오류 발생');
}

app.listen(port, function () {    //서버 실행
    const ip = require('ip');
    console.log('Servers Runnings on ' + ip.address() + ': ' + port);
    Android.start();
});