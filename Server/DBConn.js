const fs = require('fs');
const mysql = require('sync-mysql');
/*MySQL 연동 쿼리 분리를 위해 
callback이 필요 없는 sync-mysql 모듈 사용 */

const connection = new mysql({
    host: 'localhost',
    user: 'IotAdmin',   //Iot DB관리 로컬 계정
    password: fs.readFileSync('pw.dat', 'utf-8'),   //비밀번호는 파일로 따로 관리
    database: 'IoT'
});
//에러 코드 지정
const NoResult = {
    Result: 'NoResult'
}
const WrongInput = {
    Result: 'WrongInput'
}


//화물 조회
exports.GetItem = function (InvoiceNum) {
    //입력 값 검증
    if (!InvoiceNum || (InvoiceNum.length <= 0 || InvoiceNum.length > 14)) {
        console.log(WrongInput);
        return WrongInput;
    }
    else {
        const query = `select AAA.*, CCC.Name as CompanyName from
		(select AA.*, DD.DriverName, DD.DriverPhone from
       ( select A.*, S.action from 
        aitem A join Status S
        on A.Status=S.ID) AA
        join Driver DD
        on AA.Driver=DD.ID) AAA
        join Courier CCC
        on AAA.companyId=CCC.ID
        where InvoiceNum='${InvoiceNum}';`
        var result = connection.query(query)[0];
        if (result) {    //검색 결과 반환
            result.Result = 'OK';
            console.log(result);
            return result;
        } else {    //검색 결과 없음
            console.log(NoResult);
            return NoResult;
        }
    }
}

//타임라인 조회
exports.GetTimeLine = function (InvoiceNum) {
    if (!InvoiceNum || (InvoiceNum.length <= 0 || InvoiceNum.length > 14)) {
        console.log(WrongInput);
        return WrongInput;
    } else {
        const query = `select * from timeline
        where InvoiceNum='${InvoiceNum}'
        order by WorkDate asc, WorkTime asc;`
        var result = connection.query(query);
        console.log(result);
        return result;
    }
}

//기업 로그인
exports.Login = function (ID, password) {
    if (ID && password) {
        const query = `select ID, Name from Courier
        where ID='${ID}'
        and password='${password}'`;
        var result = connection.query(query)[0];
        if (result) {
            result.Result = 'OK';
            return result;
        } else {
            return NoResult;
        }
    } else {
        return WrongInput;
    }
}

//기사별 화물 목록 조회
exports.GetItemByDriver = function (driver_id, sort) {
    //기사 상태 조회 
    try {
        const statusQuery = `select Status from Driver where ID ='${driver_id}'`;
        const Status = (connection.query(statusQuery)[0]).Status;
        console.log(Status);

        if (driver_id) {
            //배송이 완료되지 않은 화물만 출력
            var query = `select AA.*, DD.DriverName, DD.DriverPhone from
        (select a.*, S.Action
        from AItem a join  Status s on a.status=s.ID
        where Driver = '${driver_id}' 
        and status!=6) AA
        join Driver DD on AA.driver=DD.ID`;

            if (sort) query += ` order by ${sort}`;
            var result = {};
            const data = connection.query(query);
            console.log(data);

            //완료된 것들
            const driver_status = connection.query(`select status from Driver where ID='${driver_id}'`)[0].status;
            const done = connection.query(`select count(*) as cnt from Aitem where Driver='${driver_id}' and Status=${driver_status}`)[0].cnt;
            const all = connection.query(`select count(*) as cnt from aitem where driver='${driver_id}' and status!=6`)[0].cnt;

            if (data) {
                result.Status = Status;
                result.Result = 'OK';
                result.Done = done;
                result.All = all;
                result.data = data;
                return result;
            } else {
                return NoResult;
            }
        } else {
            return WrongInput;
        }
    } catch (err) {
        console.error(err);
        return NoResult;
    }
}

//회사별 기사 목록 조회
exports.GetDriverList=function(userID) {
    const query=`select D.ID, D.DriverName, D.DriverPhone, S.Action from driver D
    join Status S
    on D.Status=S.ID
    where D.CourierID='${userID}'`;
    const result=connection.query(query);
    return result;
}
//기사 정보 출력
exports.GetDriver = function (driver_id) {
    if (driver_id) {
        const query = `select * from driver d join status s 
        on d.status = s.id
        where d.id='${driver_id}';`;
        const result = connection.query(query)[0];
        if (result) {
            return result;
        } else {
            return NoResult;
        }
    } else {
        return WrongInput;
    }
}

//안드로이드

const reusltOk = {
    Result: 'OK'
};
const resultErr = {
    Result: 'Error'
}

//기사 정보 반환
exports.GetDriverJson = function (driver_id, password) {
    const error = {
        ID: null,
        DriverName: null,
        DriverPhone: null,
        CourierID: null,
        Status: null
    }
    if (driver_id && password) {
        const query = `select ID, DriverName, DriverPhone, CourierID, Status 
        from Driver where ID='${driver_id}' and Password='${password}'`;
        const data = connection.query(query)[0];
        if (data) return data;
        else return error;
    } else {
        return error;
    }
}

exports.UpdateLocation = function (driver_id, address) {
    const query = `update Aitem set Location='${address}'
    where Driver='${driver_id}' 
    and Status!=5`;
    try {
        connection.query(query);
        return reusltOk;
    } catch (err) {
        console.error(err);
        return resultErr;
    }
}

exports.UpdateDriverStatus = function (driver_id, status) {
    const query = `update Driver set status=${status}
    where id='${driver_id}'`;

    try {
        connection.query(query);
        return reusltOk;
    } catch (err) {
        console.error(err);
        return resultErr;
    }
}

exports.UpdateAitemStatus = function (invoice, status) {
    const query = `update Aitem set status=${status} where invoicenum='${invoice}'`;
    try {
        connection.query(query);
        return reusltOk;
    } catch (err) {
        console.error(err);
        return resultErr;
    }
}

//하나의 화물 정보 얻어오기
exports.GetItemOnly = function (invoice) {
    const query = `select * from Aitem where invoicenum='${invoice}'`;
    const result = connection.query(query)[0];
    if (result) return result;
    else return resultErr;
}


//원하는 상태와 일치하는지 확인
exports.GetDone = function (driver_id, status) {
    //원하는 상태의 개수 확인
    const query1 = `select count(*) as cnt from aitem
    where status!=6 
    and status=${status}
    and driver='${driver_id}'`;

    const cnt1 = connection.query(query1)[0].cnt;
    console.log(cnt1);

    //모든 상태 확인
    const query2 = `select count(*) as cnt from aitem
    where status!=6
    and driver='${driver_id}'`;
    const cnt2 = connection.query(query2)[0].cnt;
    console.log(cnt2);

    if (cnt1 == cnt2) return reusltOk;
    else return resultErr;
}

exports.SetTimeLine = function (invoice, location, workdate, worktime, workid) {
    //일치하는 상태정보 먼저 검색
    const statusQuery = `select Action from status where id=${workid}`;
    const status = connection.query(statusQuery)[0].Action;

    //상태 업데이트
    const query = `insert into Timeline values('${invoice}', '${location}', '${workdate}', '${worktime}', '${status}')`;
    try {
        connection.query(query);
        return reusltOk;
    } catch (err) {
        console.error(err);
        return resultErr;
    }
}
