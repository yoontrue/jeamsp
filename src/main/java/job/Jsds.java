package job;

import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Map;

import job.jobJsds.onMainDeleteRow;
import job.jobJsds.onMainInsertRow;
import job.jobJsds.onMainUpdateRow;

public interface Jsds 
{
	public void setCon(Connection con);
	public ResultSet executeQuery(String selectsql, String paramstr) throws Exception;
	public ResultSet executeQuery(String selectsql, Map<String, String> param) throws Exception;
	public void executeUpdate(String updatesql, Map<String, String> param) throws Exception;
	public String dataSetToJsonString(ResultSet rs);
	public ArrayList<Map<String, String>> dataSetToList(ResultSet rs1);
	public void setTPprocess(String varParam) throws Exception;
	public void setMainInsertRow(onMainInsertRow insertCallBack);
	public void setMainUpdateRow(onMainUpdateRow updateCallBack);
	public void setMainDeleteRow(onMainDeleteRow deleteCallBack);
}