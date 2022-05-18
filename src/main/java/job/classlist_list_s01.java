package job;

public class classlist_list_s01 implements jobClass, selectClass {
	
	public String getClassType ()
	{
		return "select";
	}
	
	public String getSQL (String paramstr)
	{
		String sql = """
set @in_c_branch := ?;
set @in_grade := ?;
set @in_staff := ?;
set @in_kwamok := ?;
set @in_class_name := ?;
set @in_yyyymm_st := ?;
set @in_regular := ?;
set @in_schedule_type := ?;
set @in_lms := ?;
set @in_live := ?;
set @in_c_idx := ?;

SELECT 
    'F' CHK_GB, ROWNO, C_IDX, C_FIRSTDATE, C_LASTDATE, C_NAME, C_TEACHER, 
    C_CATEGORY, C_GRADE, C_GRADE1, C_KWAMOK, CLASS_START, C_REGISTER,
    '' as PAYGROUPIDX,
    c_time_member_yn       
FROM 
( 
	select 
	    '' ROWNO, C_IDX, C_BRANCH, LEFT(C_FIRSTDATE, 10) C_FIRSTDATE, CASE WHEN LEFT(C_LASTDATE, 10)='9999-12-31' then '' else LEFT(C_LASTDATE, 10) end C_LASTDATE, C_NAME,
		(SELECT M_NAME FROM TBLMEMBER WHERE M_IDX = C_TEACHER) C_TEACHER,
		(
			SELECT
				CASE WHEN TEXT01 IS NULL OR TEXT01 = '' THEN CODENM
					 ELSE CONCAT(TEXT01, '-', CODENM)
				END
			FROM TBLCODE WHERE BRANCH=@IN_C_BRANCH AND GU_BUN = 'S_CATEGORY' AND CODEID=C_CATEGORY
		) C_CATEGORY,
		( case when LEFT(C_FIRSTDATE, 10) > date_format(Now(), '%Y-%m-%d') then 'F'
		when LEFT(C_LASTDATE, 10) < date_format(Now(), '%Y-%m-%d') then 'N' ELSE 'Y' END) C_STATUS,
		(SELECT CODENM FROM TBLCODE WHERE BRANCH=@IN_C_BRANCH AND GU_BUN = 'M_GRADE_NAME' AND CODEID=C_GRADE) C_GRADE,
		(SELECT replace(replace(CODENM, '등', ''), '학년', '') FROM tblCOde WHERE BRANCH=@IN_C_BRANCH AND GU_BUN = 'M_GRADE_NAME' AND CODEID=C_GRADE) C_GRADE1,
		(SELECT CODENM FROM TBLCODE WHERE BRANCH=@IN_C_BRANCH AND GU_BUN = 'S_KWAMOK' AND CODEID=C_KWAMOK) C_KWAMOK,
		C_REGISTER, TT.CLASS_START, c_time_member_yn
	from tblclass tc
	left join 
	(
	    select 
	        t_class, 
	        group_concat(week_name, case when s_t_time = e_t_time then s_t_time else concat(s_t_time, '-', e_t_time) end order by min_week SEPARATOR ',') CLASS_START
	    from
	    (
	        select t_class, s_t_time, e_t_time, min(t_week) min_week,
	            group_concat(
	                case when t_week = '1' then '월'
	                	 when t_week = '2' then '화'
	                	 when t_week = '3' then '수'
	                	 when t_week = '4' then '목'
	                	 when t_week = '5' then '금'
	                	 when t_week = '6' then '토'
	                	 when t_week = '7' then '일'
	                	 else '' 
	                end
	            order by t_week separator '/') week_name
	        from
	        (
	            select t_class, t_week, min(t_time) s_t_time, max(t_time) e_t_time
	            from tblclasstime ct, tblclass c
	            where 
	            ct.t_class = c.c_idx and
	            c.c_branch = @in_c_branch
	            group by t_class, t_week
	        ) AA 
	        group by t_class, s_t_time, e_t_time
	    ) aa
	    group by t_class
	) tt on tc.c_idx = tt.t_class
	where 
	c_branch = @in_c_branch
	AND (@IN_GRADE = '' or TC.C_GRADE = @IN_GRADE) 
	AND (@IN_STAFF = '' or TC.C_TEACHER = @IN_STAFF) 
	AND (@IN_KWAMOK = '' or TC.C_KWAMOK = @IN_KWAMOK)
	AND (@IN_REGULAR = '' or TC.C_REGULAR = @IN_REGULAR)
	AND (@IN_SCHEDULE_TYPE = '' or TC.C_TIME_MEMBER_YN = @IN_SCHEDULE_TYPE)
	AND (@IN_LMS = '' or TC.C_LMS = @IN_LMS)
	AND TC.C_NAME LIKE concat('%', @IN_CLASS_NAME, '%')
) AAA 
WHERE AAA.C_IDX IS NOT NULL
AND (case when @IN_LIVE='' then 'YNF' ELSE @IN_LIVE END) like CONCAT('%', C_STATUS, '%')
ORDER BY C_CATEGORY, C_NAME

				""";
		
		return sql;
	}
}
