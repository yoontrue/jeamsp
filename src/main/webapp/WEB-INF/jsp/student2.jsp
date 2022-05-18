<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<script type="text/javascript" src="/js/jquery-1.10.2.min.js" charset="utf-8"></script>

<script type="text/javascript">
</script>

</head>
<body>

	<div>
		<table border="1">
			<tr>
				<td>No</td>
				<td>이름</td>
				<td>학년</td>
				<td>학교</td>
				<td>학번</td>		
			</tr>
			<c:forEach items="${studentlist}" var="list">
				<tr>
					<td>${list.SEQ }</td>
					<td>${list.M_NAME }</td>
					<td>${list.M_GRADE_NAME }</td>
					<td>${list.M_SCHOOL }</td>
					<td>${list.STU_NO }</td>
				</tr>
			</c:forEach>
		</table>
	</div>
	
	<div style="margin-top:10px">
		<table border="1">
			<tr>
				<td>전체인원</td>
				<td>신입</td>	
			</tr>
			
			<tr>
				<td>${total[0].INWON }</td>
				<td>${total[0].SINIP }</td>
			</tr>

		</table>
	</div>
</body>
</html>