function addEvent(element, event, fn) 
{
    if (element.addEventListener)
        element.addEventListener(event, fn, false);
    else if (element.attachEvent)
        element.attachEvent('on' + event, fn);
}

function gf_loanbook(bb_branchidx, memberidx, bb_barcode, callbackfunction)
{
    if (bb_barcode == "")
    {
		alert("바코드 번호를 입력하여 주시기 바랍니다.");
	    return false;
    }
    /*
    if (memberidx == "" || memberidx == "0") {
        jAlert("도서를 대출할 회원 검색을 먼저 해주시기 바랍니다.", "확인");
        return false;
    }
    */

    var date = new Date();
    var time = date.getTime();

    // 대출인지 반납인지 체크
    $.get("/job/loanbook_check_S01.aspx?pversion=" + time, { bb_branchidx: bb_branchidx, bb_barcode: bb_barcode, memberidx: memberidx },
        function(data)
        {
            var RLTp = eval(data);
            
			if (RLTp[0].STATUS == "RENT")  // 대출
			{
			    if (memberidx == "" || memberidx == "0") {
			        jAlert("도서를 대출할 회원 검색을 먼저 해주시기 바랍니다.", "확인");
			        return false;
			    }
        	    // 대출 가능한지 체크
			    $.get("/job/loanbook_check_S02.aspx?pversion=" + time, { bb_branchidx: bb_branchidx, memberidx: memberidx, bb_barcode: bb_barcode },
                    function(data)
                    {
                        var RLTp = eval(data);
                        
        				if (RLTp[0].STATUS == "OK")
        				{
        				    ;
        				}
        				else if (RLTp[0].STATUS == "OTHER")
        				{
        					if (!confirm(RLTp[0].DESCRIPTION + " 타인의 수업도서 입니다. \n그래도 대출 하시겠습니까?"))
        					{
        					    return false;
        					}
        				}
        				else if (RLTp[0].STATUS == "EXCEED4")
        				{
        				    jAlert("대출도서 4권을 초과하였습니다. 반납체크 바랍니다.", "확인", function ()
        				    {
        				        callbackfunction(bb_branchidx, memberidx, bb_barcode, "RENT");
        				    })
        					return false;
        				}
        				else
        				{
        				    jAlert("대출 도서 체크에 실패하였습니다.-[" + RLTp[0].DESCRIPTION + "]", "확인");
        				    return false;
        				}
        
        				callbackfunction(bb_branchidx, memberidx, bb_barcode, "RENT");
                    });
            }
            else if (RLTp[0].STATUS == "RETURN")  // 반납
            {
                callbackfunction(bb_branchidx, memberidx, bb_barcode, "RETURN");
            }
            else if (RLTp[0].STATUS == "NOBOOK")  // 도서 없음
            {
                jAlert(RLTp[0].DESCRIPTION, "확인");
			    return false;
            }
            else if (RLTp[0].STATUS == "DUP")  // 도서 없음
            {
                jAlert("이미 다름 사람이 대출된 도서입니다. 확인하여 주십시요", "확인");
                return false;
            }
            else
            {
                jAlert("대출 도서 체크에 실패하였습니다.-[" + RLTp[0].DESCRIPTION + "]", "확인");
			    return false;
            }
        });
        
    return true;
}

/* 모바일 여부 체크 */
function gf_IsMobileCheckAndMove(hostname, pagename, m_pagename)
{
    if (screen.width <= 720)  // width 720 이하는 모바일로 간주
    {
        if (m_pagename == "")
            location.href = "/m/m_index.aspx";
        else
            location.href = m_pagename;
    }
    else
    {
        // 갤럭시 노트3 에서는 세로 screen.width가 1080 으로 나오는 경우도 있어서 한번더 체크
        var isM = isMobileDevice();
        var isT = isTabletDevice();
        
        if (isM == true && isT == false)
        {
            if (m_pagename == "")
                location.href = "/m/m_index.aspx";
            else
                location.href = m_pagename;
        }
    }
}

