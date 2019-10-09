const fs=require('fs');
const mysql=require('sync-mysql');
/*MySQL 연동 쿼리 분리를 위해 
callback이 필요 없는 sync-mysql 모듈 사용 */

const connection=new mysql({
    host: 'localhost',
    user: 'IotAdmin',   //Iot DB관리 로컬 계정
    password: fs.readFileSync('pw.dat', 'utf-8'),   //비밀번호는 파일로 따로 관리
    database: 'IoT'
});
//에러 코드 지정
const NoResult={
    Result:'NoResult'
}
const WrongInput= {
    Result:'WrongInput'
}


//화물 조회
exports.GetItem=function(InvoiceNum) {
    //입력 값 검증
    if(!InvoiceNum||(InvoiceNum.length<=0||InvoiceNum.length>14)) {
        console.log(WrongInput);
        return WrongInput;
    }
    else { 
        const query=`select II.*, CC.Name as CompanyName from 
        (select I.*, D.* from (
        select A.*, S.Action from AItem A join Status as S
        on A.Status=S.ID
        where A.InvoiceNum='${InvoiceNum}') I 
        join Driver D
        on I.Driver=D.ID) II 
        join Courier CC
        on II.CompanyID=CC.ID;`;
        var result=connection.query(query)[0];
        if(result) {    //검색 결과 반환
            result.Result='OK';
            console.log(result);
            return result;
        } else {    //검색 결과 없음
            console.log(NoResult);
            return NoResult;
        }
    }
}

//타임라인 조회
exports.GetTimeLine=function(InvoiceNum){
    if(!InvoiceNum||(InvoiceNum.length<=0||InvoiceNum.length>14)) {
        console.log(WrongInput);
        return WrongInput;
    } else {
        const query=`select * from timeline
        where InvoiceNum='${InvoiceNum}'
        order by WorkDate asc, WorkTime asc;`
        var result=connection.query(query);
        console.log(result);
        return result;
    }
}