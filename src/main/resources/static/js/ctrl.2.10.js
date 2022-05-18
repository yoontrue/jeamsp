
createLoadingBarBody();  // body로딩바

(function($) {
    $.fn.initTable = function (headerattr)
    {
        var tbobj = this.get(0);

        createLoadingBar(tbobj.id);  // 로딩바
        
        /// 테이블에 div 입히기 start
        var parent = tbobj.parentNode;
        var wrapper = document.createElement("div");

        parent.replaceChild(wrapper, tbobj);   // wrapper 를 child 로 세팅(tbobj 대신)
        wrapper.appendChild(tbobj);            // element 를 wrapper 의 child 로 세팅 
        
        wrapper.id = "wrapper_" + tbobj.id;
        /// 테이블에 div 입히기 end
        
        var i;
        
        tbobj.onclickB = new Array();
        tbobj.editB = new Array();
        tbobj.classB = new Array();
        tbobj.displayB = new Array();
        tbobj.typeB = new Array();
        tbobj.rowcolor = "#e4f5fa";
        tbobj.rowheight = "20px";
        tbobj.colgrpB = new Array();
        
        var idx = 0;
        var tableattr;
        var rowattr;
        var colattr;
		
        if (headerattr == undefined) //헤더 정보 없는 경우 테이블의 기본 값으로
        {
            var hdcells = tbobj.getElementsByTagName("THEAD")[0].rows[0].cells;
            
            var coltemp = "";
            for (i = 0; i < hdcells.length; i++)
                coltemp += '"COL' + i + '": { "onclick": false, "edit": "", "class": "", "display": "" }' + (i < hdcells.length-1 ? ',' : '');
            
            tableattr = { "width": this.width(), "height": this.height(), "border": "1px solid grey" };
            rowattr = { "rowcolor": "#e4f5fa", "rowheight": "23px" };
            colattr = JSON.parse('{' + coltemp + '}');
        }
        else
        {
            tableattr = headerattr["table"];
            rowattr = headerattr["row"];
            colattr = headerattr["column"];
        }
        
        tbobj.rowcolor = rowattr["rowcolor"];
        tbobj.rowheight = rowattr["rowheight"];
		
        if (tbobj.style.width != undefined && tbobj.style.width != "")
            wrapper.style.width = this.width() + "px";
        else
            wrapper.style.width = tableattr["width"];
		
        if (tbobj.style.height != undefined && tbobj.style.height != "")
            wrapper.style.height = this.height() + "px";
        else
            wrapper.style.height = tableattr["height"];

        tbobj.style.width = null;
        tbobj.style.height = null;

        //// colwidth 값의 합이 table의 width 값보다 더 큰 경우 table의 width 값을 재지정
        var colgrp = this.children("colgroup").find("col");
        var agent = navigator.userAgent.toLowerCase();

        var colwidthtot = 0;
        tbobj.tbWidthReset_flag = false;

        var colgroupxml = "<colgroup>" + $(this.children("colgroup")).html() + "</colgroup>";

        // xml로 col width 파싱
        $(colgroupxml).find('col').each(function (i)
        {
            var cwidth = $(this).attr("style").replace(/ /gi, '').toLowerCase().replace("width:", "").replace("px", "").replace(";", "") * 1;
            //alert(cwidth);
            tbobj.colgrpB[i] = (cwidth * 1 - 1) + "px";

            if (isNaN(cwidth) == false)
            {
                colwidthtot += cwidth * 1;
            }
            else
            {
                tbobj.tbWidthReset_flag = true;
                //return;
            }
        });
        

        var hridx = 0;
        if (tbobj.tbWidthReset_flag == false)  // thead 의 칼럼 너비도 재지정
        {
            tbobj.style.tableLayout = "fixed"; 
            tbobj.style.width = colwidthtot + "px";
            tbobj.colwidthtot = colwidthtot;
            
            if (tbobj.getElementsByTagName("THEAD")[0].rows.length > 1)  // 헤더2단
                hridx = 1;
            
            var hdcells = tbobj.getElementsByTagName("THEAD")[0].rows[hridx].cells;

            var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

            for (i = 0; i < colgrp.length; i++)
            {
                hdcells[i].style.width = ($(colgrp[i]).css("width").replace(/px/gi, "") * 1 - 1) + (isSafari ? 1 : 0) + "px";
            }
        }
        ////////

        wrapper.style.border = tableattr["border"];
        tbobj.style.marginTop = "-1px";
        tbobj.style.marginLeft = "-1px";
        
        tbobj.theader = "";
        tbobj.columnB = {};
        tbobj.colattr = colattr;
		
        for (var item in colattr)
        {
            var itemattr = colattr[item];

            tbobj.columnB[item] = idx;
            tbobj.onclickB[idx] = (itemattr.onclick == undefined ? false : itemattr.onclick);
            tbobj.editB[idx] = itemattr.edit;
            tbobj.classB[idx] = (itemattr.class == undefined ? "" : itemattr.class);
            tbobj.displayB[idx] = (itemattr.display == undefined ? "" : itemattr.display);
            tbobj.typeB[idx] = (itemattr.type == undefined ? "string" : itemattr.type);
		    
            if (tbobj.theader == "")
            {
                //tbobj.theader = item + ":STRING(255)";
                tbobj.theader = item + ":" + tbobj.typeB[idx].toUpperCase() + "(255)"
            }
            else
            {
                //tbobj.theader += "," + item + ":STRING(255)";
                tbobj.theader += "," + item + ":" + tbobj.typeB[idx].toUpperCase() + "(255)";
            }
            
            idx++;
        }
		
        if (wrapper.style.height == "auto" || wrapper.style.height == "100%")
        {
            tbobj.fixheader = false;
            //wrapper.style.height = (this.height()-1) + "px";
        }
        else
        {
            tbobj.fixheader = true;
       		
            // 헤더 고정
            this.fixedHeaderTable({
                height: wrapper.style.height,
                footer: false,
                cloneHeadToFoot: false,
                autoShow: true
                //fixedColumns: 1,
            });

            if (hridx > 0)  // 헤더가 2단일 경우 너비 보정
            {
                var ht_tb = $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").get(0);
                var hdcells21 = ht_tb.getElementsByTagName("THEAD")[0].rows[0].cells;
                var hdcells22 = ht_tb.getElementsByTagName("THEAD")[0].rows[1].cells;

                var cidx = 0;
                for (i = 0; i < hdcells21.length; i++)
                {
                    var xwidth = 0;
                    if ($(hdcells21[i]).attr("colspan") != undefined)
                    {
                        for (var j = 0; j < ($(hdcells21[i]).attr("colspan") * 1) ; j++)
                        {
                            //var cwidth = $(colgrp[cidx + j]).css("width").replace(/px/gi, "");
                            var cwidth = tbobj.colgrpB[cidx + j].replace(/px/gi, "") * 1;

                            xwidth += cwidth*1 + 1;
                            hdcells22[cidx + j].style.width = (cwidth) + "px";   // 2단
                        }

                        cidx += $(hdcells21[i]).attr("colspan") * 1;

                        hdcells21[i].style.width = (xwidth - 1) + "px";  // 1단
                    }
                    else
                    {
                        //var cwidth = $(colgrp[cidx]).css("width").replace(/px/gi, "");
                        var cwidth = tbobj.colgrpB[cidx].replace(/px/gi, "") * 1;

                        hdcells21[i].style.width = (cwidth) + "px";   // 1단
                        cidx++;
                    }

                    $(hdcells21[i]).find("div").css("width", (xwidth - 1) + "px");

                    if (i == (hdcells21.length - 1))
                        hdcells21[i].style.paddingRight = "0px";
                }
            }
            else
            {
                var ht_tb = $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").get(0);
                var hdcells2 = ht_tb.getElementsByTagName("THEAD")[0].rows[0].cells;

                hdcells2[(hdcells2.length - 1)].style.paddingRight = "0px";
            }
        }

        // wraper 에 class 추가
        $("#wrapper_" + tbobj.id).children(0).get(0).className = $("#wrapper_" + tbobj.id).children(0).get(0).className + " outbox_tb_h";
        $("#wrapper_" + tbobj.id).css("height", ($("#wrapper_" + tbobj.id).height() + 2) + "px");

        /// 데이터셋 생성 start
        tbobj.jsds = new jsds();
		
        var i;
        var tbody = tbobj.getElementsByTagName("TBODY")[0];
        var rows = tbody.rows;

        tbody.style.display = "";
        
        if (tbobj.theader == "") return;
        
        // 데이터셋 초기화
        tbobj.jsds.initDs("t_" + tbobj.id, true);

        tbobj.jsds.set_Col(unescape(tbobj.theader));

        for (i = 0; i < rows.length; i++)
        {
            var td1 = rows[i].cells;
            
            tbobj.jsds.AddRow();
        
            for (j = 0; j < td1.length; j++)
            {
                var cname = tbobj.jsds.colname[j];
                
                if (tbobj.editB[j] == "checkbox")
                {
                    var chkobj = $(td1[j]).find("input:checkbox:first");
                    if (chkobj.is(":checked") == true)
                        tbobj.jsds[i+1][cname] = "T";
                    else
                        tbobj.jsds[i+1][cname] = "F";
                }
                else if (tbobj.editB[j] == "textarea")
                {
                    tbobj.jsds[i + 1][cname] = $(td1[j]).text().replace(/<br\/>/gi, "\n");
                }
                else
                {
                    tbobj.jsds[i + 1][cname] = $(td1[j]).text();
                }

                //td1[j].addEventListener("click", new Function("_Click('" + tbobj.id + "'," + i + "," + j + ",'" + cname + "')"));

                if (tbobj.getElementsByTagName("THEAD")[0].rows.length > 1)  // 헤더2단
                    td1[j].addEventListener("click", new Function("_Click('" + tbobj.id + "', (this.parentNode.rowIndex-2)," + j + ",'" + cname + "')"));
                else
                    td1[j].addEventListener("click", new Function("_Click('" + tbobj.id + "', (this.parentNode.rowIndex-1)," + j + ",'" + cname + "')"));
                
                if (tbobj.onclickB[j] == true)
                    td1[j].style.cursor = "pointer";

                //td1[j].style.overflow = "hidden";
                //td1[j].style.maxWidth = $(td1[j]).width() + "px";
                ////td1[j].style.wordBreak = "break-all";
                //td1[j].style.whiteSpace = "nowrap";
            }
        }

        tbobj.jsds.tbReset();  // 상태값 초기화
        /// 데이터셋 생성 end
		
        // table의 width 값을 재지정해야하는 경우 첫번 째 로우에서 한번 더 해준다. 
        if (tbobj.tbWidthReset_flag == false && tbobj.jsds.length > 0)
        {
            resetFirstRowCellsWidth(tbobj.id);
        }
    };
        
    $.fn.bindTableToDs = function(bnjsds) 
    {
        var tbobj = this.get(0);
        
        // wrapper 가 없다면 생성 및 초기화
        var wrapper = document.getElementById("wrapper_" + tbobj.id);
        if (wrapper == undefined || wrapper == null)
        {
            this.initTable();
            wrapper = document.getElementById("wrapper_" + tbobj.id);
        }
        
        tbobj.jsds.bind_tab = true;
        tbobj.jsds.bind_tabid = tbobj.id;

        if (bnjsds != undefined)
        {
            tbobj.jsds.jsds_id = bnjsds.jsds_id;
            tbobj.jsds.AsyncLoad = bnjsds.AsyncLoad;
        }

        return tbobj.jsds;
    };
    
    $.fn.bindDsToTable = function(jsds) 
    {
        var tbobj = this.get(0);
        
        // wrapper 가 없다면 생성 및 초기화
        var wrapper = document.getElementById("wrapper_" + tbobj.id);
        if (wrapper == undefined || wrapper == null)
        {
            this.initTable();
            wrapper = document.getElementById("wrapper_" + tbobj.id);
        }

        _LoadingBar(tbobj.id, "ON");
    
        _bindDsToTable(tbobj.id, jsds);

        setTimeout (function () { _LoadingBar(tbobj.id, "OFF");}, 10);
    };

    $.fn.AddTr = function(opt) {
        
        var tbobj = this.get(0);
        
        _AddTr(tbobj.id, opt);

        tbobj.jsds.AddRow("already_tr_add");
    };
    
    $.fn.DelTr = function(row) {
        
        var trow = row - 1;
        var drow = row;
        var tbobj = this.get(0);
        
        _DelTr(tbobj.id, drow);

        tbobj.jsds.RemRow(drow, "already_tr_delete");
    };

    $.fn.CancelTr = function(row)
    {
        var trow = row - 1;
        var drow = row;
        var tbobj = this.get(0);
    
        _CancelTr(tbobj.id, drow);

        tbobj.jsds.CancelRow(drow, "already_tr_cancel");
    };

    $.fn.RowPosition = function()
    {
        return this.get(0).jsds.RowPosition;
    };

    $.fn.SetValue = function(row, col, value) 
    {
        var trow = row - 1;
        var drow = row;
        
        var tbobj = this.get(0);
        var tbody = tbobj.getElementsByTagName("TBODY")[0];
        var rows = tbody.rows;
    	
        if (tbobj.editB[col] == "checkbox")
        {
            var chkobj = $(rows[trow].cells[col]).find("input:checkbox:first");
            if (value == "T")
            {
                //chkobj.attr("checked", true);
                chkobj[0].checked = true;
            }
            else
            {
                //chkobj.attr("checked", false);
                chkobj[0].checked = false;
            }
        }
        else
            rows[trow].cells[col].innerHTML = value;
	    
        var cname = getColumnName(tbobj.id, col);
        
        if (cname.substring(0, 1) != "@" && cname != "")
        {
            tbobj.jsds[drow][cname] = value;
            tbobj.jsds.checkRowStatus(drow);
        }
    };
    
    $.fn.SetNameValue = function (row, colname, value)
    {
        var trow = row - 1;
        var drow = row;
        
        var tbobj = this.get(0);
        
        _SetNameValue(tbobj.id, drow, colname, value);
        
        if (colname.substring(0, 1) != "@")
        {
            tbobj.jsds[drow][colname + "_HID"] = value;
            tbobj.jsds.checkRowStatus(drow);
            
            if (tbobj.jsds.bind_obj == true)  // 바인딩 객체와 연결되어 있다면
                _BindNameValue(tbobj.jsds.bind_objid, drow, colname, value);
        }
    };
    
    $.fn.SetNameClass = function (row, colname, classvalue)
    {
        var drow = row;

        var tbobj = this.get(0);
        _SetNameClass(tbobj.id, drow, colname, classvalue)
    };

    $.fn.SetNameColor = function (row, colname, color)
    {
        var drow = row;

        var tbobj = this.get(0);
        _SetNameColor(tbobj.id, drow, colname, color)
    };

    $.fn.GetValue = function(row, col, value) {
        
        var trow = row - 1;
        var drow = row;
        
        var tbobj = this.get(0);
        
        /*
        var tbody = tbobj.getElementsByTagName("TBODY")[0];
    	var rows = tbody.rows;
    	
    	return rows[trow].cells[col].innerHTML;
    	*/
    	
        var cname = getColumnName(tbobj.id, col);
        
        return tbobj.jsds[drow][cname];
    };
    
    $.fn.GetNameValue = function(row, colname, value) {
        
        var trow = row - 1;
        var drow = row;
        
        var tbobj = this.get(0);

        /*
        var col = tbobj.columnB[colname];
        if (col == undefined) return "";
        
        var tbody = tbobj.getElementsByTagName("TBODY")[0];
    	var rows = tbody.rows;
    	
    	return rows[trow].cells[col].innerHTML;
    	*/
    	
        return tbobj.jsds[drow][colname];
    };
    
    // 그리드 컨드롤의 콤보 박스에 채울 내용
    $.fn.setCboString = function (row, col, colname, cbostring)
    {
        var trow = row - 1;
        var drow = row;
        var tbobj = this.get(0);
    
        var objcboname = tbobj.id + "_combo_" + trow + col;
        var selectobj = $("#" + objcboname);
    
        if (selectobj.children("option").size() > 1) 
        {
            selectobj.focus();
            return;
        }
    
        if (cbostring != "")
        {
            var tmpinfo1 = cbostring.split("|");

            for (var i = 0; i < tmpinfo1.length; i++)
            {
                var tmpinfo2 = tmpinfo1[i].split(":");

                selectobj.append("<option value='" + tmpinfo2[0] + "'>" + tmpinfo2[1] + "</option>");
            }
        }
        
        //var cname = tbobj.jsds.colname[col];
        //var tdvalue = tbobj.jsds[drow][cname];
        
        var tdvalue = tbobj.jsds[drow][colname];

        selectobj.children("option").each(function(){
        
            var itemText = this.text;
    
            if (tdvalue == itemText)
                $(this).attr("selected", true);
        });
        
        selectobj.focus();
    };
    
    // 그리드 컨드롤의 콤보 박스에 채울 내용 구분자를 ',' -> '|' 변경하는것 추가 160310 장재성
    $.fn.setCboverticalString = function (row, col, colname, cbostring) {
        var trow = row - 1;
        var drow = row;
        var tbobj = this.get(0);

        var objcboname = tbobj.id + "_combo_" + trow + col;
        var selectobj = $("#" + objcboname);

        if (selectobj.children("option").size() > 1) {
            selectobj.focus();
            return;
        }

        var tmpinfo1 = cbostring.split("|");

        for (var i = 0; i < tmpinfo1.length; i++) {
            var tmpinfo2 = tmpinfo1[i].split(":");

            selectobj.append("<option value='" + tmpinfo2[0] + "'>" + tmpinfo2[1] + "</option>");
        }

        //var cname = tbobj.jsds.colname[col];
        //var tdvalue = tbobj.jsds[drow][cname];

        var tdvalue = tbobj.jsds[drow][colname];

        selectobj.children("option").each(function () {

            var itemText = this.text;

            if (tdvalue == itemText)
                $(this).attr("selected", true);
        });

        selectobj.focus();
    };

    // 칼럼 에디트 속성 변경
    $.fn.columnEdit = function (row, col, colname, editstr)
    {
        var trow = row-1;
        var drow = row;
        var tbobj = this.get(0);
        
        if (editstr != "")
        {
            _columnEdit(tbobj, trow, col, colname, editstr);
        }
        else
        {
            if (tbobj.editB[col] == "text")
                registertext(tbobj.id, trow, col, colname);
            if (tbobj.editB[col] == "combo")
                registercombo(tbobj.id, trow, col, colname);
            if (tbobj.editB[col] == "button")
                registerbutton(tbobj.id, trow, col, colname);
            if (tbobj.editB[col] == "textdate")
                registertext(tbobj.id, trow, col, colname);
            if (tbobj.editB[col] == "textarea")
                registertextarea(tbobj.id, trow, col, colname);
        }
    };
    
    // 칼럼 에디트 속성 변경 (전체)
    $.fn.columnEditChangeAll = function (colname, editstr)
    {
        var tbobj = this.get(0);

        for (var key in tbobj.columnB)
        {
            if (colname == key)
            {
                col = tbobj.columnB[key];
                tbobj.editB[col] = editstr;

                break;
            }
        }
    };

    $.fn.ClearData = function ()
    {
        var tbobj = this.get(0);
        
        _ClearData(tbobj.id);
        
        tbobj.jsds.ClearData("already_tr_clear");
    };
    
    $.fn.LoadingBar = function (opt)
    {
        var tbobj = this.get(0);
        
        _LoadingBar(tbobj.id, opt);
    };

    $.fn.LoadingBarS = function (opt)
    {
        var tbobj = this.get(0);

        _LoadingBarS(tbobj.id, opt);
    };

    $.fn.LoadingBarBody = function (opt)
    {
        _LoadingBarBody(opt);
    };
    
    $.fn.setRowStatus = function(row, statusstr)
    {
        var trow = row-1;
        var drow = row;
        var tbobj = this.get(0);

        _setRowStatus(tbobj.id, drow, statusstr);
    };

    $.fn.triggerClick = function (row, colname, position)
    {
        var trow = row - 1;
        var drow = row;
        var tbobj = this.get(0);
        var col = 0;

        for (var item in tbobj.colattr)
        {
            if (item == colname)
            {
                col = tbobj.columnB[item];
                break;
            }
        }

        _Click(tbobj.id, trow, col, colname);


        // 스크롤 포지션 조정
        var curtr = tbobj.getElementsByTagName("TBODY")[0].rows[trow];
        tbobj.parentNode.scrollTop = 0;

        var postop = $(curtr).position().top;

        if (position == undefined)
        {
            if (postop > ($(tbobj).parent().height() - tbobj.rowheight.replace(/px/gi, '')))
                tbobj.parentNode.scrollTop = $(curtr).position().top - ($(tbobj).parent().height() - tbobj.rowheight.replace(/px/gi, ''));
        }
        else
        {
            if (postop > ($(tbobj).parent().height() - tbobj.rowheight.replace(/px/gi, '')))
                tbobj.parentNode.scrollTop = $(curtr).position().top + 1;
        }
    };
    
    $.fn.fn_column_hide = function (colidx)
    {
        var tbobj = this.get(0);

        var htwidth = $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").width();
        var hrow = $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").find("thead tr");
        var hcwidth = $(hrow[0].cells[colidx]).width();

        //if ($(hrow[0].cells[colidx]).css("display") == "none")
        //    return;

        tbobj.displayB[colidx] = "none";

        $(hrow[0].cells[colidx]).hide();
        $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").css("width", (htwidth - hcwidth) + "px");

        tbobj.colwidthtot = (htwidth - hcwidth);

        var btwidth = $(this).width();

        var bhrows = $(this).find("thead tr");
        $(bhrows[0].cells[colidx]).hide();

        var brows = $(this).find("tbody tr");
        for (var i = 0; i < brows.length; i++)
            $(brows[i].cells[colidx]).hide();

        var colgrp = $(this).children("colgroup").find("col");

        if ($(colgrp[colidx]).css("display") == "none")
            return;

        $(colgrp[colidx]).hide();
        $(this).css("width", (htwidth - hcwidth) + "px");
    }

    $.fn.fn_column_show = function (colidx)
    {
        var tbobj = this.get(0);

        var htwidth = $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").width();
        var hrow = $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").find("thead tr");

        tbobj.displayB[colidx] = "";

        if ($(hrow[0].cells[colidx]).css("display") != "none")
            return;

        $(hrow[0].cells[colidx]).show();
        var hcwidth = $(hrow[0].cells[colidx]).width();

        $("#wrapper_" + tbobj.id).find(".fht-thead").find("table").css("width", (htwidth + hcwidth) + "px");

        tbobj.colwidthtot = (htwidth + hcwidth);

        var bhrows = $(this).find("thead tr");
        $(bhrows[0].cells[colidx]).show();

        var brows = $(this).find("tbody tr");
        for (var i = 0; i < brows.length; i++)
            $(brows[i].cells[colidx]).show();

        var colgrp = $(this).children("colgroup").find("col");

        $(colgrp[colidx]).show();
        $(this).css("width", (htwidth + hcwidth) + "px");
    }

    $.fn.Sort = function (colname, opt)
    {
        var tbobj = this.get(0);

        // sort 용 속성 추가
        for (i = 1; i <= tbobj.jsds.length; i++)
        {
            tbobj.jsds[i].sortno = i;
        }

        var sv_pos = 0;

        if (tbobj.jsds.RowPosition_HID != 0)
            sv_pos = tbobj.jsds[tbobj.jsds.RowPosition_HID].sortno;

        var crow = 0;

        tbobj.jsds.bind_tab = false;
        tbobj.jsds.Sort(colname, opt);
        tbobj.jsds.bind_tab = true;

        _bindDsToTable(tbobj.id, tbobj.jsds);

        var rows = tbobj.getElementsByTagName("TBODY")[0].rows;

        for (i = 1; i <= tbobj.jsds.length; i++)
        {
            if (sv_pos == tbobj.jsds[i].sortno)
            {
                crow = i;
            }

            var cells = rows[i - 1].cells;

            if (tbobj.jsds[i].status == "I")
            {
                cells[0].style.backgroundImage = "url('/js/imgctrl/blt_plus.png')";
                cells[0].style.backgroundRepeat = "no-repeat";
            }
            else
            {
                cells[0].style.backgroundImage = "";
                cells[0].style.backgroundRepeat = "";
            }
        }

        if (crow > 0)
        {
            tbobj.jsds.RowPosition = crow;
            selectRowColor(tbobj.id, crow - 1);
        }
    }

    $.fn.setWidth = function (iwidth)
    {
        var tbobj = this.get(0);

        var wrapper = document.getElementById("wrapper_" + tbobj.id);
        $(wrapper).width(iwidth);
    };

    $.fn.setHeight = function (iheight)
    {
        var tbobj = this.get(0);

        var wrapper = document.getElementById("wrapper_" + tbobj.id);
        $(wrapper).height(iheight);

        var t_wrapper = tbobj.parentNode.parentNode;
        $(t_wrapper).height(iheight);

        var t_tbody = tbobj.parentNode;

        $(t_tbody).height(iheight - ($(t_wrapper).find(".fht-thead").height() - 1));
    };
})(jQuery);


