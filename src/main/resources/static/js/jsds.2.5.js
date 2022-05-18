var JOB_PATH = "";
//var JOB_PATH = "/job/";
var TB_STRING = 1;        //string value
var TB_INT = 2;           //integer value
var TB_DECIMAL = 4;       //double value
var TB_NUMBER = 5;
var TB_DATE = 8;          //physically string value
var TB_CHAR = 12;
var TB_CLOB = 9;

var TB_JOB_NORMAL = 1;
var TB_JOB_INSERT = 2;
var TB_JOB_UPDATE = 3;
var TB_JOB_DELETE = 4;

function jsds(objid, opt)
{
    this.bind_tab = false;
    this.bind_tabid = "";
    this.bind_obj = false;
    this.bind_objid = "";

    if (objid != undefined && opt != undefined)
    {
        this.jsds_id = objid;
        this.AsyncLoad = opt;
        
        this.colname = new Array();
        this.coltype = new Array();
        this.colleng = new Array();
        this.colcnt = 0;
    }
    
    this.loadingbar = false;
    this.RowPosition = 0;
    this.tbOld = new Array();
}

function jstr(trid)
{
    if (trid != undefined)
    {
        this.trid = trid;
        this.KeyValue = "";
        this.progid = "";
    }
}

(function(Obj) {

    Obj.prototype.initDs = function (objid, opt)
    {
        this.jsds_id = objid;
        this.AsyncLoad = opt;
        
        this.colname = new Array();
        this.coltype = new Array();
        this.colleng = new Array();
        this.colcnt = 0;
        this.RowPosition = 0;
        
        this.length = 0;
        this.tbOld = new Array();
    }
    
    Obj.prototype.set_Col = function (colstr) 
    {
        var i;
        var colB;
        var colAttB;
        var pos;
        var col_type;
    
        this.colHeader = colstr; // 임시 저장
        colB = colstr.split(',');
    
        this.colcnt = colB.length;
    
        for (i = 0; i < colB.length; i++) 
        {
            colAttB = colB[i].split(':');
            this.colname[i] = colAttB[0].toUpperCase();
            pos1 = colAttB[1].indexOf('(');
            pos2 = colAttB[1].indexOf(')');
            col_type = colAttB[1].substring(0, pos1).toUpperCase();
    
            switch (col_type) {
                case 'STRING':
                    this.coltype[i] = TB_STRING;
                    break;
                case 'VARCHAR':
                    this.coltype[i] = TB_STRING;
                    break;
                case 'TEXT':
                    this.coltype[i] = TB_STRING;
                    break;
                case 'INT':
                    this.coltype[i] = TB_INT;
                    break;
                case 'DECIMAL':
                    this.coltype[i] = TB_DECIMAL;
                    break;
                case 'NUMBER':
                    this.coltype[i] = TB_NUMBER;
                    break;
                case 'DATE':
                    this.coltype[i] = TB_DATE;
                    break;
                case 'CHAR':
                    this.coltype[i] = TB_CHAR;
                    break;
                case 'CLOB':
                    this.coltype[i] = TB_CLOB;
                    break;
            }
            this.colleng[i] = colAttB[1].substring(pos1 + 1, pos2);
        }
        
        this.length = 0;
        this.tbOld.length = 0;
    }
    
    Obj.prototype.AddRow = function(opt)
    {
        var i;
        var onerow = {};
        var onerowold = {};
        var Rows = (this.tbOld.length == 0 ? this.tbOld.length+1 : this.tbOld.length);
        
        this[Rows] = onerow;
        this.tbOld[Rows] = onerowold;
        
        this[Rows].status = "I";

        onerow.rowposition = Rows;
        onerow.parentObj = this;
        
        if (this.bind_tab == true && opt != "already_tr_add")
            _AddTr(this.bind_tabid);

        for (i = 0; i < this.colcnt; i++)
        {
            var cname = this.colname[i];
            
            // 값지정시에 로우상태를 체크하기 위해 프로퍼티 재지정
            var propertystr = 
            'Object.defineProperty(onerow, "' + cname + '", { ' +
            '    get: function() ' +
            '    { ' +
            '        return this["' + cname + '_HID"]; ' +
            '    }, ' +
            '    set: function(value) ' +
            '    { ' +
            '        this["' + cname + '_HID"] = value; ' +
            '        onerow.parentObj.checkRowStatus(onerow.rowposition); ' +
            '        if (onerow.parentObj.bind_tab == true) ' +
            '            _SetNameValue(onerow.parentObj.bind_tabid, onerow.rowposition, "' + cname + '", value); ' +
            '        if (onerow.parentObj.bind_obj == true) ' +
            '            _BindNameValue(onerow.parentObj.bind_objid, onerow.rowposition, "' + cname + '", value); ' +
            '    } ' +
            '})';
            eval(propertystr);
            
            this[Rows][cname] = "";
            this.tbOld[Rows][cname] = "";
        }

        if (opt == "Makejsds")
            this.RowPosition_HID = Rows;
        else
            this.RowPosition = Rows;
    }

    Obj.prototype.InsertRow = function (row, opt)
    {
        //// AddRow 한줄 추가
        var i;
        var onerow = {};
        var onerowold = {};
        var Rows = (this.tbOld.length == 0 ? this.tbOld.length + 1 : this.tbOld.length);

        this[Rows] = onerow;
        this.tbOld[Rows] = onerowold;

        this[Rows].status = "";

        onerow.rowposition = Rows;
        onerow.parentObj = this;

        if (row == Rows - 1)
        {
            if (this.bind_tabid != "")
                _AddTr(this.bind_tabid, "");  // 마지막 행이라면 스크롤 조정
        }
        else
        {
            if (this.bind_tabid != "")
                _InsertTr(this.bind_tabid, row + 1, "");
        }

        for (i = 0; i < this.colcnt; i++)
        {
            var cname = this.colname[i];

            // 값지정시에 로우상태를 체크하기 위해 프로퍼티 재지정
            var propertystr =
            'Object.defineProperty(onerow, "' + cname + '", { ' +
            '    get: function() ' +
            '    { ' +
            '        return this["' + cname + '_HID"]; ' +
            '    }, ' +
            '    set: function(value) ' +
            '    { ' +
            '        this["' + cname + '_HID"] = value; ' +
            '        onerow.parentObj.checkRowStatus(onerow.rowposition); ' +
            '        if (onerow.parentObj.bind_tab == true) ' +
            '            _SetNameValue(onerow.parentObj.bind_tabid, onerow.rowposition, "' + cname + '", value); ' +
            '        if (onerow.parentObj.bind_obj == true) ' +
            '            _BindNameValue(onerow.parentObj.bind_objid, onerow.rowposition, "' + cname + '", value); ' +
            '    } ' +
            '})';
            eval(propertystr);
        }

        /* 한칸씩 시프트 */
        for (i = (this.length - 1) ; i > row; i--)
        {
            for (var c = 0; c < this.colname.length; c++)
            {
                var cname = this.colname[c] + "_HID";
                this[i + 1][cname] = this[i][cname];
            }
            this.setRowStatus(i + 1, this[i].status);
        }

        // 삽입 로우 클리어
        for (var c = 0; c < this.colname.length; c++)
        {
            var cname = this.colname[c];
            this[row + 1][cname] = "";
        }

        this.setRowStatus(row + 1, "I");
        this.RowPosition = row + 1;
    }

    Obj.prototype.DelRow = function(row)
    {
        if (this.length == 0) return;

        if (this[row].status == "I")
            this.RemRow(row);
        else
        {
            this[row].status = "D";
        }
    }

    Obj.prototype.ClearData = function(opt)
    {
        if (this.length == 0) return;
        
        if (this.bind_tab == true && opt != "already_tr_clear")
            _ClearData(this.bind_tabid);
        
        this.length = 0;
        this.tbOld.length = 0;

        this.RowPosition = 0;
    }

    Obj.prototype.RemRow = function(row, opt)
    {
        if (this.length == 0) return;

        if (this.bind_tab == true && opt != "already_tr_delete")
            _DelTr(this.bind_tabid, row);
        
        this.splice(row, 1);
        this.tbOld.splice(row, 1);

        if (this.RowPosition > this.length)
            this.RowPosition = this.length;
        else
        {
            // RowPosition 은 변하지 않았지만 변한 것 처럼 이벤트를 발생시킴
            if (this.bind_obj == true)
                _BindNameValueAll(this.bind_objid, this.RowPosition);

            //create event
            OnRowPosChanged = new Event();

            try
            {
                //add handler
                OnRowPosChanged.addHandler(eval(this.jsds_id + "_OnRowPosChanged"));

                //raise event
                OnRowPosChanged.raise(this.RowPosition);
            }
            catch (e) {; }
        }
    }

    Obj.prototype.splice = function(row, howmany)
    {
        for (var k = 0; k < howmany; k++)
        {
            for (var i = row; i < this.length-k; i++)
            {
                this[i] = this[i+1];
                this[i].rowposition = i;  // 칼럼의 set property 를 위해 재지정
            }
            
            delete this[this.length-k];
        }
    }
    
    Obj.prototype.CancelRow = function(row, opt)
    {
        if (this.length == 0) return;

        if (this.bind_tab == true && opt != "already_tr_cancel")
            _CancelTr(this.bind_tabid, row);

        if (this[row].status == "U" || this[row].status == "D")
        {
	        this[row].status = "";

	        for (var i = 0; i < this.colname.length; i++)
	        {
                var cname = this.colname[i];
    	        this[row][cname] = this.tbOld[row][cname];
    	    }
        }
        else if (this[row].status == "I")
        {
            //this.RemRow(row);
            if (this.length == 0) return;
    
            this.splice(row, 1);
            this.tbOld.splice(row, 1);
    
            if (this.RowPosition > this.length)
                this.RowPosition = this.length;
            else
                this.RowPosition = row - 1;
        }
    }
    
    // 현재 로우의 상태를 다시 체크 후 지정
    Obj.prototype.checkRowStatus = function(row)
    {
        if (this.length == 0) return;

        var	updflag = 0;
    	for (i = 0; i < this.colname.length; i++)
        {
            var cname = this.colname[i];
            
            if (this[row][cname] != this.tbOld[row][cname])
            {
                updflag = 1;
                break;
            }
        }

        if (updflag == 1)
        {
            if (this[row].status == "")
                this[row].status = "U";
        }
        else
        {
            if (this[row].status != "I" && this[row].status != "D")
                this[row].status = "";
        }
    }

    Obj.prototype.PutCol = function(row, colname, valuestr)
    {
        var i;

        if (this.colname.length == 0)
            return;
        
        colname = colname.toUpperCase();
        
        // 존재하는 칼럼인지 확인
        var colidx = this.colname.indexOf(colname);

        if (colidx < 0)
            return;

        this[row][colname] = valuestr;

        this.checkRowStatus(row);

        if (this.bind_tab == true)
            _SetNameValue(this.bind_tabid, row, colname, valuestr);
            
        if (onerow.parentObj.bind_obj == true)
            _BindNameValue(this.bind_objid, row, colname, valuestr);
    }
    
    Obj.prototype.RowStatus = function(row)
    {
        return this[row].status;
    }

    Obj.prototype.setRowStatus = function(row, statusstr, opt)
    {
        this[row].status = statusstr;
        
        if (statusstr == "")
        {
            var j;
    
            /* 복사본에도 넣어 준다 */
            for (j = 0; j < this.colname.length; j++)
            {
                var cname = this.colname[j];
                this.tbOld[row][cname] = this[row][cname];
            }
        }

        if (this.bind_tab == true && opt != "already_tr_setrowstatus")
            _setRowStatus(this.bind_tabid, row, statusstr);
    }

    Obj.prototype.setRowPosition = function (row)
    {
        this.RowPosition = row;
    }
    
    Obj.prototype.tbReset = function(opt)
    {
        var i, j;

        if (this.length > 0 && opt == undefined)
            this.RowPosition = 0;

        if (this.length == 0) this.RowPosition = 0;

        /* 복사본에도 넣어 준다 */
        for (i = (this.length); i >= 1; i--)
        {
            if (this[i].status == "D")
            {
                if (this.bind_tab == true)
                    _DelTr(this.bind_tabid, i);

                //this.DelRow(i);
                this.splice(i, 1);
                this.tbOld.splice(i, 1);
            }
            else
            {
                this[i].status = "";
                for (j = 0; j < this.colname.length; j++)
                {
                    var cname = this.colname[j];
                    this.tbOld[i][cname] = this[i][cname];
                }

                if (this.bind_tab == true)
                    _setRowStatus(this.bind_tabid, i, this[i].status);
            }
        }
    }
    
    Obj.prototype.Reset = function(progid, argString)
    {
        /* 배열 할당 해제, 변수 초기화 */
        this.length = 0;
        this.tbOld.length = 0;

        this.RowPosition = 0;

        try
        {
            if (this.bind_tab != true && this.loadingbar == true)
                _LoadingBarBody("ON")
        } catch (e) { ; }
    
        /* 데이타 수신 페이지 실행 */
        sendHTTP (progid, argString, this.AsyncLoad, this);
    }

    Obj.prototype.Makejsds = function (rettext)
    {
        var i, j;
        var col_name;
        var col_value;
        var col_type;
        var setNode;
        var rowNode;

        //Load the return envelope into a JSON
		
		var retobj = JSON.parse(rettext);

        if (retobj[0]["STATUS"] != "OK")
        {
            alert (retobj[0]["DESCRIPTION"]);
            return false;
        }

        if (retobj.length <= 1) return;
        
        this.set_Col (String(retobj[1]["COL"]));

        var rowstr = "";
        
        // 잠시 바인딩 중지
        var sv_bind_tab = this.bind_tab;
        this.bind_tab = false;
        var sv_bind_obj = this.bind_obj;
        this.bind_obj = false;

        
        for (i = 2; i < retobj.length; i++)
        {
            this.AddRow ("Makejsds");
            
            for (j = 0; j < this.colcnt; j++)
            {
                col_name = this.colname[j];
                col_value = retobj[i][col_name];
                                
                this[this.RowPosition][col_name] = col_value;
                
                // 복사본에도 넣어 준다
                this.tbOld[this.RowPosition][col_name] = col_value;
            }

            this[this.RowPosition].status = "";
            
            // 복사본에도 넣어 준다
            this.tbOld[this.RowPosition].status = this[this.RowPosition].status;
        }
        
        this.bind_tab = sv_bind_tab;
        this.bind_obj = sv_bind_obj;
        
        if (this.length > 0)
            this.RowPosition = 0;
        
        try
        {
            if (this.bind_tab != true && this.loadingbar == true)
                _LoadingBarBody("OFF")
        } catch (e) { ; }
        
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

    Obj.prototype.IsUpdated = function ()
    {
        var statusflag = false;
        
        for (var i = 1; i <= this.length; i++)
        {
            if (this[i].status != "")
            {
                statusflag = true;
                break;
            }
        }
        
        return statusflag;
    }
    
    Obj.prototype.Sort = function (colname, opt)
    {
        var i;
        var j;
        var now;
        var point;
        var coltmp = new Array();
        var tmpstatus;
        var nowsatus;
        var tmpsortno;

        for (i = 1; i <= this.length; i++)
        {
            point = i;
            for (now = point; now != 1; now--)
            {
                if (now == 1)
                    break;

                if ((opt == "UP") ?
                    (this[now - 1][colname] < this[now][colname]) :
                    (this[now - 1][colname] > this[now][colname]))
                {
                    tmpstatus = this[now - 1].status;
                    tmpsortno = this[now - 1].sortno;
                    nowsatus = this[now].status;

                    for (j = 0; j < this.colcnt; j++)
                    {
                        var cname = this.colname[j];

                        coltmp[j] = this[now - 1][cname];
                        this[now - 1][cname] = this[now][cname];
                        this[now][cname] = coltmp[j];

                        coltmp[j] = this.tbOld[now - 1][cname];
                        this.tbOld[now - 1][cname] = this.tbOld[now][cname];
                        this.tbOld[now][cname] = coltmp[j];
                    }

                    this[now - 1].status = nowsatus;
                    this[now].status = tmpstatus;
                    this[now - 1].sortno = this[now].sortno;
                    this[now].sortno = tmpsortno;
                }
                else
                    break;
            }
        }
    }

    Object.defineProperty(Obj.prototype, "length", { 
        get: function() 
        { 
            return (this.tbOld.length == 0 ? this.tbOld.length : this.tbOld.length - 1);
        },
        set: function(value)
        {
            if (value == 0)
            {
                for (i = (value + 1) ; i <= (this.tbOld.length * 1) ; i++)
                    delete this[i];
            }
            else
                this.splice(value + 1, this.tbOld.length - value - 1);

            if (value == 0)
                this.tbOld.length = value;
            else
                this.tbOld.length = value+1;
        }
    });
    
    Object.defineProperty(Obj.prototype, "RowPosition", { 
        get: function() 
        { 
            return this.RowPosition_HID;
        },
        set: function(value)
        {
            var ischanged = false;
            
            if (this.RowPosition_HID != value)
                ischanged = true;
                
            this.RowPosition_HID = value;
            
            if (ischanged == true)
            {
                if (this.bind_obj == true)
                    _BindNameValueAll(this.bind_objid, value);
            
                //create event
                OnRowPosChanged = new Event();
        
                try
                {
                    //add handler
                    OnRowPosChanged.addHandler(eval(this.jsds_id + "_OnRowPosChanged"));
        
                    //raise event
                    OnRowPosChanged.raise(value);
                }
                catch(e) {;}
            }
        }
    });
})(jsds);

(function(Obj) {
    Obj.prototype.initTr = function (trid)
    {
        this.trid = trid;
        this.KeyValue = "";
        this.progid = "";
    }
    
    Obj.prototype.Post = function()
    {
        var i, j, modcnt;
        var rettext;
        var fld_nm;
        var n_type;
        var fldval;
        var KeyB;
        var KeyAttB;
        var progid;
        var dataset;
        var jsobjstr = '';
        var datafnstr;
        var colstr1;
        var colstr2;
        var n_type;
        var n_typestr;
        var n_status;

        if (window.ActiveXObject)
            var objHTTP = new ActiveXObject("Microsoft.XMLHTTP");   // 구 IE 버젼
        else if (window.XMLHttpRequest)
            var objHTTP = new XMLHttpRequest();  // IE 7.0 이상, 크롬, 파이어폭스 등
        
        rettext = '';
        modcnt = 0;

        KeyB = this.KeyValue.split(',');  // "test_t01=jsds_1,test_t02=jsds_2"

        jsobjstr += '{' + '\n';

        for (kdx = 0; kdx < KeyB.length; kdx++)
        {
            KeyAttB = KeyB[kdx].split('=');
            pid = KeyAttB[0];

            if (this.progid == "")
                this.progid = pid + ".aspx";

            dataset = eval(KeyAttB[1]);

            if (kdx == 0)
    	        jsobjstr += '    "' + pid + '":' + '\n';
    	    else
    	        jsobjstr += '    ,"' + pid + '":' + '\n';
    	    jsobjstr += '    [' + '\n';

            colstr1 = '';
            colstr2 = '';
            for (i = 0; i < dataset.colcnt; i++)
            {
                if (dataset.colname[i].substring(0, 1) == "@") continue;

                if (colstr1 == '')
                    colstr1 += dataset.colname[i];
                else
                    colstr1 += ',' + dataset.colname[i];
                
                colstr2 += 'this.' + dataset.colname[i] + '=' + dataset.colname[i] + ';';
            }
            
            // 칼럼 오브젝트 생성
            datafnstr = 'function ' + pid + '_data_js(' + colstr1 + ')';
            datafnstr += '{' + colstr2 + '}';
            eval(datafnstr);

            var rowidx = 0;
            
            for (i = 1; i <= dataset.length; i++)
            {
                if (dataset.RowStatus(i) != "")  // 상태 변화가 있는 것만
                {
                    switch(dataset.RowStatus(i)) 
    	            {
                        case "I":
                            n_status = TB_JOB_INSERT;
    	                    break;
                        case "U":
                            n_status = TB_JOB_UPDATE;
    	                    break;
                        case "D":
                            n_status = TB_JOB_DELETE;
                            break;
	                }

                    fldval = '';
                    for (j = 0; j < dataset.colcnt; j++)
                    {
                        var cname = dataset.colname[j];
                        if (cname.substring(0, 1) == "@") continue;

                        cvalue = dataset[i][cname].toString();
                        if (dataset.coltype[j] == TB_NUMBER)
                            cvalue = cvalue.replace(/,/gi, "");

                        if (fldval == '')
                        {
                            //fldval += '"' + escape(cvalue) + '"';
                            fldval += '"' + encodeURIComponent(cvalue) + '"';
                        }
                        else
                        {
                            //fldval += ',"' + escape(cvalue) + '"';
                            fldval += ',"' + encodeURIComponent(cvalue) + '"';
                        }
                    }
               	    var objdata;
            	    eval('objdata = new ' + pid + '_data_js(' + fldval + ')');

                    if (rowidx == 0)
            	        jsobjstr += '        {"' + n_status + '":[' + JSON.stringify(objdata) + ']}' + '\n';
                    else
            	        jsobjstr += '        ,{"' + n_status + '":[' + JSON.stringify(objdata) + ']}' + '\n';

            	    rowidx++;
                    modcnt++;
                }
            }

       	    jsobjstr += '    ]' + '\n';
        }

   	    jsobjstr += '}' + '\n';
   	    
        if (modcnt == 0)
            return "ERR-";

        var date = new Date();
        var time = date.getTime();

        objHTTP.open("POST", JOB_PATH + this.progid + "?pversion=" + time, false);
        objHTTP.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    
        objHTTP.send (jsobjstr);

//alert(objHTTP.readyState + "::" + objHTTP.status);
//        objHTTP.onreadystatechange = function() 
//        {
            if (objHTTP.readyState == 4)   //서버 처리 완료
            {
                if (objHTTP.status != 200)      // 200 : 파일 수신 성공
                {
                    exceptionControl(objHTTP);  // 예외 처리
                    return "ERR-" + objHTTP.statusText;
                }
            }
//        }

        //Get the return envelope
        rettext = objHTTP.responseText;

		var retobj = JSON.parse(rettext);

        if (retobj[0]["RESULT"] == "OK")
        {
	        for (kdx = 0; kdx < KeyB.length; kdx++)
    	    {
        	    KeyAttB = KeyB[kdx].split('=');
        	    dataset = eval(KeyAttB[1]);

        	    var sv_length = dataset.length;
        	    var svrowposition = dataset.RowPosition;
        	    dataset.tbReset("after_post");

        	    if (svrowposition > dataset.length)
        	        dataset.RowPosition_HID = dataset.length;
        	    else
        	        dataset.RowPosition_HID = svrowposition;

	            // 전체 로우수 가 바뀌면 OnRowPosChanged 발생
        	    var ischanged = false;

        	    if (sv_length != dataset.length)
        	        ischanged = true;

        	    if (ischanged == true)
        	    {
        	        if (this.bind_obj == true)
        	            _BindNameValueAll(this.bind_objid, value);

        	        //create event
        	        OnRowPosChanged = new Event();

        	        try
        	        {
        	            //add handler
        	            OnRowPosChanged.addHandler(eval(dataset.jsds_id + "_OnRowPosChanged"));

        	            //raise event
        	            OnRowPosChanged.raise(dataset.RowPosition);
        	        }
        	        catch (e) {; }
        	    }
                //
            }
            if (this.trid == "") return true;

	        //create event
            OnSuccess = new Event();

	        try
    	    {
        	    //add handler
                OnSuccess.addHandler(eval(this.trid + "_OnSuccess"));

	            //raise event
                if (retobj[0]["RESULT_VALUE"] == undefined || retobj[0]["RESULT_VALUE"] == "")
                    OnSuccess.raise();
                else
                    OnSuccess.raise(retobj[0]["RESULT_VALUE"]);
        	}
	        catch(e) {;}

            return true;
        }
        else
        {
            if (this.trid == "") return false;

            //create event
            OnFail = new Event();

            try
            {
                //add handler
                OnFail.addHandler(eval(this.trid + "_OnFail"));

                //raise event
                OnFail.raise(unescape(retobj[0]["DESCRIPTION"]));
            }
            catch(e) {;}

            return false;
        }
    }
    
})(jstr);

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
			alert(objHTTP.readyState);
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

// 예외 처리 (status != 200)
var ERROR_MESSAGE = "";
function exceptionControl(xmlHttp) 
{
    var el = document.createElement("html");
    el.innerHTML = xmlHttp.responseText;
    ERROR_MESSAGE = el.getElementsByTagName("body")[0].innerHTML;

    if (popupLayer_iframe != undefined)
    {
        if (xmlHttp.status.toString().trim() == "0") return;

        var popattr =
        {
            "title": "오류 - [" + xmlHttp.status + "] - " + xmlHttp.statusText,
            "url": "/common/error_message.aspx?",
            "width": 740,
            "height": 370,
            "callback": null,
            "scrollyn": "Y",
            "bordercolor": "orange"  // orange or blue
        };

        popupLayer_iframe(popattr);
    }
    else
    {
        var exceptShow = "status code: " + xmlHttp.statusText;
        alert(exceptShow);
    }
}

function getErrorMessage()
{
    return ERROR_MESSAGE;
}

function cloneObject(obj)
{
    var temp = {};

    temp.jsds_id = obj.jsds_id;
    temp.AsyncLoad = obj.AsyncLoad;

    temp.colname = new Array();
    temp.coltype = new Array();
    temp.colleng = new Array();

    for (var c = 0; c < obj.colname.length; c++)
    {
        temp.colname[c] = obj.colname[c];
        temp.coltype[c] = obj.coltype[c];
        temp.colleng[c] = obj.colleng[c];
    }

    temp.colcnt = obj.colcnt;
    temp.RowPosition = 1;

    temp.tbOld = new Array();

    for (var i = 1; i <= obj.length; i++)
    {
        temp[i] = {};
        temp.tbOld[i] = {};
        for (var c = 0; c < obj.colcnt; c++)
        {
            var colname = temp.colname[c];
            temp[i][colname] = obj[i][colname];
            temp.tbOld[i][colname] = obj[i][colname];
        }
        temp[i].status = "";
    }

    temp.length = obj.length;

    return temp;
}