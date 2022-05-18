package com.jhsoft.jeamsp;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.ResultSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import common.ConMgr;
import job.Jsds;
import job.jobJsds;
import job.saveClass;
import job.selectClass;
import job.jobClass;

@Controller
public class JobController {
	
    @SuppressWarnings({ "deprecation", "rawtypes" })
	@ResponseBody
    @RequestMapping(value="/job/{progid}", method = { RequestMethod.POST })
    public void select_class(@PathVariable String progid, HttpServletRequest request, HttpServletResponse response) throws Exception 
    {
    	request.setCharacterEncoding("UTF-8");
    	
    	InputStream inputStream = request.getInputStream();
    	StringBuilder stringBuilder = new StringBuilder();
        BufferedReader bufferedReader = null;
        
    	if (inputStream != null) 
    	{
            bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
            char[] charBuffer = new char[128];
            int bytesRead = -1;
            while ((bytesRead = bufferedReader.read(charBuffer)) > 0) {
                stringBuilder.append(charBuffer, 0, bytesRead);
            }
        }
    	
    	String varParam = stringBuilder.toString();
    	
    	Connection con = null;
        
    	try
    	{
    		con = ConMgr.getInstance().getConnection();
    	}
    	catch(Exception e)
    	{
    		throw new Exception("ERROR_01 == " + e.getMessage());  // 디비연결에러
    	}
    	
    	Jsds jd = new jobJsds();
    	
    	jd.setCon(con);
    	
    	String progid_full = request.getServletPath();
    	String class_name = progid_full.substring(1).replace('/', '.');
    	
		Class t = Class.forName(class_name);
    	
		jobClass jc = ((jobClass)t.newInstance());
		
		if (jc.getClassType().toLowerCase() == "select")
		{
	    	String selectsql = ((selectClass)jc).getSQL(varParam);
	    	
			ResultSet rs1 = jd.executeQuery(selectsql, varParam);
			
			String result1 = jd.dataSetToJsonString(rs1);
			
			//System.out.println(result1);
			
			rs1.close();
			
			response.getWriter().println(result1);
		}
		else
		{
			String result1 = ((saveClass)jc).execSave(jd, varParam);
			
			response.getWriter().println(result1);
		}
		
    }
}
