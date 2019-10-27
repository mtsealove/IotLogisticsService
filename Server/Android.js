exports.start = function () {
    const express = require('express');
    const app = express();
    const body_parser = require('body-parser');
    const port = 3800;
    const session = require('express-session');
    const db = require('./DBConn');

    app.use(body_parser.json());
    app.use(body_parser.urlencoded({ extended: true, limit: '150mb' }));
    app.use(body_parser.json());
    app.use(session({   //세션 설정
        key: 'sid',
        secret: 'secret',
        resave: 'false',
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 10  //로그인 유지 시간(10시간)
        }
    }));

    //로그인
    app.post('/Login', (req, res) => {
        console.log('로그인');
        const body = req.body;
        const ID = body['ID'];
        const passowrd = body['Password'];

        console.log(ID);
        console.log(passowrd);

        const result = db.GetDriverJson(ID, passowrd)
        console.log(result);
        res.json(result);
    });

    app.get('/GetItemList', (req, res) => {
        console.log('화물 목록 불러오기');
        const driver_id = req.query.driver_id;
        const sort = req.query.sort;
        const result = db.GetItemByDriver(driver_id, sort);
        console.log(result);
        res.json(result);
    });

    //위치정보 업데이트
    app.post('/Update/Location', (req, res) => {
        const address = req.body['address'];
        const driver_id = req.body['driver_id'];
        const result = db.UpdateLocation(driver_id, address);
        res.json(result);
    });

    //기사 상태 업데이트
    app.post('/Update/Status/Driver', (req, res) => {
        const body = req.body;
        const driver_id = body['driver_id'];
        const stautus = body['status'];

        console.log('기사 상태 수정');
        const result = db.UpdateDriverStatus(driver_id, stautus);
        res.json(result);
    });

    //화물 상태 업데이트
    app.post('/Update/Status/Aitem', (req, res) => {
        const body = req.body;
        const invoice = body['invoice'];
        const status = body['status'];

        console.log('화물 상태 수정');
        const result = db.UpdateAitemStatus(invoice, status);
        res.json(result);
    });

    //각각의 화물 조회
    app.get('/Get/Aitem', (req, res) => {
        console.log('화물 개인 조회');
        const invoice = req.query.invoice;
        const result = db.GetItemOnly(invoice);
        res.json(result);
    });

    app.get('/Get/Status/Done', (req, res) => {
        console.log('화물 전체 상태 체크');
        const driver_id = req.query.driver_id;
        const Status = req.query.status;

        console.log(driver_id);
        console.log(Status);

        const result = db.GetDone(driver_id, Status);
        res.json(result);
    });

    //타임라인 업데이트
    app.post('/Update/TimeLine', (req, res) => {
        const body = req.body;
        const invoice = body['InvoiceNum'];
        const Location = body['Location'];
        const WorkDate = body['WorkDate'];
        const WorkTime = body['WorkTime'];
        const WorkId = body['WorkId'];

        const result = db.SetTimeLine(invoice, Location, WorkDate, WorkTime, WorkId);
        res.json(result);
    });

    app.listen(port, () => {
        console.log('서버 ip: ' + getIPAddress());
    });

    function getIPAddress() {

        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
        return '0.0.0.0';
    }
}

