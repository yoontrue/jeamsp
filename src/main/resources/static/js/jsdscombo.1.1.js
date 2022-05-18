function jsdscombo(objid, opt)
{
    if (objid != undefined && opt != undefined)
    {
        this.jsds_id = objid;
        this.AsyncLoad = opt;
    }
}

(function (Obj)
{
    Obj.prototype.Reset = function (progid, argString, ods_1, ods_2, ods_3, ods_4, ods_5, ods_6)
    {
        if (ods_1 != undefined)
            ods_1.ClearData();
        if (ods_2 != undefined)
            ods_2.ClearData();
        if (ods_3 != undefined)
            ods_3.ClearData();
        if (ods_4 != undefined)
            ods_4.ClearData();
        if (ods_5 != undefined)
            ods_5.ClearData();
        if (ods_6 != undefined)
            ods_6.ClearData();
    
        this.ds_1 = ods_1;
        this.ds_2 = ods_2;
        this.ds_3 = ods_3;
        this.ds_4 = ods_4;
        this.ds_5 = ods_5;
        this.ds_6 = ods_6;

        /* 데이타 수신 페이지 실행 */
        sendHTTP (progid, argString, this.AsyncLoad, this);
    }

    Obj.prototype.Makejsds = function (rettext)
    {
        //Load the return envelope into a JSON
		
        var retset = JSON.parse(rettext);

        for (var idx = 0; idx < retset.length; idx++)
        {
            var rtext = JSON.stringify(retset[idx]);

            if (idx == 0)
            {
                try { this.ds_1.Makejsds(rtext); } catch (e) {; }
            }
            if (idx == 1)
            {
                try { this.ds_2.Makejsds(rtext); } catch (e) {; }
            }
            if (idx == 2)
            {
                try { this.ds_3.Makejsds(rtext); } catch (e) {; }
            }
            if (idx == 3)
            {
                try { this.ds_4.Makejsds(rtext); } catch (e) {; }
            }
            if (idx == 4)
            {
                try { this.ds_5.Makejsds(rtext); } catch (e) {; }
            }
            if (idx == 5)
            {
                try { this.ds_6.Makejsds(rtext); } catch (e) {; }
            }
        }
        
        if (this.jsds_id == "") return;

        var evt_jsds_id = this.jsds_id;

        //create event
        OnLoadCompleted = new Event();

        try
        {
            //add handler
            OnLoadCompleted.addHandler(eval(evt_jsds_id + "_OnLoadCompleted"));

            //raise event
            OnLoadCompleted.raise();
        }
        catch (e) {; }
    }
})(jsdscombo);

function sendHTTP (progid, argString, async, jsds_obj)
{
    if (window.ActiveXObject)
        var objHTTP = new ActiveXObject("Microsoft.XMLHTTP");   // 구 IE 버젼
    else if (window.XMLHttpRequest)
        var objHTTP = new XMLHttpRequest();  // IE 7.0 이상, 크롬, 파이어폭스 등

    var rettext;

    var date = new Date();
    var time = date.getTime();

    objHTTP.open("POST", JOB_PATH + progid + "?pversion=" + time, async);
    //objHTTP.open("POST", JOB_PATH + progid, async);

    objHTTP.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

    objHTTP.send (argString);

    if (async == false)
    {
        if (objHTTP.status != 200)      // 200 : 파일 수신 성공
        {
            exceptionControl(objHTTP);  // 예외 처리
            return "";
        }

        //Get the return envelope
        rettext = objHTTP.responseText;
        jsds_obj.Makejsds (rettext);
    }
    else
    {
        objHTTP.onreadystatechange = function() 
        {
            if (objHTTP.readyState == 4)   //서버 처리 완료
            {
                if (objHTTP.status != 200)      // 200 : 파일 수신 성공
                {
                    // 예외 처리
                    exceptionControl(objHTTP);  // 예외 처리
                    return "";
                }
                else
                {
                    //Get the return envelope
                    rettext = objHTTP.responseText;
                    jsds_obj.Makejsds (rettext);
                }
            }
        }
    }
}