// 기기 체크
// isTablet()과 isMobile()은 HP와 SRP에서 사용 중
function isMobileDevice() 
{
	var phoneArray = new Array('samsung-', 'sch-', 'shw-', 'sph-', 'sgh-', 'lg-', 'canu', 'im-', 'ev-', 'iphone', 'nokia', 'blackberry', 'lgtelecom', 'natebrowser', 'sonyericsson', 'mobile', 'android', 'ipad');
	for (i = 0; i < phoneArray.length; i++) {
		if (navigator.userAgent.toLowerCase().indexOf(phoneArray[i]) > -1) {
			return true;
		}
	}
	return false;
}
function isTabletDevice() 
{
	if (!isMobileDevice()) {
		return false;
	}
	// 태블릿검사
	if (navigator.userAgent.toLowerCase().indexOf('ipad') > -1 ||
		(navigator.userAgent.toLowerCase().indexOf('android') > -1 && navigator.userAgent.toLowerCase().indexOf('mobile') == -1)) {
		return true;
	}
	/*
	// 갤럭시 탭만을 위한 리다이렉트. Mobile 이라는 단어가 안들어오게 되면 지우셔도 됨
	var galaxyTabModel = new Array('shw-');
	for (i = 0; i < galaxyTabModel.length; i++) {
		if (navigator.userAgent.toLowerCase().indexOf(galaxyTabModel[i]) > -1) {
			return true;
		}
	}
	*/
	return false;
}
 
function isMobileDevice2()
{
    var filter = "win16|win32|win64|mac|macintel";
    var vWebType = "";
    if (navigator.platform)
    {
        if (filter.indexOf(navigator.platform.toLowerCase()) < 0)
        {
            return true; //모바일
        } else
        {
            return false; // PC
        }
    }
}

function isIE()
{
    return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
}

/*
숫자 세자리 콤마 리턴
*/
function gf_GetNumDot(val)
{	
    val = String(val);
    var retval = "";
    var minusgb = false;

    val = val.replaceAll(",", "");

    var m_val = (val.indexOf(".") >= 0 ? "." + val.split('.')[1] : "");
    val = (val.indexOf(".") >= 0 ? val.split('.')[0] : val);

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

        val = retval + m_val;
    }

    if (minusgb == true)
        val = "-" + val + m_val;

    return val;
}

// 한글 2자리로 Count
function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

// 개선된 byte 계산
function n_byteCount(s) {
    return (function (s, b, i, c) {
        for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
        return b
    })(s)
}
String.prototype.trim = function()
{
  return this.replace(/(^\s*)|(\s*$)/gi, "");
}

String.prototype.replaceAll = function(str1, str2)
{
  var temp_str = this.trim();
  temp_str = temp_str.replace(eval("/" + str1 + "/gi"), str2);
  return temp_str;
}

//str문자열의 s부터 cnt의 갯수만큼 return
function Mid(str, s, cnt)
{
    s = s - 1;
    return (str.substring(s, s + cnt));
}

function LenB(instr)
{
    var byteIs = 0;
    for (i = 0; i < instr.length; i++)
    {
        tmp = instr.charAt(i);
        escChar = escape(tmp);
        if (escChar == '%0D')
            ;
        else if (escChar.length > 4)
            byteIs += 2;
        else
            byteIs += 1;
    }

    return byteIs;
}

function onlyNumber()
{

    var e1 = event.srcElement;
    var num ="0123456789";
    event.returnValue = true;

    for (var i=0;i<e1.value.length;i++){
        if(-1 == num.indexOf(e1.value.charAt(i)))
        event.returnValue = false;
    }
    if (!event.returnValue)
      e1.value =  e1.value.replace(/[^0-9]/g, '');
      
}

/*
* 날짜포맷에 맞는지 검사
*/
function gf_isDateFormat(d) 
{
    var df = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
    return d.match(df);
}

/*
* 윤년여부 검사
*/
function gf_isLeaf(year) 
{
    var leaf = false;
    
    if (year % 4 == 0) 
    {
        leaf = true;
        
        if (year % 100 == 0)
            leaf = false;
        
        if (year % 400 == 0)
            leaf = true;
    }
    
    return leaf;
}

/*
* 날짜가 유효한지 검사
*/
function gf_isValidDate(d)
{
    // 포맷에 안맞으면 false리턴
    if (!gf_isDateFormat(d)) 
    {
        return false;
    }
    
    var month_day = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    var dateToken = d.split('-');
    var year = Number(dateToken[0]);
    var month = Number(dateToken[1]);
    var day = Number(dateToken[2]);
    
    // 날짜가 0이면 false
    if (day == 0) 
    {
        return false;
    }
    
    var isValid = false;
    
    // 윤년일때
    if (gf_isLeaf(year)) 
    {
        if(month == 2) 
        {
            if (day <= month_day[month-1] + 1)
                isValid = true;
        } 
        else 
        {
            if (day <= month_day[month-1])
                isValid = true;
        }
    } 
    else 
    {
        if (day <= month_day[month-1])
            isValid = true;
    }
    
    return isValid;
}