function _Click(tbid, row, col, colname)
{
    var trow = row;
    var drow = row + 1;
    var tbobj = eval(tbid);

    // 로우 바꾸어 주기전 체크 (리턴 값이 true가 아니면 바꾸어 주지 않는다)
    var before_check = true;
    if (tbobj.jsds.RowPosition != drow)
    {
        var tdvalue = tbobj.jsds[drow][colname];
        try
        {
            eval("before_check = " + tbid + "_before_click(" + tbobj.jsds.RowPosition + ", " + drow + ");");
        } catch (e) { ; }

        if (before_check != true) return;
    }
    //

    tbobj.jsds.RowPosition = drow;
    
    selectRowColor(tbid, trow);
    
    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;
    var tdvalue = tbobj.jsds[drow][colname];
    
    $("img[name*='_button_']").remove(); // 생성된 버튼이 있었다면 삭제

    // 칼럼 에디팅
    _columnEdit(tbobj, row, col, colname, tbobj.editB[col]);
    //

    if (tbobj.onclickB[col] == true)
    {
        //create event
        var onGridClick = new Event();
    
        try
        {
            //add handler
            onGridClick.addHandler(eval(tbid + "_click"));
            
            var tdvalue = tbobj.jsds[drow][colname];
    
            //raise event
            onGridClick.raise(drow, col, colname, tdvalue);
        }
        catch(e) 
        { 
            //alert(e.message);
        }
    }
}

