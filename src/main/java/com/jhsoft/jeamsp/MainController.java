package com.jhsoft.jeamsp;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import com.jhsoft.jeamsp.data.classData;

@Controller
public class MainController {
    @RequestMapping(value="/")
    public String main() {
        return "index";
    }
    
    @RequestMapping(value="/index")
    public String index() {
        return "index";
    }
    
    @RequestMapping(value="/student1")
    public String student1() {
        return "student1";
    }
    
    @RequestMapping(value="/student2")
    public String student2(Model model) 
    {
    	HashMap<String, Object> resultMap;
    	
		try 
		{
			resultMap = classData.getStudent();
			
			System.out.println("OK. getStudent." + Integer.toString(resultMap.size()));
			
	    	model.addAttribute("studentlist", resultMap.get("studentlist"));
	    	model.addAttribute("total", resultMap.get("total"));
		} 
		catch (Exception e) 
		{
			System.out.println("ERROR. " + e.getMessage());
			
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	
        return "student2";
    }
}