function setCookieValue(name, value, expires, path, domain, secure)
{
	var curCookie = name + "=" + escape(value) +
	((expires) ? "; expires=" + expires.toGMTString() : "") +
	((path) ? "; path=" + path : "") +
	((domain) ? "; domain=" + domain : "") +
	((secure) ? "; secure" : "");
	document.cookie = curCookie;
}


function getCookieValue (name)
{
	var nameOfCookie = name + "=";
	var x = 0;
	while ( x <= document.cookie.length )
	{
		var y = (x+nameOfCookie.length);
		if ( document.cookie.substring( x, y ) == nameOfCookie ) {
			if ( (endOfCookie=document.cookie.indexOf( ";", y )) == -1 )
				endOfCookie = document.cookie.length;
			return unescape( document.cookie.substring( y, endOfCookie ) );
		}
		x = document.cookie.indexOf( " ", x ) + 1;
		if ( x == 0 )
			break;
	}
	return "";
}

function fn_IsMobile()
{
    var ret = false;

    if (screen.width <= 720)  // width 720 이하는 모바일로 간주
    {
        ret = true;
    }
    else
    {
        // 갤럭시 노트3 에서는 세로 screen.width가 1080 으로 나오는 경우도 있어서 한번더 체크
        var isM = isMobileDevice();
        var isT = isTabletDevice();

        if (isM == true && isT == false)
            ret = true;
    }

    return ret;
}

function fn_get_prev_month (in_month)
{
    var yyyy = in_month.substring(0, 4) * 1;
    var mm = in_month.substring(5, 7) * 1
    mm--;
    if (mm < 1) {
        mm = 12;
        yyyy--;
    }
    var yyyymm = yyyy + "-" + (mm <= 9 ? "0" + mm : mm);
    return yyyymm;
}
// 전월로 이동
function fn_month_move_left(selectid, callbackfunction)
{
    var index = $("#" + selectid + " option").index($("#" + selectid + " option:selected"));
    index--;

    if (index >= 0)
    {
        var selobj = $("#" + selectid).get(0);
        selobj.selectedIndex = index;
    }
    else
    {
        var yyyy = $("#" + selectid).val().substring(0, 4) * 1;
        var mm = $("#" + selectid).val().substring(5, 7) * 1;

        mm--;

        if (mm < 1)
        {
            mm = 12;
            yyyy--;
        }

        var yyyymm = yyyy + "-" + (mm <= 9 ? "0" + mm : mm);

        var selobj = $("#" + selectid).get(0);
        var AddOption = new Option(yyyymm, yyyymm);

        //selobj.options.insertBefore(AddOption, selobj.options[0]);
        selobj.insertBefore(AddOption, selobj.options[0]);

        selobj.selectedIndex = 0;
    }

    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}

// 익월로 이동
function fn_month_move_right(selectid, callbackfunction)
{
    var index = $("#" + selectid + " option").index($("#" + selectid + " option:selected"));
    index++;

    if (index < $("#" + selectid + " option").size())
    {
        var selobj = $("#" + selectid).get(0);
        selobj.selectedIndex = index;
    }
    else
    {
        var yyyy = $("#" + selectid).val().substring(0, 4) * 1;
        var mm = $("#" + selectid).val().substring(5, 7) * 1;
        mm++;

        if (mm > 12)
        {
            mm = 1;
            yyyy++;
        }

        var yyyymm = yyyy + "-" + (mm <= 9 ? "0" + mm : mm);

        var selobj = $("#" + selectid).get(0);

        var AddOption = new Option(yyyymm, yyyymm);
        selobj[selobj.options.length] = AddOption;

        selobj.selectedIndex = selobj.selectedIndex + 1;
    }

    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}

function fn_month_plus(yyyymm)
{
    var yyyy = yyyymm.substring(0, 4) * 1;
    var mm = yyyymm.substring(5, 7) * 1;
    mm++;

    if (mm > 12)
    {
        mm = 1;
        yyyy++;
    }

    return (yyyy + "-" + (mm <= 9 ? "0" + mm : mm));
}

function fn_month_minus(yyyymm)
{
    var yyyy = yyyymm.substring(0, 4) * 1;
    var mm = yyyymm.substring(5, 7) * 1;
    mm--;

    if (mm < 1)
    {
        mm = 12;
        yyyy--;
    }

    return (yyyy + "-" + (mm <= 9 ? "0" + mm : mm));
}