/* 칼럼 에디트 속서에 따른 적용 */
function _columnEdit(tbobj, row, col, colname, editstr)
{
    var trow = row;
    var drow = row + 1;
    
    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;
    var tdvalue = tbobj.jsds[drow][colname];
    
    if (editstr == "text")
    {
        var objtextname = tbobj.id + "_text_" + row + col;
        
        var textobj = $("input[name=" + objtextname + "]");

        if (textobj.get(0) != undefined) 
        {
            textobj.focus();
            return;
        }
        
        var itextarea = '<input type="text" name="' + objtextname + '" style="border:0px;width:' + ($(rows[trow].cells[col]).width() - 4) + 'px;height:' + ($(rows[trow].cells[col]).height() - 3) + 'px"  onblur="registertext(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\');" onkeydown="keydowntext(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\')">';
        rows[trow].cells[col].innerHTML = itextarea;
        
        textobj = $("input[name=" + objtextname + "]");
        
        textobj.css("font-size", "inherit");

        if (tbobj.typeB[col] == "number")
            textobj.val(tdvalue.replace(/,/gi, ""));
        else
            textobj.val(tdvalue);

        textobj.focus();

        $(textobj).get(0).setSelectionRange(0, $(textobj).val().length);  // 블럭
    }
    
    if (editstr == "combo")
    {
        var objcboname = tbobj.id + "_combo_" + row + col;

        var selectobj = $("select[name=" + objcboname + "]");
        
        if (selectobj != undefined && selectobj.children("option").size() > 1) 
        {
            selectobj.focus();
            return;
        }
    
        var iselect = '<select name="' + objcboname + '" id="' + objcboname + '" style="border:0px;width:' + ($(rows[trow].cells[col]).width() - 2) + 'px;" onblur="registercombo(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\');" onchange="_OnCboChange (\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + objcboname + '\', \'' + colname + '\');" onselectstart="return false;"><option value=""></select>';

        rows[trow].cells[col].innerHTML = iselect;
        
        selectobj = $("select[name=" + objcboname + "]");
        
        selectobj.focus();
    }
    
    if (editstr == "checkbox")
    {
        var chkobj = $(rows[trow].cells[col]).find("input:checkbox:first");
        var valuestr = "";
        
        if (event.srcElement.tagName.toLowerCase() == "input")
        {
            if (chkobj.is(":checked") == true)
                valuestr = "T";
            else
                valuestr = "F";
        }
        else
        {
            if (chkobj.is(":checked") == false)
            {
                valuestr = "T";
                chkobj.get(0).checked = true;
            }
            else
            {
                valuestr = "F";
                chkobj.get(0).checked = false;
            }
        }
        
        tbobj.jsds[drow][colname + "_HID"] = valuestr;
            
        tbobj.jsds.checkRowStatus(drow);
        
        if (tbobj.jsds.bind_obj == true)  // 바인딩 객체와 연결되어 있다면
            _BindNameValue(tbobj.jsds.bind_objid, drow, colname, valuestr);
    }
    
    if (editstr == "button")
    {
        var objbuttonname = tbobj.id + "_button_" + row + col;
        var ibuttonarea = '<img src="/js/imgctrl/btn1.png" name="' + objbuttonname + '" style="float:right;width:23px;height:23px;"  onblur="registerbutton(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\');"  onclick="_POPUP(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\')">';
        rows[trow].cells[col].innerHTML = tbobj.jsds[drow][colname] + ibuttonarea;
        $("img[name=" + objbuttonname + "]").focus();
    }

    if (editstr == "textdate")
    {
        var objtextname = tbobj.id + "_text_" + row + col;

        var textobj = $("input[name=" + objtextname + "]");

        if (textobj.get(0) != undefined)
        {
            textobj.focus();
            return;
        }

        var itextarea = '<input type="text" name="' + objtextname + '" style="border:0px;width:' + ($(rows[trow].cells[col]).width() - 7) + 'px;height:' + ($(rows[trow].cells[col]).height() - 3) + 'px" onkeydown="keydowntext(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\')">';
        rows[trow].cells[col].innerHTML = itextarea;

        textobj = $("input[name=" + objtextname + "]");

        textobj.css("font-size", "inherit");

        if (tbobj.typeB[col] == "number")
            textobj.val(tdvalue.replace(/,/gi, ""));
        else
            textobj.val(tdvalue);

        var selected = false;

        $("input[name=" + objtextname + "]").datepicker({
            showButtonPanel: true,
            currentText: '오늘 날짜',
            closeText: '닫기',
            onSelect: function (dateText, inst)
            {
                selected = true;
                var tmpvalue = $(this).val();

                if (tmpvalue != undefined)
                {
                    $("input[name=" + objtextname + "]").val(tmpvalue);

                    //create event
                    var onTextDateChange = new Event();

                    try
                    {
                        //add handler
                        onTextDateChange.addHandler(eval(tbobj.id + "_textdatechange"));

                        //raise event
                        onTextDateChange.raise(drow, col, colname, tmpvalue);
                    }
                    catch (e)
                    {
                        //alert(e.message);
                    }
                }

                registertext(tbobj.id, row, col, colname);
            },
            onClose: function (selectedDate)
            {
                if (selected != true)
                    registertext(tbobj.id, row, col, colname);
            }

        });

        textobj.focus();
    }

    if (editstr == "textarea")
    {
        var objtextname = tbobj.id + "_text_" + row + col;

        var textobj = $("#" + objtextname);

        if (textobj.get(0) != undefined)
        {
            textobj.focus();
            return;
        }

        var itextarea = '<textarea id="' + objtextname + '" style="border:0px;width:' + ($(rows[trow].cells[col]).width()) + 'px;height:' + ($(rows[trow].cells[col]).height()) + 'px" onblur="registertextarea(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\');" onkeydown="keydowntextarea(\'' + tbobj.id + '\',' + row + ',' + col + ',\'' + colname + '\')"></textarea>';

        rows[trow].cells[col].innerHTML = itextarea;

        textobj = $("#" + objtextname);

        textobj.css("font-size", "inherit");

        if (tbobj.typeB[col] == "number")
            textobj.val(tdvalue.replace(/,/gi, ""));
        else
            textobj.val(tdvalue);

        textobj.focus();

        //$(textobj).get(0).setSelectionRange(0, $(textobj).val().length);  // 블럭
    }
}

