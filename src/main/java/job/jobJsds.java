package job;

import java.io.BufferedReader;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.sql.Clob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.stereotype.Controller;

import job.jobJsds.onMainDeleteRow;
import job.jobJsds.onMainInsertRow;
import job.jobJsds.onMainUpdateRow;

@Controller
public class jobJsds implements Jsds {
	private static final int MAX_SQL_CNT = 100;
	
	public Connection con = null;
	public PreparedStatement pstmt = null;
	
	public jobJsds ()
	{
		;
	}
	
	public jobJsds (Connection con)
	{
		this.con = con;
	}
	
	public void setCon(Connection con) 
	{
		this.con = con;
	}
	
	// 조회 SQL 처리
	public ResultSet executeQuery(String selectsql, String paramstr) throws Exception
	{
		int i;
		String[] lines = selectsql.split("\n");
		
		String[] sql = new String[MAX_SQL_CNT];
		int s_cnt = 0;
		
		for (i = 0; i < lines.length; i++)
		{
			if (lines[i].trim().equals("") == true)
				continue;
			
			String oneline = lines[i].trim();
			
			if (oneline.length() > 3 && oneline.substring(0, 3).toUpperCase().equals("SET"))
			{
				sql[s_cnt] = oneline.replace("\t", " ");
				s_cnt++;
			}
			else
			{
				if (sql[s_cnt] == null)
					sql[s_cnt] = "";
				else
					sql[s_cnt] += "\n";
				
				sql[s_cnt] += oneline.replace("\t", " ");
			}
		}
		
		if (sql[s_cnt] != null && sql[s_cnt].equals("") != true)
			s_cnt++;
		
		ResultSet rltset = null;
		
		Map<String, String> newparam = new HashMap<String, String>();
		
		String[] tdt = paramstr.split(","); 
		
        for (int tx = 0; tx < tdt.length; tx++)
        {
            if (tdt[tx].equals("") != true)
            {
            	try
            	{ 
            		String colval = URLDecoder.decode(tdt[tx].split("=", -1)[1], "utf-8");
            		
            		newparam.put(tdt[tx].split("=")[0].toUpperCase(), colval);
            	}
            	catch (Exception ex)
            	{
            		System.out.println(ex.getMessage());
            	}
            }
        }
        
		for (i = 0; i < s_cnt; i++)
		{
			if (sql[i].length() > 3 && sql[i].substring(0, 3).toUpperCase().equals("SET"))
			{
				String colname = "";
				int stpos = sql[i].indexOf("@") + 1;
				int enpos = sql[i].indexOf(" ", stpos);
				colname = sql[i].substring(stpos, enpos).toUpperCase();
				
				String colvalue = newparam.get(colname);
						
		        pstmt = con.prepareStatement(sql[i]);
		        pstmt.setString(1, colvalue);
		        pstmt.execute();
			}
			else  // select sql
			{
				pstmt = con.prepareStatement(sql[i], ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
				rltset = pstmt.executeQuery();
			}
		}
		
		return rltset;
	}
	
	// 조회 SQL 처리
	public ResultSet executeQuery(String selectsql, Map<String, String> param) throws Exception
	{
		int i;
		String[] lines = selectsql.split("\n");
		
		String[] sql = new String[MAX_SQL_CNT];
		int s_cnt = 0;
		
		for (i = 0; i < lines.length; i++)
		{
			if (lines[i].trim().equals("") == true)
				continue;
			
			String oneline = lines[i].trim();
			
			if (oneline.length() > 3 && oneline.substring(0, 3).toUpperCase().equals("SET"))
			{
				sql[s_cnt] = oneline.replace("\t", " ");
				s_cnt++;
			}
			else
			{
				if (sql[s_cnt] == null)
					sql[s_cnt] = "";
				else
					sql[s_cnt] += "\n";
				
				sql[s_cnt] += oneline.replace("\t", " ");
			}
		}
		
		if (sql[s_cnt] != null && sql[s_cnt].equals("") != true)
			s_cnt++;
		
		ResultSet rltset = null;
		
		Map<String, String> newparam = new HashMap<String, String>();
		
		if (param.size() > 0)  // 파라메터 key 소문자로 치환
		{
			Iterator<String> iteratorKey = param.keySet().iterator(); // 키값 오름차순
			
			while(iteratorKey.hasNext())
			{
				String strKey = iteratorKey.next();
				String strValue = param.get(strKey);
				
				newparam.put(strKey.toUpperCase(), strValue);
			}
		}
		
		for (i = 0; i < s_cnt; i++)
		{
			if (sql[i].length() > 3 && sql[i].substring(0, 3).toUpperCase().equals("SET"))
			{
				String colname = "";
				int stpos = sql[i].indexOf("@") + 1;
				int enpos = sql[i].indexOf(" ", stpos);
				colname = sql[i].substring(stpos, enpos).toUpperCase();
				
				String colvalue = newparam.get(colname);
						
		        pstmt = con.prepareStatement(sql[i]);
		        pstmt.setString(1, colvalue);
		        pstmt.execute();
			}
			else  // select sql
			{
				pstmt = con.prepareStatement(sql[i], ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
				rltset = pstmt.executeQuery();
			}
		}
		
		return rltset;
	}
	
	// ResultSet to json
	@SuppressWarnings("unchecked")
	public String dataSetToJsonString(ResultSet rs)
	{
		int idx;
		
		JSONArray componentArray = new JSONArray();
		JSONObject statusJO = new JSONObject();
		JSONObject columnJO = new JSONObject();
		
		try
		{
	        ResultSetMetaData rsmd = rs.getMetaData();
	        
			int colCount = rsmd.getColumnCount();
			String[] columnName = new String[colCount];
			String[] columnTypeName = new String[colCount];
			int[] columnSize = new int[colCount];
			
			for (idx = 1; idx <= colCount; idx++)
			{
				columnName[idx-1] = rsmd.getColumnName(idx).toUpperCase();
				columnTypeName[idx-1] = rsmd.getColumnTypeName(idx);
				columnSize[idx-1] = rsmd.getPrecision(idx);
			}
			
			// 상태 JSON
			statusJO.put("STATUS", "OK");
			statusJO.put("DESCRIPTION", "");
			
			componentArray.add(statusJO);
			
			// 컬럼정보 JSON
			String columnstr = "";
			for (idx = 1; idx <= colCount; idx++)
			{
				if (idx > 1)
					columnstr += ",";
				
				columnstr += columnName[idx-1] + ":" + columnTypeName[idx-1] + "(" + Integer.toString(columnSize[idx-1]) + ")";
			}
			
			columnJO.put("COL", columnstr);
			
			componentArray.add(columnJO);
			
			while(rs.next())
			{
				Map<String, String> oneRow = new LinkedHashMap<String, String>();
				
				for (idx = 1; idx <= colCount; idx++)
				{
					if (rs.getObject(idx) == null)
					{
						oneRow.put(columnName[idx-1], "");
					}
					else
					{
						if (columnTypeName[idx-1].equals("CLOB"))  // CLOB 처리
						{
							StringBuffer strbContent = new StringBuffer();
							String strLine = "";
							java.sql.Clob clob = null;
	
							clob = (Clob) rs.getObject(idx);
							Reader reader = clob.getCharacterStream();
							BufferedReader bufReader = new BufferedReader(reader);
	
							while(null != (strLine = bufReader.readLine()))
							{
								strbContent.append((strLine == null)? "" : strLine);
								strbContent.append("\n");
							}
	
							oneRow.put(columnName[idx-1], strbContent.toString());
						}
						else
						{
							oneRow.put(columnName[idx-1], rs.getObject(idx).toString());
						}
					}
				}
				
				componentArray.add(oneRow);
			}
		}
		catch(Exception ex)
		{
			// 상태 JSON
			statusJO.put("STATUS", "ERROR");
			statusJO.put("DESCRIPTION", ex.getMessage());
			
			componentArray.add(statusJO);
		}
		
		//System.out.println(componentArray.toString());
		
		return componentArray.toString();
	}
	
	// ResultSet to ArrayList
	public ArrayList<Map<String, String>> dataSetToList(ResultSet rs)
	{
		int idx;
		
		ArrayList<Map<String, String>> resultList = new ArrayList<Map<String, String>>();
		
		try
		{
	        ResultSetMetaData rsmd = rs.getMetaData();
	        
			int colCount = rsmd.getColumnCount();
			String[] columnName = new String[colCount];
			String[] columnTypeName = new String[colCount];
			
			for (idx = 1; idx <= colCount; idx++)
			{
				columnName[idx-1] = rsmd.getColumnName(idx).toUpperCase();
				columnTypeName[idx-1] = rsmd.getColumnTypeName(idx);
			}
			
			while(rs.next())
			{
				Map<String, String> oneRow = new LinkedHashMap<String, String>();
				
				for (idx = 1; idx <= colCount; idx++)
				{
					if (rs.getObject(idx) == null)
					{
						oneRow.put(columnName[idx-1], "");
					}
					else
					{
						if (columnTypeName[idx-1].equals("CLOB"))  // CLOB 처리
						{
							StringBuffer strbContent = new StringBuffer();
							String strLine = "";
							java.sql.Clob clob = null;
	
							clob = (Clob) rs.getObject(idx);
							Reader reader = clob.getCharacterStream();
							BufferedReader bufReader = new BufferedReader(reader);
	
							while(null != (strLine = bufReader.readLine()))
							{
								strbContent.append((strLine == null)? "" : strLine);
								strbContent.append("\n");
							}
	
							oneRow.put(columnName[idx-1], strbContent.toString());
						}
						else
						{
							oneRow.put(columnName[idx-1], rs.getObject(idx).toString());
						}
					}
				}
				
				resultList.add(oneRow);
			}
		}
		catch(Exception ex)
		{
			;
		}
		
		return resultList;
	}
	
		
	// 저장 데이터셋 파싱/이벤트 호출
	
	interface onMainInsertRow { void MainInsertRow(String progid, Map<String, String> param) throws Exception; }
	interface onMainUpdateRow { void MainUpdateRow(String progid, Map<String, String> param) throws Exception; }
	interface onMainDeleteRow { void MainDeleteRow(String progid, Map<String, String> param) throws Exception; }
		
	private onMainInsertRow insertCallBack;
	private onMainUpdateRow updateCallBack;
	private onMainDeleteRow deleteCallBack;

	public void setMainInsertRow(onMainInsertRow callBack) { insertCallBack = callBack; }
	public void setMainUpdateRow(onMainUpdateRow callBack) { updateCallBack = callBack; }
	public void setMainDeleteRow(onMainDeleteRow callBack) { deleteCallBack = callBack; }
		
	@SuppressWarnings({ "unused", "unchecked" })
	public void setTPprocess (String varParam) throws Exception
	{
		String strReturn = "";
		
		try
		{
			this.con.setAutoCommit(false); // AutoCommit을 false로 변경
			
			JSONParser parser = new JSONParser();
			JSONObject jObj = (JSONObject) parser.parse(varParam);
	
			Set<String> keyset = jObj.keySet();
			Iterator<String> iter = keyset.iterator();
				
			while (iter.hasNext()) 
			{
			    String keyname = iter.next();
			    //System.out.println(keyname);
			    
			    JSONArray rowSetNode = (JSONArray)jObj.get(keyname);
			    
			    for (Object rowsobj: rowSetNode)
			    {
			    	JSONObject rows = (JSONObject) rowsobj;

			    	rows.keySet().forEach(rtype -> 
			    	{
			    		String row_type = (String) rtype;
			    		//System.out.println(row_type);
			    		
			    		Map<String, String> newparam = new HashMap<String, String>();
			    		
			    		JSONArray rowNode = (JSONArray)rows.get(row_type);
			    		  
			    		for (Object colobj: rowNode)
					    {
			    			JSONObject cols = (JSONObject) colobj;
			    			
			    			cols.keySet().forEach(cname ->
			    			{
			    				String colname = (String)cname;
			    				String colval = (String)cols.get(colname);
			    				
			    				try 
			    				{
			    					colval = URLDecoder.decode(colval, "utf-8");
				            		newparam.put(colname.toUpperCase(), colval);
				            		
									//System.out.println(colname + "=" + colval);
								} 
			    				catch (UnsupportedEncodingException e) {
									// TODO Auto-generated catch block
									e.printStackTrace();
								}
			    			});
					    }
			    		
			    		if (row_type.equals("2") == true)   //INSERT
			    		{
			    			if (insertCallBack != null) 
			    			{ 
			    				try {
									insertCallBack.MainInsertRow(keyname, newparam);
								} catch (Exception e) {
									throw new RuntimeException(e);
								} 
			    			}
			    		}
						
			    		if (row_type.equals("3") == true)   //UPDATE
			    		{
			    			if (updateCallBack != null) 
			    			{ 
			    				try {
									updateCallBack.MainUpdateRow(keyname, newparam);
								} catch (Exception e) {
									throw new RuntimeException(e);
								} 
			    			}
			    		}
			    		
			    		if (row_type.equals("4") == true)   //DELETE
			    		{
			    			if (deleteCallBack != null) 
			    			{ 
			    				try {
									deleteCallBack.MainDeleteRow(keyname, newparam);
								} catch (Exception e) {
									throw new RuntimeException(e);
								} 
			    			}
			    		}
			    	});
			    	

			    }
			}
			
			this.con.commit(); // 작업 내용을 commit
		}
		catch(Exception ex)
		{
			this.con.rollback();
			throw ex;
		}
	}
	
	// 저장 SQL 처리
	public void executeUpdate(String selectsql, Map<String, String> param) throws Exception
	{
		int i;
		String[] lines = selectsql.split("\n");
		
		String[] sql = new String[MAX_SQL_CNT];
		int s_cnt = 0;
		
		for (i = 0; i < lines.length; i++)
		{
			if (lines[i].trim().equals("") == true)
				continue;
			
			String oneline = lines[i].trim();
			
			if (oneline.length() > 3 && oneline.substring(0, 3).toUpperCase().equals("SET"))
			{
				sql[s_cnt] = oneline.replace("\t", " ");
				s_cnt++;
			}
			else
			{
				if (sql[s_cnt] == null)
					sql[s_cnt] = "";
				else
					sql[s_cnt] += "\n";
				
				sql[s_cnt] += oneline.replace("\t", " ");
			}
		}
		
		if (sql[s_cnt] != null && sql[s_cnt].equals("") != true)
			s_cnt++;
        
		for (i = 0; i < s_cnt; i++)
		{
			if (sql[i].length() > 3 && sql[i].substring(0, 3).toUpperCase().equals("SET"))
			{
				String colname = "";
				int stpos = sql[i].indexOf("@") + 1;
				int enpos = sql[i].indexOf(" ", stpos);
				colname = sql[i].substring(stpos, enpos).toUpperCase();
				
				String colvalue = param.get(colname);
						
		        pstmt = con.prepareStatement(sql[i]);
		        
		        if (colvalue.equals("true"))
		        	pstmt.setBoolean(1, true);
		        else if (colvalue.equals("false"))
		        	pstmt.setBoolean(1, false);
		        else 
		        	pstmt.setString(1, colvalue);

		        pstmt.execute();
			}
			else  // insert/update/delete sql
			{
				pstmt = con.prepareStatement(sql[i]);
				pstmt.executeUpdate();
			}
		}
	}
	
	@Override
	protected void finalize() throws Throwable 
	{
		if (pstmt != null)
			pstmt.close();
		
		//System.out.println("객체의 finalize()가 실행됨");
	}
}