// 전주로 이동
function fn_week_move_left(selectid, callbackfunction)
{
    var index = $("#" + selectid + " option").index($("#" + selectid + " option:selected"));
    index--;

    if (index >= 0)
    {
        var selobj = $("#" + selectid).get(0);
        selobj.selectedIndex = index;
    }
    else
    {
        var weekfirstday = $("#" + selectid).val();

        // 주 조회
        var dsWK = new jsds("dsWK", false);

        var progid = "/job/week_plus_S01.aspx";
        var argString = "in_weekfirstday=" + weekfirstday + ",in_plus=-1";

        dsWK.Reset(progid, argString);

        var selobj = $("#" + selectid).get(0);
        var AddOption = new Option(dsWK[1]["WEEK_NAME"], dsWK[1]["W_WEEK_START"]);
        AddOption.setAttribute("tag", dsWK[1]["CURRI_MONTH"] + "|" + dsWK[1]["WEEKCOUNT"]);

        selobj.options.insertBefore(AddOption, selobj.options[0]);
        selobj.selectedIndex = 0;
    }

    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}

// 다음주로 이동
function fn_week_move_right(selectid, callbackfunction)
{
    var index = $("#" + selectid + " option").index($("#" + selectid + " option:selected"));
    index++;

    if (index < $("#" + selectid + " option").size())
    {
        var selobj = $("#" + selectid).get(0);
        selobj.selectedIndex = index;
    }
    else
    {
        var weekfirstday = $("#" + selectid).val();

        // 주 조회
        var dsWK = new jsds("dsWK", false);

        var progid = "/job/week_plus_S01.aspx";
        var argString = "in_weekfirstday=" + weekfirstday + ",in_plus=1";

        dsWK.Reset(progid, argString);

        var selobj = $("#" + selectid).get(0);

        var AddOption = new Option(dsWK[1]["WEEK_NAME"], dsWK[1]["W_WEEK_START"]);
        AddOption.setAttribute("tag", dsWK[1]["CURRI_MONTH"] + "|" + dsWK[1]["WEEKCOUNT"]);
        selobj[selobj.options.length] = AddOption;

        selobj.selectedIndex = selobj.selectedIndex + 1;
    }

    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}

// 전년도로 이동
function fn_year_move_left(selectid, callbackfunction)
{
    var index = $("#" + selectid + " option").index($("#" + selectid + " option:selected"));
    index--;

    if (index >= 0)
    {
        var selobj = $("#" + selectid).get(0);
        selobj.selectedIndex = index;
    }
    else
    {
        var yyyy = $("#" + selectid).val() * 1 - 1;

        var selobj = $("#" + selectid).get(0);
        var AddOption = new Option(yyyy, yyyy);

        selobj.options.insertBefore(AddOption, selobj.options[0]);
        selobj.selectedIndex = 0;
    }

    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}

// 다음년도로 이동
function fn_year_move_right(selectid, callbackfunction)
{
    var index = $("#" + selectid + " option").index($("#" + selectid + " option:selected"));
    index++;

    if (index < $("#" + selectid + " option").size())
    {
        var selobj = $("#" + selectid).get(0);
        selobj.selectedIndex = index;
    }
    else
    {
        var yyyy = $("#" + selectid).val() * 1 + 1;

        var selobj = $("#" + selectid).get(0);
        var AddOption = new Option(yyyy, yyyy);

        selobj[selobj.options.length] = AddOption;
        selobj.selectedIndex = selobj.selectedIndex + 1;
    }

    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}

// 전일로 이동
function fn_day_move_left(selectid, callbackfunction)
{
    var s = $("#" + selectid).val();

    $("#" + selectid).val(getaddDt(s, 1, "m"));
    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}
// 다음 일로 이동
function fn_day_move_right(selectid, callbackfunction)
{
    var s = $("#" + selectid).val();

    $("#" + selectid).val(getaddDt(s, 1, "p"));
    if (typeof (callbackfunction) == "function")
        callbackfunction();

    if (typeof (callbackfunction) == "string")
        eval(callbackfunction);
}
function getaddDt(s, i, gb)
{
    var newDt = new Date(s);
    if (gb == "p")
        newDt.setDate(newDt.getDate() + i);
    else
        newDt.setDate(newDt.getDate() - i);
    return converDateString(newDt);
}
function converDateString(dt)
{
    return dt.getFullYear() + "-" + addZero(eval(dt.getMonth() + 1)) + "-" + addZero(dt.getDate());
}
function addZero(i)
{
    var rtn = i + 100;
    return rtn.toString().substring(1, 3);
}
function fn_AddDays(date, days)
{
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return dateToString(result, "-");
}

function dateToString(date, formatchar)
{
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();
    return yyyy + formatchar + (mm[1] ? mm : "0" + mm[0]) + formatchar + (dd[1] ? dd : "0" + dd[0]); // padding
}