/* 컨드롤의 텍스트 박스가 소멸 */
function registertext(tbid, row, col, colname)
{
    var trow = row;
    var drow = row + 1;
    var tbobj = eval(tbid);
    
    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;
    
    var objtextname = tbid + "_text_" + row + col;
    var textobj = $("input[name=" + objtextname + "]");
    var tmpvalue = textobj.val();

    if (tbobj.typeB[col] == "number")
        tmpvalue = ctrl_GetNumDot(tmpvalue);

    rows[trow].cells[col].innerHTML = tmpvalue;
    
    //var cname = tbobj.jsds.colname[col];
    tbobj.jsds[drow][colname + "_HID"] = tmpvalue;
    tbobj.jsds.checkRowStatus(drow);
    
    if (tbobj.jsds.bind_obj == true)  // 바인딩 객체와 연결되어 있다면
        _BindNameValue(tbobj.jsds.bind_objid, drow, colname, tmpvalue);

    //create event
    onExit = new Event();

    try
    {
        //add handler
        onExit.addHandler(eval(tbid + "_exit"));

        //raise event
        onExit.raise(drow, col, colname, tmpvalue);
    }
    catch (e) {; }
}

function keydowntext(tbid, row, col, colname)
{
    if (event.keyCode == 13 || event.keyCode == 27)  // 13:enter, 27:esc
        registertext(tbid, row, col, colname);

    var tbobj = eval(tbid);

    if (event.keyCode == 9) // tab
    {
        registertext(tbid, row, col, colname);

        var nextcol = 0;
        for (var i = col + 1; i < tbobj.editB.length; i++)
        {
            if (tbobj.editB[i] == "text")
            {
                nextcol = i;
                break;
            }
        }

        if (nextcol > 0)
        {
            var nextcolname = "";

            for (var item in tbobj.colattr)
            {
                var itemattr = tbobj.colattr[item];

                if (nextcol == tbobj.columnB[item])
                {
                    nextcolname = item;
                    break;
                }
            }

            _columnEdit(tbobj, row, nextcol, nextcolname, tbobj.editB[nextcol]);
        }
    }

    return false;
}

