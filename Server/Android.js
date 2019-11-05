exports.start = function () {
    const express = require('express');
    const app = express();
    const body_parser = require('body-parser');
    const port = 3800;
    const session = require('express-session');
    const db = require('./DBConn');
    const chalk=require('chalk');

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
        const body = req.body;
        const ID = body['ID'];
        const passowrd = body['Password'];
        console.log(chalk.bgCyan('Android:')+' Try Login ID: '+chalk.bgGreen(ID));

        const result = db.GetDriverJson(ID, passowrd)
        console.log(result);
        res.json(result);
    });

    app.get('/GetItemList', (req, res) => {
        const driver_id = req.query.driver_id;
        const sort = req.query.sort;
        const result = db.GetItemByDriver(driver_id, sort);
        console.log(chalk.bgCyan('Android:')+' Get item DriverID: '+chalk.bgGreen(driver_id));
        res.json(result);
    });

    //위치정보 업데이트
    app.post('/Update/Location', (req, res) => {
        const address = req.body['address'];
        const driver_id = req.body['driver_id'];
        const result = db.UpdateLocation(driver_id, address);
        console.log(chalk.bgCyan('Android:')+chalk.yellow(' Location info updated'));
        console.log('Address: '+chalk.bgGreen(address)+' Driver: '+chalk.bgGreen(driver_id));
        res.json(result);
    });

    //기사 상태 업데이트
    app.post('/Update/Status/Driver', (req, res) => {
        const body = req.body;
        const driver_id = body['driver_id'];
        const stautus = body['status'];

        console.log(chalk.bgCyan('Android:')+' Driver status updated: { DriverID: '+chalk.bgGreen(driver_id)+"Status: "+chalk.bgGreen(stautus)+' }');
        const result = db.UpdateDriverStatus(driver_id, stautus);
        res.json(result);
    });

    //화물 상태 업데이트
    app.post('/Update/Status/Aitem', (req, res) => {
        const body = req.body;
        const invoice = body['invoice'];
        const status = body['status'];

        console.log(chalk.bgCyan('Android:')+' Item status updated: { Invoice Number: '+chalk.bgGreen(invoice)+"Status: "+chalk.bgGreen(status)+' }');
        const result = db.UpdateAitemStatus(invoice, status);
        res.json(result);
    });

    //각각의 화물 조회
    app.get('/Get/Aitem', (req, res) => {
        const invoice = req.query.invoice;
        const result = db.GetItemOnly(invoice);
        console.log(chalk.bgCyan('Android:')+' Item Inquire: '+chalk.bgGreen(invoice));
        res.json(result);
    });

    app.get('/Get/Status/Done', (req, res) => {
        const driver_id = req.query.driver_id;
        const Status = req.query.status;

        console.log(chalk.bgCyan('Android:')+' Check all done. DriverID: '+chalk.bgGreen(driver_id));

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

        console.log(chalk.bgCyan('Android:')+' Update Timeline: '+chalk.bgGreen(invoice));

        const result = db.SetTimeLine(invoice, Location, WorkDate, WorkTime, WorkId);
        res.json(result);
    });

    app.listen(port, () => {
        console.log(chalk.yellow('Android Server runnings on: '+port));
    });
}