function fn_yoilname(yoil, opt)
{
    var yoilname = "";
    switch (yoil)
    {
        case "1":
            yoilname = "일" + (opt == "FULL" ? "요일" : "");
            break;
        case "2":
            yoilname = "월" + (opt == "FULL" ? "요일" : "");
            break;
        case "3":
            yoilname = "화" + (opt == "FULL" ? "요일" : "");
            break;
        case "4":
            yoilname = "수" + (opt == "FULL" ? "요일" : "");
            break;
        case "5":
            yoilname = "목" + (opt == "FULL" ? "요일" : "");
            break;
        case "6":
            yoilname = "금" + (opt == "FULL" ? "요일" : "");
            break;
        case "7":
            yoilname = "토" + (opt == "FULL" ? "요일" : "");
            break;
        default:
            break;
    }

    return yoilname;
}

function fn_day_yoilname(dateStr, opt)
{
    var week = new Array("일", "월", "화", "수", "목", "금", "토");
    var today = new Date(dateStr).getDay();
    var todayLabel = week[today];

    todayLabel += (opt == "FULL" ? "요일" : "");

    return todayLabel;
}

(function ()
{
    var matched, browser;

    // Use of jQuery.browser is frowned upon.
    // More details: http://api.jquery.com/jQuery.browser
    // jQuery.uaMatch maintained for back-compat
    jQuery.uaMatch = function (ua)
    {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];

        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    };

    matched = jQuery.uaMatch(navigator.userAgent);
    browser = {};

    if (matched.browser)
    {
        browser[matched.browser] = true;
        browser.version = matched.version;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome)
    {
        browser.webkit = true;
    } else if (browser.webkit)
    {
        browser.safari = true;
    }

    jQuery.browser = browser;
})();

function fn_datepicker(objid, callbackfunction)
{
    $("#" + objid).datepicker({
        showOn: "both",
        buttonImage: "/image/ic_calender.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        currentText: '오늘 날짜',
        closeText: '닫기',
        onSelect: (callbackfunction == undefined ? null : callbackfunction)
    });
}

function fn_datepicker2(objid, startyear, endyear)
{
    $("#" + objid).datepicker({
        showOn: "both",
        buttonImage: "/image/ic_calender.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        yearRange: startyear + ':' + endyear,
        showButtonPanel: true,
        currentText: '오늘 날짜',
        closeText: '닫기'
    });
}

function fn_datepicker3(objid, startyear, endyear) {
    $("#" + objid).datepicker({
        showOn: "both",
        buttonImage: "/image/ic_calender.png",
        buttonImageOnly: true,
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        minDate: 0,
        currentText: '오늘 날짜',
        closeText: '닫기',
        onSelect: (callbackfunction == undefined ? null : callbackfunction)
    });
}

// 해당 년월의 마지막 날짜값을 Return
function fn_GetDaysOfMonth(l_sDate)
{
    var sdate = l_sDate.replace(/-/gi, "");
    var l_iYear = parseInt(sdate.substring(0, 4), 10);
    var l_iMonth = parseInt(sdate.substring(4, 6), 10);

    /******************************************************************
     * 윤달 Check!
     ******************************************************************/
    var l_sLeapYear = (((l_iYear % 4 == 0) && (l_iYear % 100 != 0)) || (l_iYear % 400 == 0));
    var monthDays = new fn_ArrayOfDay(l_sLeapYear);

    return monthDays[l_iMonth];
}

// 월별  일짜수 저장
function fn_ArrayOfDay(l_sLeapYear)
{
    this[0] = 0;  // <- 아무런 의미가 없는 것임. 무시해도 좋음.
    this[1] = 31;
    this[2] = 28;
    if (l_sLeapYear) // 윤달이 아니면...
        this[2] = 29;
    this[3] = 31;
    this[4] = 30;
    this[5] = 31;
    this[6] = 30;
    this[7] = 31;
    this[8] = 31;
    this[9] = 30;
    this[10] = 31;
    this[11] = 30;
    this[12] = 31;
}

// 한글 없는 문자열 오른쪽 채우기 : RPAD
// argv[0] : 문자열, argv[1] : 문자열길이, argv[2] : 채울문자
function fn_Rpad(str, size, filler)
{
    var val = str;

    if (str.length >= size)
    {
        return val;
    }
    else
    {
        for (var k = 1; k <= (size - str.length) ; k++)
        {
            val += filler;
        }
    }

    return val;
}