/* 컨드롤의 콤보 박스가 소멸 */
function registercombo(tbid, row, col, colname)
{
    var trow = row;
    var drow = row + 1;
    var tbobj = eval(tbid);

    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;
    
    var objcboname = tbid + "_combo_" + row + col;
    var selectobj = $("select[name=" + objcboname + "]");
    var tmpvalue = selectobj.children("option:selected").text();
    
    rows[trow].cells[col].innerHTML = tmpvalue;
    
    //var cname = tbobj.jsds.colname[col];
    tbobj.jsds[drow][colname + "_HID"] = tmpvalue;
    tbobj.jsds.checkRowStatus(drow);
    
    if (tbobj.jsds.bind_obj == true)  // 바인딩 객체와 연결되어 있다면
        _BindNameValue(tbobj.jsds.bind_objid, drow, colname, tmpvalue);
}

/* 컨드롤의 버튼이 소멸 */
function registerbutton(tbid, row, col, colname)
{
    var trow = row;
    var drow = row + 1;
    var tbobj = eval(tbid);

    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;
    
    //var cname = tbobj.jsds.colname[col];
    rows[trow].cells[col].innerHTML = tbobj.jsds[drow][colname];
}

/* 컨드롤의 텍스트에리어 박스가 소멸 */
function registertextarea(tbid, row, col, colname)
{
    var trow = row;
    var drow = row + 1;
    var tbobj = eval(tbid);

    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;

    var objtextname = tbid + "_text_" + row + col;
    var textobj = $("#" + objtextname);
    var tmpvalue = textobj.val();

    if (tbobj.typeB[col] == "number")
        tmpvalue = ctrl_GetNumDot(tmpvalue);

    rows[trow].cells[col].innerHTML = tmpvalue.replace(/\n/gi, "<br/>");

    //var cname = tbobj.jsds.colname[col];
    tbobj.jsds[drow][colname + "_HID"] = tmpvalue;
    tbobj.jsds.checkRowStatus(drow);

    if (tbobj.jsds.bind_obj == true)  // 바인딩 객체와 연결되어 있다면
        _BindNameValue(tbobj.jsds.bind_objid, drow, colname, tmpvalue);

    //create event
    onExit = new Event();

    try
    {
        //add handler
        onExit.addHandler(eval(tbid + "_exit"));

        //raise event
        onExit.raise(drow, col, colname, tmpvalue);
    }
    catch (e) {; }
}

function keydowntextarea(tbid, row, col, colname)
{
    if (event.keyCode == 27)  // esc
        registertextarea(tbid, row, col, colname);

    return false;
}

function _OnCboChange(tbid, row, col, objcboname, colname)
{
    var trow = row;
    var drow = row + 1;
    
    //create event
    onCboChange = new Event();

    try
    {
        //add handler
        onCboChange.addHandler(eval(tbid + "_CboChange"));

        var objcboname = tbid + "_combo_" + row + col;
        var selectobj = $("select[name=" + objcboname + "]");
        
        var tmpvalue = selectobj.val();
        var tmptext = selectobj.children("option:selected").text();
        //var cname = eval(tbid).jsds.colname[col];

        //raise event
        onCboChange.raise(drow, col, colname, tmpvalue, tmptext);
    }
    catch(e) {;}
}

