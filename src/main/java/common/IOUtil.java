package common;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

public class IOUtil {
	/**
	 * 해당 디렉토리-파일명에 해당하는 파일객체를 구한다.<br>
	 * 만약 디렉토리가 존재하지 않으면 새로 생성하며, 겹쳐쓰기가 false 일 때 파일이 존재하면 Exception을 던짐.
	 *
	 * @param dir
	 *            디렉토리 경로명으로 null이나 공백이면 현재 디렉토리(.)으로 지정됨
	 * @param fileName
	 *            파일명
	 * @param overwrite
	 *            파일이 존재할 경우 겹쳐쓰기 여부 지정
	 * @return
	 * @throws Exception
	 *             파일명이 null 또는 공백, 디렉토리 생성 불가시,
	 */
	public static File getFile(String dir, String fileName, boolean overwrite)
			throws Exception {
		if (dir == null || dir.trim().equals("")) {
			dir = ".";
		}
		if (fileName == null || fileName.trim().equals("")) {
			throw new Exception("(IOUtil) 파일명이 null 또는 공백입니다!");
		}

		File file = null;

		/*
		 * 1. 지정된 디렉토기가 없으면 생성함
		 */
		File dirObj = new File(dir); // 지정된 디렉토기가 없으면 생성함
		if (!dirObj.exists()) {
			boolean isMade = dirObj.mkdirs();
			if (!isMade) {
				throw new Exception("디렉토리 '" + dir + "' 을 생성할 수 없음!");
			}
		}

		file = new File(dir, fileName);
		if (file.isDirectory()) {
			throw new Exception("파일 '" + fileName + "'의 디렉토리가 존재함!");
		}
		if (!overwrite && file.exists()) {
			file = null;
			throw new Exception("파일 '" + fileName + "'이 존재하며 겹쳐쓰기 안됨!");
		}
		if (file.exists()) {
			file.delete();
		}

		try {
			file.createNewFile();
		} catch (Exception e) {
			file = null;
			throw new Exception("'" + fileName + "' 파일객체를 생성할 수 없음!");
		}
		if (!file.canRead() || !file.canWrite()) {
			file = null;
			throw new Exception("파일 '" + fileName + "' 에 접근할 수 없음!");
		}

		return file;
	}

	/**
	 * 현재 시스템이 유닉스(리눅스) 시스템인지 검사한다.
	 *
	 * @return 현재 시스템이 유닉스(리눅스)이면 true를 반환
	 */
	public static boolean isUnix() {
		if (File.separatorChar == '/')
			return true;
		return false;
	}

	public static String getOS(){
		String os = System.getProperty("os.name");
		String type ="L";
		if(os.startsWith("Windows")){
			type ="W";
		}else if(os.startsWith("Mac")){
			type="M";
		}else if(os.startsWith("Linux")){
			type="L";
		}
		return type;
	}


	public static String getTmpDir(){
		return System.getProperty("java.io.tmpdir");
//		return "/home";
	}

	/**
	 * 파일객체의 정보를 문자열로 반환
	 *
	 * @param file
	 *            정보를 추출할 파일객체
	 * @return 파일객체의 정보 문자열
	 */
	public static String fileInfo(File file) {
		if (file == null) {
			return "File object is null!";
		}

		StringBuffer sbuf = new StringBuffer("\n");
		sbuf.append("File object {\n");
		sbuf.append("    abs-path = '").append(file.getAbsolutePath())
				.append("',\n");
		sbuf.append("     is dir. = '").append(file.isDirectory())
				.append("',\n");
		sbuf.append("     is file = '").append(file.isFile()).append("',\n");
		sbuf.append("   is hidden = '").append(file.isHidden()).append("',\n");
		sbuf.append("    is exist = '").append(file.exists()).append("',\n");
		sbuf.append("    can read = '").append(file.canRead()).append("',\n");
		sbuf.append("   can write = '").append(file.canWrite()).append("'.\n");
		sbuf.append("} //end of File object\n");
		return sbuf.toString();
	}

	
	@SuppressWarnings("null")
	public static List<String> getFileLines(File file){
		
		List<String> lines = new ArrayList<String>();
		
		try (BufferedReader br = new BufferedReader(new FileReader(file))) {
		    String line;
		    while ((line = br.readLine()) != null) {
		    	lines.add(line);
		    }
		} catch (IOException e) {
		    e.printStackTrace();
		}
		
		return lines;
	}

	public static void main(String[] args){
		System.out.println(IOUtil.getTmpDir());
	}
}
