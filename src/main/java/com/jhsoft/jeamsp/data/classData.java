package com.jhsoft.jeamsp.data;

import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import common.ConMgr;
import job.Jsds;
import job.jobJsds;
import job.selectClass;

public class classData {
	public static HashMap<String, Object> getStudent () throws Exception
	{
		// 반환용 데이터 세트(묶음)
		HashMap<String, Object> resultMap = new HashMap<String, Object>();
		
		Connection con = null;
        
    	try
    	{
    		con = ConMgr.getInstance().getConnection();
    	}
    	catch(Exception e)
    	{
    		throw e;
    	}
    	
    	Jsds jd = new jobJsds();
    	
    	jd.setCon(con);
    	
    	// 학생 명단
    	String selectsql1 = """
			SET @in_m_branch := ?;
			
			select
    			row_number() over(order by m.m_name) seq,
			    m.m_idx, m.m_name, m.m_school, 
			    (select codenm from tblcode where branch = 0 and gu_bun = 'M_GRADE_NAME' and codeid = m.m_grade) m_grade_name,
				m.stu_no
			from tblmember m
			WHERE 
			m_branch = @in_m_branch AND 
			m_gubun in ('1', '2', '3', '4', '5') and 
			(
			    select count(*) 
			    from tblmember_class mc
			    join tblclass c on c_branch = @in_m_branch and c.c_idx = mc.mc_class
			    where 
			    mc.mc_member = m.m_idx and
			    date_format(NOW(), '%Y-%m') between date_format(GREATEST(mc.mc_firstdate, C.c_firstdate), '%Y-%m') and date_format (LEAST(mc.mc_lastdate, C.c_lastdate), '%Y-%m')
			) > 0 AND
			m.m_school <> ''
			order by m.m_name
    			""";
    			
    	Map<String, String> param1 = new HashMap<String, String>();
    	
    	param1.put("in_m_branch", "192");
    	
		ResultSet rs1 = jd.executeQuery(selectsql1, param1);
		
		ArrayList<Map<String, String>> resultList1 = jd.dataSetToList(rs1);
		
		
		// 데이터 셋에 넣어주기
		resultMap.put("studentlist", resultList1);
		
		
		
		// 전체 인원수
		String selectsql2 = """
			SET @in_m_branch := ?;
			
			select
			    count(m.m_idx) inwon, 2 sinip
			from tblmember m
			WHERE 
			m_branch = @in_m_branch AND 
			m_gubun in ('1', '2', '3', '4', '5') and 
			(
			    select count(*) 
			    from tblmember_class mc
			    join tblclass c on c_branch = @in_m_branch and c.c_idx = mc.mc_class
			    where 
			    mc.mc_member = m.m_idx and
			    date_format(NOW(), '%Y-%m') between date_format(GREATEST(mc.mc_firstdate, C.c_firstdate), '%Y-%m') and date_format (LEAST(mc.mc_lastdate, C.c_lastdate), '%Y-%m')
			) > 0 AND
			m.m_school <> ''
    			""";
		
    	Map<String, String> param2 = new HashMap<String, String>();
    	
    	param2.put("in_m_branch", "192");
    	
		ResultSet rs2 = jd.executeQuery(selectsql2, param2);
		
		ArrayList<Map<String, String>> resultList2 = jd.dataSetToList(rs2);
		
		
		// 데이터 셋에 넣어주기
		resultMap.put("total", resultList2);
		
		if (rs1 != null)
			rs1.close();
		
		if (rs2 != null)
			rs2.close();
		
		if (con != null)
			con.close();
		
		if (jd != null)
			jd = null;
		
		System.gc();
		
		return resultMap;
	}
}