function _POPUP(tbid, row, col, colname)
{
    var trow = row;
    var drow = row + 1;
    
    //create event
    onButtonClick = new Event();

    try
    {
        //add handler
        onButtonClick.addHandler(eval(tbid + "_POPUP"));

        //var cname = eval(tbid).jsds.colname[col];
        
        //raise event
        onButtonClick.raise(drow, col, colname);
    }
    catch(e) {;}
}

function selectRowColor(tbid, row)
{
    var tbobj = eval(tbid);
    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;
    
    for (var i = 0; i < rows.length; i++)
    {
        if (i == row)
            rows[i].style.background = tbobj.rowcolor;
        else
            rows[i].style.background = "#FFFFFF";
    }
}

function resetFirstRowCellsWidth(tbid)
{
    var tbobj = eval(tbid);
    var colgrp = $(tbobj).children("colgroup").find("col");
    var cells = tbobj.getElementsByTagName("TBODY")[0].rows[0].cells;
    
    for (var i = 0; i < colgrp.length; i++)
    {
        //cells[i].style.width = tbobj.colgrpB[i];
        cells[i].style.width = $(colgrp[i]).width() + "px";
        //cells[i].style.width = ($(colgrp[i]).css("width").replace(/px/gi, "") * 1 - 1) + "px";
    }
    
    tbobj.style.tableLayout = "fixed"; 
    tbobj.style.width = tbobj.colwidthtot + "px";
}

function _SetNameValue(tbid, row, colname, value) 
{
    var trow = row - 1;
    var drow = row;
    
    var tbobj = eval(tbid);
    
    var col = tbobj.columnB[colname];
    
    if (col == undefined) return;
    
    var tbody = tbobj.getElementsByTagName("TBODY")[0];
    var rows = tbody.rows;
	
    if (tbobj.editB[col] == "checkbox")
    {
        var chkobj = $(rows[trow].cells[col]).find("input:checkbox:first");
        if (value == "T")
        {
            //$(chkobj[0]).attr("checked", true);
            chkobj[0].checked = true;
        }
        else
        {
            //$(chkobj[0]).attr("checked", false);
            chkobj[0].checked = false;
        }
    }
    else
        rows[trow].cells[col].innerHTML = value;
}

function _SetNameClass(tbid, row, colname, classvalue)
{
    var trow = row - 1;

    var tbobj = eval(tbid);

    if (colname != "")
    {
        var col = tbobj.columnB[colname];

        if (col == undefined) return;

        var tbody = tbobj.getElementsByTagName("TBODY")[0];
        var rows = tbody.rows;
        rows[trow].cells[col].className = classvalue;
    }
    else
    {
        var tbody = tbobj.getElementsByTagName("TBODY")[0];
        var rows = tbody.rows;
        var tdt = rows[trow].cells;
    
        for (col = 0; col < tdt.length; col++)
            rows[trow].cells[col].className = classvalue;
    }
}

function _SetNameColor(tbid, row, colname, color)
{
    var trow = row - 1;

    var tbobj = eval(tbid);

    if (colname != "")
    {
        var col = tbobj.columnB[colname];

        if (col == undefined) return;

        var tbody = tbobj.getElementsByTagName("TBODY")[0];
        var rows = tbody.rows;
        rows[trow].cells[col].style.backgroundColor = color;
    }
    else
    {
        var tbody = tbobj.getElementsByTagName("TBODY")[0];
        var rows = tbody.rows;
        var tdt = rows[trow].cells;

        for (col = 0; col < tdt.length; col++)
            rows[trow].cells[col].style.backgroundColor = color;
    }
}

function _AddTr(tbid, opt)
{
    var tbobj = eval(tbid);
    var tbody = tbobj.getElementsByTagName("TBODY")[0];
    
    row = document.createElement("TR");

    var col;
    for (var item in tbobj.colattr)
    {
        var itemattr = tbobj.colattr[item];
        //if (itemattr.onclick == undefined) continue;
	    
        col = tbobj.columnB[item];

        var td1 = document.createElement("TD");

        td1.style.display = tbobj.displayB[col];
        
        if (tbobj.classB[col] != "")
            td1.className = tbobj.classB[col];
	
        if (tbobj.rowheight != "")
            td1.style.height = tbobj.rowheight;
        else
            td1.style.height = "20px";  // 디폴트 높이

        var cname = item;

        if (tbobj.editB[col] == "checkbox")
        {
            var objcheckname = tbobj.id + "_checkbox_" + tbody.rows.length + "_" + col;
            var icheckarea = '<input type="checkbox" id="' + objcheckname + '" />';
            td1.innerHTML = icheckarea;
        }

        //td1.onclick = new Function("_Click('" + tbobj.id + "'," + (tbody.rows.length) + "," + col + ",'" + cname + "')");
        if (tbobj.getElementsByTagName("THEAD")[0].rows.length > 1)  // 헤더2단
            td1.onclick = new Function("_Click('" + tbobj.id + "', (this.parentNode.rowIndex-2)," + col + ",'" + cname + "')");
        else
            td1.onclick = new Function("_Click('" + tbobj.id + "', (this.parentNode.rowIndex-1)," + col + ",'" + cname + "')");

        if (tbobj.onclickB[col] == true)
            td1.style.cursor = "pointer";

        row.appendChild(td1);
        
        if (col == 0 && opt != "binding")
        {
            td1.style.backgroundImage = "url('/js/imgctrl/blt_plus.png')";
            td1.style.backgroundRepeat = "no-repeat";
        }
    }
    
    tbody.appendChild(row);
    
    if (tbobj.fixheader == false) //헤더 고정이 아닌 경우
    {
        var wrapper = tbobj.parentNode;
        //wrapper.style.height = ($(tbobj).height()-1) + "px";
    }
    
    if (opt != "binding")
    {
        selectRowColor(tbobj.id, tbody.rows.length-1);
    
        // 맨 마지막 라인이 올라오도록 스크롤 조정
        tbobj = eval(tbid);
        tbobj.parentNode.scrollTop = tbobj.scrollHeight;
        
        $("img[name*='_button_']").remove(); // 생성된 버튼이 있었다면 삭제
    }
    
    // table의 width 값을 재지정해야하는 경우 첫번 째 로우에서 한번 더 해준다. 
    if (tbobj.tbWidthReset_flag == false && tbody.rows.length == 1)
    {
        resetFirstRowCellsWidth(tbobj.id);
    }
}

