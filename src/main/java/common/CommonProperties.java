package common;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Properties;

import org.springframework.stereotype.Component;

public class CommonProperties {
	/**
	 * 공통 설정파일 이름으로 파일명이 설정테이블(Hashtable)에서 key가 됨
	 */
	public static final String DEFAULT_PROPERTY_FILE_NAME = "db.properties";

	/**
	 * 설정파일이 로드되어 설정테이블(Hashtable)에 저장될때, 읽어들인 파일의 최종수정시각도 같이 설정테이블(Hashtable)에
	 * 저장되며 이때 '설정파일명+.modified' 문자열이 키가되어 저장
	 */
	public static final String KEY_EXT_MODIFIED = ".modified";

	/**
	 * 공통 설정파일의 정보를 담고 있는 객체
	 */
	private static CommonProperties commonProperties = null;
	/**
	 * 모든 설정파일의 정보를 {키, 설정파일객체} 형으로 담고 있는 해시테이블로 키는 파일명(예, common.properties)과
	 * 파일 최종수정시각(common.properties.modified)을 사용함. 위의 '공통 설정파일 객체'도 넣음.
	 */
	private static Hashtable propertiesTable = null;

	/**
	 * 현재 객체를 반환(Sigleton)
	 *
	 * @return 현재 객체
	 */
	
