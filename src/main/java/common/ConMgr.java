package common;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.springframework.stereotype.Component;

public class ConMgr {
	private static ConMgr instance;
	private static CommonProperties property = null;

	public static String usrId = null;
	public static String usrPwd = null;
 
	public static synchronized ConMgr getInstance() {
		if (instance == null) {

			property = CommonProperties.getInstance();
			instance = new ConMgr();
		}

		return instance;
	}

	// oracle
	public Connection getConnection() throws Exception {
		String dburl = property.get("dbUrl");
		String driver = property.get("dbDriverClassName");
		String dbuser = property.get("dbUserName");
		String dbpass = property.get("dbPassWord");

		Connection dbconn = null;
		try {
			Class.forName(driver);
			dbconn = DriverManager.getConnection(dburl, dbuser, dbpass);

		} catch (ClassNotFoundException e1) {
			e1.printStackTrace();
			throw new Exception("드라이버를 로딩할 수 없습니다 : " + e1.getMessage());
		} catch (SQLException e2) {
			e2.printStackTrace();
			throw new Exception("DATABASE에 연결할 수 없습니다 : " + e2.getMessage());
		}

		return dbconn;
	}

	public void freeConnection(Connection con) {
		try {
			if (con != null)
				con.close();
		} catch (SQLException e) {
		}
	}

	public void freeclient() {
	}
}
