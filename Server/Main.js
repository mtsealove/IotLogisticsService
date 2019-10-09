const express = require('express');   //서버 라우팅 모듈
const app = express();
const body_parser = require('body-parser');   //HTTP 통신을 통해 데이터를 받아 파싱하는 모듈
const port = 3700; //서버의 포트 번호
const DB = require('./DBConn');
const fs = require('fs');
const InputCheck = require('./InputCheck');

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', 'Views');
app.use(express.static('Src'));

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
    res.render('Main', { 'title': '물류추적 서비스', 'current': 0, 'personal_div': 'div_left' });
});

//기본 페이지 리다이렉트
app.get('/', (req, res) => {
    res.redirect('/Main');
});

//개인 조회 페이지
app.get('/Personal', (req, res) => {
    const InvoiceNum = req.query.InvoiceNum;
    const Company = req.query.Company;
    console.log(InvoiceNum);
    console.log(Company);

    //아무것도 입력하지 않은 상태
    if ((!InvoiceNum) || (!Company)) {
        //기본 페이지 표시
        res.render('Personal_default', { 'title': '개인 택배 조회', 'current': 1, 'personal_div': 'div_center' });
        console.log('no input');
    } else if (!InputCheck.IsValidInvoice(Company, InvoiceNum)) { //정상적인 송장번호가 아닌 경우
        InvoiceError(res);
    }
    else { //모든 것이 정상적으로 입력된 상태
        //결과 페이지 표시
        let result=DB.GetItem(InvoiceNum);
        if(result.Result=='OK') {
            let TimeLine=DB.GetTimeLine(InvoiceNum);
            console.log('타임라인');
            console.log(TimeLine);
            res.render('Personal_result', {'title':'개인 택배 조회', 'current':1, 'content':result, 'timeline':TimeLine});
        console.log('normal');
        } else {
            InvoiceError(res);
        }
        
    }
})

//송장번호 오류 페이지 출력
function InvoiceError(res) {
    res.render('InvoiceError', { 'title': '오류', 'current': 1 });
    console.log('송장번호 오류 발생');
}

app.listen(port, function () {    //서버 실행
    const ip = require('ip');
    console.log('Servers Runnings on ' + ip.address() + ': ' + port);
});