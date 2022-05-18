<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<script type="text/javascript" src="/js/jquery-1.10.2.min.js" charset="utf-8"></script>
<script type="text/javascript" src="/js/evt.js"></script>
<script type="text/javascript" src="/js/jsds.2.5.js"></script>
<script type="text/javascript" src="/js/jsdscombo.1.1.js"></script>

<script type="text/javascript">
	var dsCLS = new jsds("dsCLS", true);
	var dsSTU = new jsds("dsSTU", true);
	var dsINFO = new jsds("dsINFO", true);
	var trINFO = new jstr();
	
    $(document).ready(function () 
    {

    });
    
    function fn_query_cls()
    {
        var progid = "/job/classlist_list_s01";
        var argString = "in_c_branch=192" +
				        ",in_grade=" +
				        ",in_staff=" +
				        ",in_kwamok=" +
				        ",in_class_name=" + encodeURIComponent("중등가온") +
				        ",in_yyyymm_st=2022-02" +
				        ",in_regular=" +
				        ",in_schedule_type=" +
				        ",in_lms=" +
				        ",in_live=YF" +
				        ",in_c_idx=";

        dsCLS.Reset(progid, argString);
    }
    
    function dsCLS_OnLoadCompleted() 
    {
    	var c_name = "";
    	
    	for (var i = 1; i <= dsCLS.length; i++)
   		{
    		c_name += dsCLS[i]["C_IDX"] + ":" + dsCLS[i]["C_NAME"] + "<br/>";
   		}
    	
    	$("#div_result").html(c_name);
    }
    
    function fn_save_cls()
    {
    	dsINFO.initDs("dsINFO", true);
        var Theader = "C_IDX:STRING(255),C_BRANCH:STRING(255),C_FIRSTDATE:STRING(255),C_LASTDATE:STRING(255),C_NAME:STRING(255),C_ACTIVE:STRING(255)";
        
        dsINFO.set_Col(Theader);

        let today = new Date();   
        let hours = today.getHours(); // 시
        let minutes = today.getMinutes();  // 분
        let seconds = today.getSeconds();  // 초
        
        var c_name = hours + minutes;
        
        dsINFO.AddRow();
        
        dsINFO[dsINFO.RowPosition]["C_IDX"] = "";
        dsINFO[dsINFO.RowPosition]["C_BRANCH"] = "9";
        dsINFO[dsINFO.RowPosition]["C_FIRSTDATE"] = "2022-02-26";
        dsINFO[dsINFO.RowPosition]["C_LASTDATE"] = "2022-12-31";
        dsINFO[dsINFO.RowPosition]["C_NAME"] = "학급_" + c_name + "_1";
        dsINFO[dsINFO.RowPosition]["C_ACTIVE"] = true;
        
        
        dsSTU.initDs("dsSTU", true);
        var Theader = "MC_BRANCH:STRING(255),MC_CLASS:STRING(255),MC_MEMBER:STRING(255),MC_FIRSTDATE:STRING(255),MC_LASTDATE:STRING(255)";
        
        dsSTU.set_Col(Theader);
        
        dsSTU.AddRow();
        
        dsSTU[dsSTU.RowPosition]["MC_BRANCH"] = "9";
        dsSTU[dsSTU.RowPosition]["MC_CLASS"] = "";
        dsSTU[dsSTU.RowPosition]["MC_MEMBER"] = "156079";  
        dsSTU[dsSTU.RowPosition]["MC_FIRSTDATE"] = dsINFO[dsINFO.RowPosition]["C_FIRSTDATE"];
        dsSTU[dsSTU.RowPosition]["MC_LASTDATE"] = dsINFO[dsINFO.RowPosition]["C_LASTDATE"];    
	
		dsSTU.AddRow();
        
        dsSTU[dsSTU.RowPosition]["MC_BRANCH"] = "9";
        dsSTU[dsSTU.RowPosition]["MC_CLASS"] = "";
        dsSTU[dsSTU.RowPosition]["MC_MEMBER"] = "156080";  
        dsSTU[dsSTU.RowPosition]["MC_FIRSTDATE"] = "2022-02-26";
        dsSTU[dsSTU.RowPosition]["MC_LASTDATE"] = dsINFO[dsINFO.RowPosition]["C_LASTDATE"];    
        
	    trINFO.initTr("trINFO");
	    trINFO.progid = "/job/classlist_list_t01";

	    trINFO.KeyValue = "classlist_list_t01=dsINFO,classlist_list_t02=dsSTU";
	
	    trINFO.Post();
    }
    
    function trINFO_OnSuccess()
    {
        alert("저장완료", "확인");
    }

    function trINFO_OnFail(message)
    {
        alert("저장에 실패하였습니다.[" + message + "]", "확인");
    }
</script>

</head>
<body>
    <button type="button" onclick="fn_query_cls();">학급검색</button> 
    <button type="button" onclick="fn_save_cls();">학급저장</button>
	<div id="div_result">
	</div>
</body>
</html>