// 한글 없는 문자열 왼쪽 채우기 : LPAD
// argv[0] : 문자열, argv[1] : 문자열길이, argv[2] : 채울문자
function fn_Lpad(str, size, filler)
{
    var len = 0;
    var val = "";
    len = str.length;
    val = str;

    if (len >= size)
    {
        return val;
    }
    else
    {
        for (var k = 1; k <= (size - len) ; k++)
        {
            val = filler + val;
        }
    }

    return val;
}

// 마지막 해당월에 날자를찾아낸다
function getLastDay(pyear, pmonth) {
    var year = Number(pyear);
    var month = Number(pmonth);
    if (month == 4 || month == 6 || month == 9 || month == 11)
        return 30;
    else if (month == 2) //2월일때
    {
        if (year % 4 == 0) // 2월이면서 윤년일 때
            return 29;
        else			// 2월이면서 윤년이 아닐 때
            return 28
    }
    else
        return 31;
}

// 테이블을 엑셀로
function fn_table_to_excel(title, tableid1, tableid2, tableid3)
{
    var exceldata = "";

    var $clonedTable1 = $("#" + tableid1).clone();
    $clonedTable1.find('[style*="display: none"]').remove();
    $clonedTable1.attr("border", "1");
    //$clonedTable1.find("td").attr("style", "mso-number-format:\"@\"");

    try
    {
        $clonedTable1.find("td").each(function ()
        {
            if ($(this).attr("style") == undefined)
                $(this).attr("style", "mso-number-format:\"@\"");
            else
                $(this).attr("style", $(this).attr("style") + ";mso-number-format:\"@\"");
        });
    } catch (e) { ; }

    try
    {
        if ($("#" + tableid1).get(0).rowcolor != "" && $("#" + tableid1).get(0).rowcolor.toUpperCase() != "#FFFFFF")  // 선택 로우 색깔 제거
            $clonedTable1.find('[style*="background: ' + hexcolorTOrgb($("#" + tableid1).get(0).rowcolor) + '"]').css("background", "#FFFFFF");
    } catch (e) {; }

    exceldata = escape($clonedTable1.get(0).outerHTML);

    if (tableid2 != undefined && tableid2 != "")
    {
        var $clonedTable2 = $("#" + tableid2).clone();
        $clonedTable2.find('[style*="display: none"]').remove();
        $clonedTable2.attr("border", "1");
        //$clonedTable2.find("td").attr("style", "mso-number-format:\"@\"");
        $clonedTable2.find("td").each(function ()
        {
            if ($(this).attr("style") == undefined)
                $(this).attr("style", "mso-number-format:\"@\"");
            else
                $(this).attr("style", $(this).attr("style") + ";mso-number-format:\"@\"");
        });

        try
        {
            if ($("#" + tableid2).get(0).rowcolor != "" && $("#" + tableid2).get(0).rowcolor.toUpperCase() != "#FFFFFF")  // 선택 로우 색깔 제거
                $clonedTable2.find('[style*="background: ' + hexcolorTOrgb($("#" + tableid2).get(0).rowcolor) + '"]').css("background", "#FFFFFF");
        } catch (e) {; }

        exceldata += escape("<br/>" + $clonedTable2.get(0).outerHTML);
    }

    if (tableid3 != undefined && tableid3 != "")
    {
        var $clonedTable3 = $("#" + tableid3).clone();
        $clonedTable3.find('[style*="display: none"]').remove();
        $clonedTable3.attr("border", "1");
        //$clonedTable3.find("td").attr("style", "mso-number-format:\"@\"");
        $clonedTable3.find("td").each(function ()
        {
            if ($(this).attr("style") == undefined)
                $(this).attr("style", "mso-number-format:\"@\"");
            else
                $(this).attr("style", $(this).attr("style") + ";mso-number-format:\"@\"");
        });

        try
        {
            if ($("#" + tableid3).get(0).rowcolor != "" && $("#" + tableid3).get(0).rowcolor.toUpperCase() != "#FFFFFF")  // 선택 로우 색깔 제거
                $clonedTable3.find('[style*="background: ' + hexcolorTOrgb($("#" + tableid3).get(0).rowcolor) + '"]').css("background", "#FFFFFF");
        } catch (e) {; }

        exceldata += escape("<br/>" + $clonedTable3.get(0).outerHTML);
    }

    $("#hd_excel_title").val(escape(title));
    $("#hd_excel_data").val(exceldata);

    var theForm = document.forms["form1"];
    theForm.action = "/common/excel_view.aspx";
    theForm.method = "post";
    theForm.target = "ifr_excel";
    theForm.submit();
}

