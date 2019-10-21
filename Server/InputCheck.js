//입력값 학인 모듈

//송장번호 입력 확인
exports.IsValidInvoice = function (Company, InvoiceNum) {
    //숫자가 아닌 값이 입력되면 거짓
        //길이 파악을 위해 문자열로 변환
        var InvoiceNumStr = String(InvoiceNum);
        console.log('택배사: '+Company);
        console.log('문자열 길이:'+InvoiceNumStr.length);
        //택배사에 따라 다른 규칙 적용
        switch (Company) {
            case "CJ":
                if (InvoiceNumStr.length == 12) return true;
                else return false;
            case "Post":
                if (InvoiceNumStr.length == 13) return true;
                else return false;
            case "Logen":
                if (InvoiceNumStr.length == 11) return true;
                else return false;
            case "Hangin":
                if (InvoiceNumStr.length == 12) return true;
                else return false;
            default:
                return false;
        }
}