function _InsertTr(tbid, row, opt)
{
    var trow = row;
    var drow = row + 1;

    var tbobj = eval(tbid);

    //var oRow = tbobj.insertRow(trow);
    var oRow = tbobj.getElementsByTagName("TBODY")[0].insertRow(trow-1);

    var tbody = tbobj.getElementsByTagName("TBODY")[0];

    // 기존에 만들어져 있던 체크박스의 아이디를 변경
    $("input[id^=" + tbobj.id + "_checkbox_]").each(function (i)
    {
        var idxb = this.id.split('_');
        var ridx = this.id.split('_')[idxb.length-2];
        var cidx = this.id.split('_')[idxb.length-1];

        if (ridx < trow)
            return;

        this.id = tbobj.id + "_checkbox_" + (ridx + 1) + "_" + cidx;
    });


    var cidx = 0;
    var col;
    for (var item in tbobj.colattr)
    {
        var itemattr = tbobj.colattr[item];
        //if (itemattr.onclick == undefined) continue;

        col = tbobj.columnB[item];

        var td1 = oRow.insertCell(cidx);

        td1.style.display = tbobj.displayB[col];

        if (tbobj.classB[col] != "")
            td1.className = tbobj.classB[col];

        if (tbobj.rowheight != "")
            td1.style.height = tbobj.rowheight;
        else
            td1.style.height = "20px";  // 디폴트 높이

        var cname = item;

        if (tbobj.editB[col] == "checkbox")
        {
            var objcheckname = tbobj.id + "_checkbox_" + row + "_" + col;
            var icheckarea = '<input type="checkbox" id="' + objcheckname + '" />';
            td1.innerHTML = icheckarea;
        }

        if (tbobj.getElementsByTagName("THEAD")[0].rows.length > 1)  // 헤더2단
            td1.onclick = new Function("_Click('" + tbobj.id + "', (this.parentNode.rowIndex-2)," + col + ",'" + cname + "')");
        else
            td1.onclick = new Function("_Click('" + tbobj.id + "', (this.parentNode.rowIndex-1)," + col + ",'" + cname + "')");

        if (tbobj.onclickB[col] == true)
            td1.style.cursor = "pointer";

        if (col == 0 && opt != "binding")
        {
            td1.style.backgroundImage = "url('/js/imgctrl/blt_plus.png')";
            td1.style.backgroundRepeat = "no-repeat";
        }

        cidx++;
    }

    if (tbobj.fixheader == false) //헤더 고정이 아닌 경우
    {
        var wrapper = tbobj.parentNode;
        //wrapper.style.height = ($(tbobj).height()-1) + "px";
    }

    if (opt != "binding")
    {
        selectRowColor(tbobj.id, trow - 1);

        if (trow == tbody.rows.length - 1)
        {
            // 맨 마지막 라인이 올라오도록 스크롤 조정
            tbobj = eval(tbid);
            tbobj.parentNode.scrollTop = tbobj.scrollHeight;
        }

        $("img[name*='_button_']").remove(); // 생성된 버튼이 있었다면 삭제
    }

    // table의 width 값을 재지정해야하는 경우 첫번 째 로우에서 한번 더 해준다. 
    if (tbobj.tbWidthReset_flag == false && tbody.rows.length == 1)
    {
        resetFirstRowCellsWidth(tbobj.id);
    }
}

function _DelTr(tbid, row) 
{
    var trow = row - 1;
    var drow = row;
    var tbobj = eval(tbid);
    var tbody = tbobj.getElementsByTagName("TBODY")[0];
    var rows = tbody.rows;

    var td1 = rows[trow].cells;
    for (j = td1.length-1; j >= 0; j--)
        rows[trow].removeChild(td1[j]);

    tbody.removeChild(rows[trow]);
    
    $("img[name*='_button_']").remove(); // 생성된 버튼이 있었다면 삭제

    if (tbobj.jsds.RowPosition > rows.length)
        selectRowColor(tbid, trow - 1);
    else
        selectRowColor(tbid, trow);
}

function _ClearData(tbid)
{
    var tbobj = eval(tbid);
    var tbody = tbobj.getElementsByTagName("TBODY")[0];
    
    var rows = tbody.rows;

    tbody.style.display = "none;";

    tbody.innerHTML = "";
    /*
    for (i = rows.length -1; i >= 0; i--)
    {
        var td1 = rows[i].cells;
        for (j = td1.length-1; j >= 0 ; j--)
            rows[i].removeChild(td1[j]);

        tbody.removeChild(rows[i]);
    }
    */

    tbody.style.display = "";
}

function _CancelTr(tbid, row)
{
    var trow = row - 1;
    var drow = row;
    var tbobj = eval(tbid);

    var i, j;
    var tbody = tbobj.getElementsByTagName("TBODY")[0];
    var rows = tbody.rows;

    var tdt = rows[trow].cells;
    
    if (tbobj.jsds[drow].status == "I")
    {
        for (j = tdt.length-1; j >= 0; j--)
            rows[trow].removeChild(tdt[j]);

        tbody.removeChild(rows[trow]);
    }
    else if (tbobj.jsds[drow].status == "U" || tbobj.jsds[drow].status == "D")
    {
        for (col = 0; col < tdt.length; col++)
        {
            //var cname = tbobj.jsds.colname[col];
            var cname = "";

            for (var key in tbobj.columnB)
            {
                if (tbobj.columnB[key] == col)
                {
                    cname = key;
                    break;
                }
            }

            if (cname == "") return;

            if (tbobj.editB[col] == "checkbox")
            {
                var chkobj = $(rows[trow].cells[col]).find("input:checkbox:first");
                if (tbobj.jsds.colname[col] == "T")
                {
                    //chkobj.attr("checked", true);
                    chkobj[0].checked = true;
                }
                else
                {
                    //chkobj.attr("checked", false);
                    chkobj[0].checked = false;
                }
            }
            else
            {
                if (tbobj.jsds.tbOld[drow][cname] != undefined)
                    tdt[col].innerHTML = tbobj.jsds.tbOld[drow][cname];
            }
        }
    }
    
    $("img[name*='_button_']").remove(); // 생성된 버튼이 있었다면 삭제
    
    //if (tbobj.jsds.RowPosition > rows.length)
        selectRowColor(tbid, trow-1);
}

function createLoadingBar (tbid)
{
    var div_loadingBar = document.createElement("div");

    div_loadingBar.id = "div_loading_" + tbid;
    div_loadingBar.style.position = "absolute";
    div_loadingBar.style.display = "none";
    div_loadingBar.style.width = "48px";
    div_loadingBar.style.height = "48px";
    div_loadingBar.innerHTML = '<img src="/js/imgctrl/loading.gif">';
    div_loadingBar.style.zIndex = "999";
    
    document.body.appendChild(div_loadingBar);
}

function createLoadingBarBody()
{
    var loadingHTML = '<div id="div_loading_body" style="position:absolute;width:48px;height:48px; display:none;"><img src="/js/imgctrl/loading.gif"></div>';

    document.writeln (loadingHTML);
}

function _LoadingBar(tbid, opt)
{
    var div_loadingBar = document.getElementById("div_loading_" + tbid);
    
    if (div_loadingBar == undefined)
    {
        createLoadingBar (tbid);
        div_loadingBar = eval("div_loading_" + tbid);
    }
    
    if (opt == "ON")
    {
        var wrapper = document.getElementById("wrapper_" + tbid);
        
        if (wrapper == undefined)  // wrapper 를 만들지 않았던 경우라면
        {
            /// 테이블에 div 입히기 start
            var tbobj = document.getElementById(tbid);
            var parent = tbobj.parentNode;
            wrapper = document.createElement("div");

            parent.replaceChild(wrapper, tbobj);   // wrapper 를 child 로 세팅(tbobj 대신)
            wrapper.appendChild(tbobj);            // element 를 wrapper 의 child 로 세팅 

            wrapper.id = "wrapper_" + tbobj.id;
            wrapper.style.width = "auto";
            wrapper.style.height = "auto";
        }

        var tbtop = $(wrapper).offset().top;
        var tbleft = $(wrapper).offset().left;
        var tbwidth = $(wrapper).width();
        var tbheight = $(wrapper).height();
        
        if (tbheight > 1000) tbheight = 500;

        div_loadingBar.style.top = (tbtop + ((tbheight/2)-24)) + "px";
        div_loadingBar.style.left = (tbleft + ((tbwidth/2)-24)) + "px";

        div_loadingBar.style.display = "";
    } 
    else
        div_loadingBar.style.display = "none";
}