function hexcolorTOrgb(hcolor)
{
    var H1 = Mid(hcolor, 2, 2).toUpperCase();
    var H2 = Mid(hcolor, 4, 2).toUpperCase();
    var H3 = Mid(hcolor, 6, 2).toUpperCase();
    var R1 = 255;
    var G1 = 255;
    var B1 = 255;

    // R
    if (Mid(H1, 1, 1) >= "0" && Mid(H1, 1, 1) <= "9")
        R1 = Mid(H1, 1, 1) * 1;
    else
        R1 = ((Mid(H1, 1, 1).charCodeAt(0) - 55) * 16);

    if (Mid(H1, 2, 1) >= "0" && Mid(H1, 2, 1) <= "9")
        R1 += Mid(H1, 2, 1) * 1;
    else
        R1 += (Mid(H1, 2, 1).charCodeAt(0) - 55);

    // G
    if (Mid(H2, 1, 1) >= "0" && Mid(H2, 1, 1) <= "9")
        G1 = Mid(H2, 1, 1) * 1;
    else
        G1 = ((Mid(H2, 1, 1).charCodeAt(0) - 55) * 16);

    if (Mid(H2, 2, 1) >= "0" && Mid(H2, 2, 1) <= "9")
        G1 += Mid(H2, 2, 1) * 1;
    else
        G1 += (Mid(H2, 2, 1).charCodeAt(0) - 55);

    // B
    if (Mid(H3, 1, 1) >= "0" && Mid(H3, 1, 1) <= "9")
        B1 = Mid(H3, 1, 1) * 1;
    else
        B1 = ((Mid(H3, 1, 1).charCodeAt(0) - 55) * 16);

    if (Mid(H3, 2, 1) >= "0" && Mid(H3, 2, 1) <= "9")
        B1 += Mid(H3, 2, 1) * 1;
    else
        B1 += (Mid(H3, 2, 1).charCodeAt(0) - 55);

    return 'rgb(' + R1 + ', ' + G1 + ', ' + B1 + ')';
}

// 페이지 영역 만들기
var TotalListCount = 0;
var CurrentPage = 1;
var Pagesize = 10;     // 페이지의 숫자 갯수  ex) 3이면  << | < | 1 | 2 | 3 | > | >>
var List_count = 10;  // 화면에 보여지는 목록의 수

function fn_makePageArea()
{
    var pageHTML = "";

    var t_page = parseInt((CurrentPage - 1) / Pagesize);
    var totalPage = parseInt(TotalListCount / List_count);
    if (TotalListCount % List_count > 0) totalPage++;

    //처음 페이지
    if (CurrentPage == 1)
        pageHTML += "<a class='p0 mr10'><img src='/image/bt_first.png' alt='처음' /></a>";
    else
        pageHTML += "<a href='javascript:fn_Pagemove(1);' class='p0 mr10'><img src='/image/bt_first.png' alt='처음' /></a>";

    //이전 페이지
    if (CurrentPage < Pagesize + 1)
        pageHTML += "<a class='p0 mr20'><img src='/image/bt_prev.png' alt='이전' /></a>";
    else
        pageHTML += "<a href='javascript:fn_Pagemove(" + (((t_page - 1) * Pagesize) + (1 * 1)) + ");' class='p0 mr20'><img src='/image/bt_prev.png' alt='이전' /></a>";


    for (var i = 1; i <= Pagesize; i++)
    {
        var i_list = i + (Pagesize * t_page);

        if (CurrentPage == i_list)
            pageHTML += "<span>" + i_list + "</span>";
        else
            pageHTML += "<a href='javascript:fn_Pagemove(" + i_list + ");'>" + i_list + "</a>";

        if (i_list == totalPage) break;
    }

    // 다음 페이지
    if (totalPage >= (t_page + 1) * Pagesize + 1)
        pageHTML += "<a href='javascript:fn_Pagemove(" + (((t_page + 1) * Pagesize) + (1 * 1)) + ");' class='ml40 p0'><img src='/image/bt_next.png' alt='다음' /></a>";
    else
        pageHTML += "<a class='ml40 p0'><img src='/image/bt_next.png' alt='다음' /></a>";

    // 끝 페이지
    if (CurrentPage == totalPage)
        pageHTML += "<a class='p0 ml10'><img src='/image/bt_last.png' alt='끝' /></a>";
    else
        pageHTML += "<a href='javascript:fn_Pagemove(" + totalPage + ");' class='p0 ml10'><img src='/image/bt_last.png' alt='끝' /></a>";

    $("#div_page_area").html(pageHTML);
}


