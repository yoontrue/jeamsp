package job;

import java.sql.ResultSet;
import java.util.Map;

public class classlist_list_t01 implements jobClass, saveClass {

	String NEW_C_IDX = "";
	
	public String getClassType ()
	{
		return "save";
	}
	
	public String execSave (Jsds jd, String varParam)
	{
		String strReturn = "";
		
		jobJsds.onMainInsertRow insertCallBack = new jobJsds.onMainInsertRow() 
		{ 
			@Override
			public void MainInsertRow(String progid, Map<String, String> param) throws Exception
			{
				if (progid.equals("classlist_list_t01") == true)
				{
					String sql = """
						set @c_branch = ?;
						set @c_name = ?;
						
						select c_idx from tblclass where c_branch = @c_branch and c_name = @c_name
						"""; 
							
					ResultSet rsc = jd.executeQuery(sql, param);
					
					rsc.last();
					int rowCount = rsc.getRow(); 
					
					if (rowCount > 0)
					{
						String updsql = """
							set @c_idx = ?;
							set @c_firstdate = ?;
							set @c_lastdate = ?;
							
							update tblclass set c_firstdate = @c_firstdate, c_lastdate = @c_lastdate, c_memo = date_format(now(), '%Y-%m-%d %T')
							where c_idx = @c_idx
							""";
						
						param.put("C_IDX", rsc.getString(1));
						
						jd.executeUpdate(updsql, param);
					}
					else
					{
						String inssql = """
							set @c_idx = ?;
							set @c_branch = ?;
							set @c_firstdate = ?;
							set @c_lastdate = ?;
							set @c_name = ?;
							set @c_active = ?;
							
							insert into tblclass (c_branch, c_firstdate, c_lastdate, c_name, c_active) values 
							(@c_branch, @c_firstdate, @c_lastdate, @c_name, @c_active) 
							""";
						
						jd.executeUpdate(inssql, param);
						
						sql = "select last_insert_id() new_c_idx from dual";
						
						ResultSet rsidx = jd.executeQuery(sql, param);
						
						rsidx.last();
						
						NEW_C_IDX = rsidx.getString("new_c_idx");
					}
				}
				
				if (progid.equals("classlist_list_t02") == true)
				{
					if (NEW_C_IDX.equals("") == false) 
					{
						param.put("MC_CLASS", NEW_C_IDX);
					
						String inssql = """
							set @mc_branch = ?;
							set @mc_class = ?;
							set @mc_member = ?;
							set @mc_firstdate = ?;
							set @mc_lastdate = ?;
								
							insert into tblmember_class (mc_branch, mc_class, mc_member, mc_register, mc_firstdate, mc_lastdate, mc_in_reg_date, mc_inreason)
							select @mc_branch, @mc_class, @mc_member, 'abc', left(@mc_firstdate, 10), left(@mc_lastdate, 10), now(), '2'
							from dual
							where
							not exists
							(
							    select '1' from tblmember_class where mc_branch = @mc_branch and mc_class = @mc_class and mc_member = @mc_member
							)
							""";
						
						jd.executeUpdate(inssql, param);
					}
				}
			}
		};

		jobJsds.onMainUpdateRow updateCallBack = new jobJsds.onMainUpdateRow()
		{ 
			@Override
			public void MainUpdateRow(String progid, Map<String, String> param) throws Exception
			{
				// TODO Auto-generated method stub
				System.out.println(param.get("c_name"));
			}
		};
			
		jobJsds.onMainDeleteRow deleteCallBack = new jobJsds.onMainDeleteRow()
		{ 
			@Override
			public void MainDeleteRow(String progid, Map<String, String> param) throws Exception 
			{
				// TODO Auto-generated method stub
				System.out.println(param.get("c_name"));
			}
		};
		
		jd.setMainInsertRow(insertCallBack);
		jd.setMainUpdateRow(updateCallBack);
		jd.setMainDeleteRow(deleteCallBack);
		
		try 
		{
			jd.setTPprocess(varParam);
			
			strReturn = "[{\"RESULT\":\"OK\",\"DESCRIPTION\":\"\"}]";
		}
		catch(Exception ex)
		{
			strReturn = "[{\"RESULT\":\"ERROR\",\"DESCRIPTION\":\"" + ex.getMessage() + "\"}]";
		}
		
		return strReturn;
	}
}