	public static synchronized CommonProperties getInstance() {
		if (commonProperties == null) {
			try {
				commonProperties = new CommonProperties();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return commonProperties;
	}

	/**
	 * 내부 생성자
	 */
	private CommonProperties() throws Exception {
		if (propertiesTable == null) {
			propertiesTable = new Hashtable();
		}

		if (propertiesTable.containsKey(DEFAULT_PROPERTY_FILE_NAME)) {
			propertiesTable.remove(DEFAULT_PROPERTY_FILE_NAME);
			propertiesTable.remove(DEFAULT_PROPERTY_FILE_NAME + KEY_EXT_MODIFIED);
		}

		commonProperties = null; // 다시 로드할수 있음.

		// 아래 ./config/common.properties
		boolean isLoaded = false;
		try {
			isLoaded = loadProperties(DEFAULT_PROPERTY_FILE_NAME);
			if (!isLoaded)
				throw new Exception();
		} catch (Exception e) {
			throw new Exception("공통 설정파일 로드하는 도중에 에러발생!", e);
		}
	}

	/**
	 * 공통 설정파일에서 해당 키(파일명)에 프라퍼티 파일을 로드한다.
	 *
	 * @param key
	 *            공통 설정파일에 존재하는 키문자열
	 * @return 해당 설정파일을 로드하면 true를 반환
	 */
	public boolean load(String key) throws Exception {
		boolean isLoaded = false;

		try {
			String fileName = get(key); // 공통 설정파일에서 해당 키(파일명)의 값을 읽는다.
			if (fileName == null || fileName.trim().equals(""))
				throw new Exception("설정파일 이름 오류! '(" + fileName + "'");

			isLoaded = loadProperties(fileName);
			if (!isLoaded) {
				throw new Exception("설정파일 객체 초기화 오류!");
			}
		} catch (Exception ae) {
			throw ae;
		}

		return isLoaded;
	}

	/**
	 * 해당 설정파일의 설정내용을 프라퍼티객체로 로드하여 propertiesTable에 추가한다.
	 *
	 * @param fileName
	 *            설정파일 이름(디렉토리경로는 제외)
	 * @return 해당 설정파일을 로드하면 true를 반환
	 */
	public boolean loadProperties(String fileName) throws Exception {
		boolean bool = false;
		Properties properties = null;

		try 
		{
			// 디비 설정파일이 존재하는 디렉토리
			String thisPath = this.getClass().getResource("").getPath().replace("%20", " ");
			
			System.out.println("OK. property file path." + thisPath);
			
			File file = new File(thisPath + File.separator + "Config" + File.separator + fileName);
			
			if (!file.exists() || !file.canRead() || !file.isFile()) {
				System.out.println("[오류] 설정파일!" + IOUtil.fileInfo(file) + "'");
				throw new Exception("cannot access the property file '" + fileName + "'");
			}

			properties = new Properties();
			properties.load(new FileInputStream(file));

			propertiesTable.put(fileName, properties);
			propertiesTable.put(fileName + KEY_EXT_MODIFIED, new Long(file.lastModified()));

			bool = true;
			System.out.println("OK. property file loaded." + IOUtil.fileInfo(file));
		} catch (Exception ae) {
			throw ae;
		}

		return bool;
	}

	/**
	 * 공통 설정파일의 해당 키에 해당하는 값을 문자열로 반환
	 *
	 * @param key
	 *            찾으려는 키문자열
	 * @return key에 대응하는 값문자열
	 */
	public String get(String key) {
		return get(key, "");
	}

	/**
	 * 공통 설정파일의 해당 키에 해당하는 값을 문자열로 반환
	 *
	 * @param key
	 *            찾으려는 키문자열
	 * @param defaultValue
	 *            없을경우 사용할 디폴트값
	 * @return key에 대응하는 값문자열 또는 디폴트값
	 */
	public String get(String key, String defaultValue) {
		return ((Properties) propertiesTable.get(DEFAULT_PROPERTY_FILE_NAME)).getProperty(key, defaultValue);
	}

	public int getInt(String key) {
		return getInt(key, 1);
	}

	/**
	 * 공통 설정파일의 해당 키에 해당하는 값의 정수 값을 반환
	 *
	 * @param key
	 *            찾으려는 키문자열
	 * @param defaultValue
	 *            없을 경우 사용할 디폴트 정수 값
	 * @return key에 대응하는 정수 값 또는 디폴트 정수 값
	 */
	public int getInt(String key, int defaultValue) {
		String tmp = null;
		String defVal = "" + defaultValue;
		int result = -1;

		try {
			tmp = ((Properties) propertiesTable.get(DEFAULT_PROPERTY_FILE_NAME)).getProperty(key, defVal);
			result = Integer.parseInt(tmp);
		} catch (Exception e) {
			result = defaultValue;
		}
		return result;
	}

	/**
	 * 공통 설정파일의 해당 키에 해당하는 값의 boolean 값을 반환 값 문자열이 대소문자를 무시하고, true/on/yes/y/1
	 * 이면 참(true)을 반환
	 *
	 * @param key
	 *            찾으려는 키문자열
	 * @param defaultValue
	 *            없을 경우 사용할 디폴트 boolean 값
	 * @return key에 대응하는 boolean 값 또는 디폴트 boolean 값
	 */
	public boolean getBool(String key, boolean defaultValue) {
		String tmp = null;
		String defVal = "" + defaultValue;
		boolean result = defaultValue;

		try {
			tmp = ((Properties) propertiesTable.get(DEFAULT_PROPERTY_FILE_NAME)).getProperty(key, defVal);
			if (tmp.equalsIgnoreCase("true") || tmp.equalsIgnoreCase("on") || tmp.equalsIgnoreCase("yes") || tmp.equalsIgnoreCase("y")
					|| tmp.equals("1"))
				result = true;
			else
				result = false;
		} catch (Exception e) {
			result = defaultValue;
		}
		return result;
	}

	/**
	 * 설정 객체테이블(propertiesTable)에서 해당 키의 설정객체(Properties)를 찾아 반환
	 *
	 * @param key
	 *            찾으려는 설정객체의 키문자열
	 * @return key에 대응하는 설정객체
	 */
	public Properties getProperties(String key) throws Exception {
		Properties p = null;
		try {
			p = (Properties) propertiesTable.get(key);
		} catch (Exception e) {
			throw new Exception("키 '" + key + "'에 해당하는 프라퍼티객체가 없음!", e);
		}

		return p;
	}

	/**
	 * 설정 객체테이블(propertiesTable)에서 '공통 설정객체'(commonProperties)'를 찾아 반환
	 *
	 * @return 공통 설정객체'(commonProperties)
	 */
	public Properties getProperties() throws Exception {
		return getProperties(DEFAULT_PROPERTY_FILE_NAME);
	}

	/**
	 * 설정 객체테이블(propertiesTable)에서 해당 키의 설정객체(Properties)의 최종수정일시를 긴정수형으로 반환
	 *
	 * @param key
	 *            찾으려는 설정객체의 키문자열
	 * @return 해당 설정객체(파일)의 최종수정일시
	 */
	public long getPropertiesModified(String key) throws Exception {
		Long l = null;
		try {
			l = (Long) propertiesTable.get(key + KEY_EXT_MODIFIED);
		} catch (Exception e) {
			throw new Exception("키 '" + key + "'에 해당하는 프라퍼티객체가 없음!", e);
		}

		return l.longValue();
	}

	/**
	 * 설정 객체테이블(propertiesTable)에서 '공통 설정객체(commonProperties)'의 최종수정일시를 긴정수형으로
	 * 반환
	 *
	 * @return '공통 설정객체(commonProperties)'(파일)의 최종수정일시
	 */
	public long getPropertiesModified() throws Exception {
		return getPropertiesModified(DEFAULT_PROPERTY_FILE_NAME);
	}

	/**
	 * 기타 설정파일의 해당 키에 해당하는 값을 문자열로 반환
	 *
	 * @param propertieKey
	 *            찾으려는 설정파일객체의 키문자열
	 * @param key
	 *            찾으려는 키문자열
	 * @return key에 대응하는 값문자열
	 */
	public String get2(String propertieKey, String key) throws Exception {
		return getProperties(propertieKey).getProperty(key);
	}

	/**
	 * 설정파일들을 다시 로드함
	 *
	 */
	public void reload() {
		if (propertiesTable == null || propertiesTable.size() == 0) {
			try {
				commonProperties = new CommonProperties();
			} catch (Exception e) {
				e.printStackTrace();
			}
			return;
		}

		ArrayList arrList = new ArrayList();
		Enumeration keys = propertiesTable.keys();
		for (; keys.hasMoreElements();) {
			String key = (String) keys.nextElement();
			// 공통 설정파일은 생성자에서 로드함
			if (key.endsWith(".properties") && !key.equals(DEFAULT_PROPERTY_FILE_NAME)) {
				System.out.println("#key : " + key);
				arrList.add(key);
			}
		}

		commonProperties = null;
		propertiesTable.clear();
		propertiesTable = null;

		try {
			try {
				commonProperties = new CommonProperties();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println("# 공통설정파일을 다시 로드함.");

		try {
			for (int i = 0; i < arrList.size(); i++) {
				String key = (String) arrList.get(i);
				try {
					this.load(key);
				} catch (Exception e) {
					e.printStackTrace();
				}
				System.out.println("#key : " + key + " 다시 로드함.");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// ----------------------------------------------------------------------------------------------//
	// ----------------------------------------------------------------------------------------------//
	public static void main(String[] args) {
		CommonProperties cp = CommonProperties.getInstance();
		System.out.println("src.home : " + cp.get("src.home"));

		try {
			System.out.println("getPropertiesModified : " + cp.getPropertiesModified());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			System.out.println("getPropertiesModified : " + DateUtil.getDateTime(cp.getPropertiesModified(), null));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		cp.reload();
		System.out.println("load() : " + cp.get("build.properties", "aaa"));
		try {
			System.out.println("getProperties() : " + cp.getProperties());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