// 인젝션 스크립트 제거
function fn_script_remove(inpstr)
{
    var stpos = inpstr.indexOf("<scrip");
    var enpos = inpstr.indexOf("</scrip") + 9;
    var retstr = "";

    if (stpos >= 0 && enpos >= 0)
        retstr = inpstr.substring(0, stpos) + inpstr.substring(enpos, inpstr.length);
    else
        retstr = inpstr;

    return retstr;
}

/*
숫자 세자리 콤마 리턴
*/
function fGetNumDot(val) {
    val = String(val);
    var retval = "";
    val = val.replaceAll(",", "");
    if (val.length > 3) {
        for (var i = val.length - 1; i >= 0; i--) {
            retval = val.charAt(i) + retval;
            if (i != 0 && i % 3 == val.length % 3) {
                retval = "," + retval;
            }
        }
        return retval;
    }
    else {
        return val;
    }

}/************************************************************/


/* 자바스크립트 한글 영문 계산하여 자르기 */
String.prototype.cut = function (len) {
    var str = this;
    var l = 0;
    for (var i = 0; i < str.length; i++) {
        l += (str.charCodeAt(i) > 128) ? 2 : 1;
        if (l > len) return str.substring(0, i) + "..";
    }
    return str;
}

String.prototype.bytes = function () {
    var str = this;
    var l = 0;
    for (var i = 0; i < str.length; i++) l += (str.charCodeAt(i) > 128) ? 2 : 1;
    return l;
}

//받은 입력값 특수문자 변환 처리
function ChangeInputValue(pValue) {
    var strReturenValue = "";
    strReturenValue = pValue.replace(/&/gi, '&amp;').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/"/gi, '&quot;').replace(/'/gi, '&apos;');
    return strReturenValue;
}

//받은 입력값 특수문자 변환 처리
function ChangeOutputValue(pValue) {
    var strReturenValue = "";
    strReturenValue = pValue.replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&apos;/gi, '\'').replace(/&nbsp;/gi, ' ');
    return strReturenValue;
}

// 특수 문자 체크
function CheckSpecialCharacter1(Value)
{
    var SpecialCharacter = /[<>]/gi;
    if (SpecialCharacter.test(Value) == true)
        return true;
    else
        return false;
}

function fn_teleformat(tel_no)
{
    var htb = new Array("010", "011", "013", "016", "017", "018", "019", "031", "032", "033", "041", "042", "043",
        "051", "052", "053", "054", "055", "061", "062", "063", "064");
    var i;
    var retTel_no = "";
    var TEL1 = "";
    var TEL2 = "";
    var TEL3 = "";
    var REMTELNO = "";

    //retTel_no = tel_no.replace(/-/gi, "").replace(/\)/gi, "").replace(/\(/gi, "").replace(/ /gi, "");

    retTel_no = tel_no.replace(/-/gi, "");
    retTel_no = retTel_no.replace(/\)/gi, "");
    retTel_no = retTel_no.replace(/\(/gi, "")
    retTel_no = retTel_no.replace(/ /gi, "");

    if (retTel_no.substring(0, 2) == "02")
    {
        REMTELNO = retTel_no.substring(2, retTel_no.length);
        TEL1 = "02 -";
    }
    else
    {
        for (i = 0; i < 22; i++)
        {
            if (retTel_no.substring(0, 3) == htb[i])
            {
                REMTELNO = retTel_no.substring(3, retTel_no.length)
                TEL1 = htb[i] + "-";
                break;
            }
        }
        if (REMTELNO == "")
        {
            REMTELNO = retTel_no.substring(3, retTel_no.length);
            TEL1 = retTel_no.substring(0, 3) + "-";
        }
    }

    if (REMTELNO.length == 7)
    {
        TEL2 = REMTELNO.substring(0, 3) + " -";
        TEL3 = REMTELNO.substring(3, 3 + 4);
    }
    else if (REMTELNO.length == 8)
    {
        TEL2 = REMTELNO.substring(0, 4) + "-";
        TEL3 = REMTELNO.substring(4, 4 + 4);
    }
    else
    {
        REMTELNO = fn_Rpad(REMTELNO, 8, " ");
        TEL2 = fn_Rpad(REMTELNO.substring(0, 4), 4, " ") + "-";
        TEL3 = fn_Rpad(REMTELNO.substring(4, 4 + 4), 4, " ");
    }

    retTel_no = TEL1 + TEL2 + TEL3;

    if (retTel_no.replace(/ /gi, "") == "--")
        retTel_no = "";

    return retTel_no;
}