function _LoadingBarS(tbid, opt)
{
    var div_loadingBar = eval("div_loading_body");

    if (opt == "ON")
    {
        var tbleft = $("#" + tbid).offset().left;
        var tbwidth = $("#" + tbid).width();

        div_loadingBar.style.top = (($(window).height() / 2) - 24) + "px";
        div_loadingBar.style.left = (tbleft + ((tbwidth / 2) - 24)) + "px";

        div_loadingBar.style.display = "";
    }
    else
        div_loadingBar.style.display = "none";
}

function _LoadingBarBody(opt)
{
    var div_loadingBar = eval("div_loading_body");

    if (opt == "ON")
    {
        div_loadingBar.style.top = (($(window).height() / 2) - 24) + "px";
        div_loadingBar.style.left = (($(window).width() / 2) - 24) + "px";

        div_loadingBar.style.display = "";
    }
    else
        div_loadingBar.style.display = "none";
}

function _bindDsToTable(tbid, jsds)
{
    var tbobj = eval(tbid);

    _ClearData(tbobj.id);

    jsds.bind_tab = true;
    jsds.bind_tabid = tbobj.id;
    tbobj.jsds = jsds;

    var col;
    for (var item in tbobj.colattr)
    {
        var itemattr = tbobj.colattr[item];
        col = tbobj.columnB[item];

        if (tbobj.typeB[col] == "number")  // 테이블 칼럼타입이 number로 되어 있으면 데이터셋의 칼럼타입도 맞추어 준다.
        {
            for (var k = 0; k < jsds.colcnt; k++)
            {
                if (item == jsds.colname[k])
                {
                    jsds.coltype[k] = 5;  // TB_NUMBER
                    break;
                }
            }
        }
    }

    if (jsds.length > 0)
        tbobj.jsds.RowPosition = 0;

    var colgroupHTML = tbobj.getElementsByTagName("COLGROUP")[0].outerHTML;
    var theadHTML = tbobj.getElementsByTagName("THEAD")[0].outerHTML;
    var tbodyHTML = "";
    var i, j;

    var addHTML = new Array();
    var onerow = '';

    tbodyHTML = '<tbody>';

    for (i = 1; i <= jsds.length; i++)
    {
        onerow = '<tr>';

        var col;
        for (var item in tbobj.colattr)
        {
            var itemattr = tbobj.colattr[item];
            col = tbobj.columnB[item];

            var tdHTML = '';
            var classstr = '';
            var stylestr = '';
            var funcstr = '';

            if (tbobj.classB[col] != "")
                classstr = 'class="' + tbobj.classB[col] + '"';

            stylestr = 'style="';
            if (tbobj.rowheight != "")
                stylestr += 'height:' + tbobj.rowheight + ';';
            else
                stylestr += 'height:20px;';  // 디폴트 높이

            if (tbobj.displayB[col] != "")
                stylestr += 'display:' + tbobj.displayB[col] + ';';

            if (tbobj.onclickB[col] == true)
                stylestr += 'cursor:pointer;';

            stylestr += '"';

            var cname = item;

            if (tbobj.getElementsByTagName("THEAD")[0].rows.length > 1)  // 헤더2단
                funcstr = 'onclick="_Click(\'' + tbobj.id + '\', (this.parentNode.rowIndex-2),' + col + ',\'' + cname + '\')"';
            else
                funcstr = 'onclick="_Click(\'' + tbobj.id + '\', (this.parentNode.rowIndex-1),' + col + ',\'' + cname + '\')"';

            tdHTML = '<td ' + classstr + ' ' + stylestr + ' ' + funcstr + '>';

            if (item == "ROWNO")
            {
                if (jsds[i][cname + "_HID"] == "")
                {
                    jsds[i][cname + "_HID"] = i;
                    tdHTML += i;
                }
                else
                    tdHTML += jsds[i][cname];
            }
            else
            {
                if (tbobj.editB[col] == "checkbox")
                {
                    var objcheckname = tbobj.id + "_checkbox_" + (i - 1) + "_" + col;
                    var checkedstr = (jsds[i][cname] == "T" ? 'checked' : '');
                    var icheckarea = '<input type="checkbox" id="' + objcheckname + '" ' + checkedstr + ' />';
                    tdHTML += icheckarea;
                }
                else
                {
                    if (jsds[i][cname] == undefined)
                        tdHTML += "";
                    else
                    {
                        if (tbobj.editB[col] == "textarea")
                            tdHTML += jsds[i][cname].replace(/\n/gi, "<br/>");
                        else
                            tdHTML += jsds[i][cname];
                    }
                }
            }

            tdHTML += '</td>';

            onerow += tdHTML;
        }

        onerow += '</tr>';

        addHTML[i - 1] = onerow;
    }

    tbodyHTML += addHTML.join('');
    tbodyHTML += '</tbody>';

    tbobj.innerHTML = colgroupHTML + theadHTML + tbodyHTML;

    if (jsds.length > 0)
    {
        // table의 width 값을 재지정해야하는 경우 첫번 째 로우에서 한번 더 해준다. 
        if (tbobj.tbWidthReset_flag == false)
        {
            resetFirstRowCellsWidth(tbobj.id);
        }

        tbobj.jsds.RowPosition = 0;
    }
    /*
    var tbobj = eval(tbid);

    _ClearData(tbobj.id);

    jsds.bind_tab = true;
    jsds.bind_tabid = tbobj.id;
    tbobj.jsds = jsds;

    if (jsds.length > 0)
        tbobj.jsds.RowPosition = 0;

    var tbody = tbobj.getElementsByTagName("TBODY")[0];
    var i, j;

    tbody.style.display = "none";
    
    for (i = 1; i <= jsds.length; i++)
    {
        _AddTr(tbobj.id, "binding");

        for (j = 0; j < jsds.colname.length; j++)
        {
            var cname = jsds.colname[j];

            if (cname == "ROWNO")
            {
                jsds[i][cname + "_HID"] = i;
                _SetNameValue(tbobj.id, i, cname, i);
            }
            else
                _SetNameValue(tbobj.id, i, cname, jsds[i][cname]);
        }
    }
    
    tbody.style.display = "";

    if (jsds.length > 0)
    {
        tbobj.jsds.RowPosition = 0;
    }
    */
}

function getColumnName(tbid, col)
{
    var tbobj = eval(tbid);

    for (var item in tbobj.colattr)
    {
        var idx = tbobj.columnB[item];
        if (idx == col)
        {
            return item;
        }
    }
    
    return "";
}

function _setRowStatus(tbid, row, statusstr)
{
    var trow = row-1;
    var drow = row;    
    var tbobj = eval(tbid);
    var rows = tbobj.getElementsByTagName("TBODY")[0].rows;
    var cells = rows[trow].cells;
    
    if (statusstr == "I")
    {
        cells[0].style.backgroundImage = "url('/js/imgctrl/blt_plus.png')";
        cells[0].style.backgroundRepeat = "no-repeat";
    }
    else
    {
        cells[0].style.backgroundImage = "";
        cells[0].style.backgroundRepeat = "";
    }
    
    tbobj.jsds.setRowStatus(drow, statusstr, "already_tr_setrowstatus");
}

function ctrl_GetNumDot(val)
{
    val = String(val);
    var retval = "";
    var minusgb = false;
    val = val.replaceAll(",", "");

    if (val.length > 0 && val.substring(0, 1) == "-")
    {
        val = val.replaceAll("-", "");
        minusgb = true;
    }

    if (val.length > 3)
    {
        for (var i = val.length - 1; i >= 0; i--)
        {
            retval = val.charAt(i) + retval;
            if (i != 0 && i % 3 == val.length % 3)
            {
                retval = "," + retval;
            }
        }
        //return retval;

        val = retval;
    }

    if (minusgb == true)
        val = "-" + val;

    return val;
}