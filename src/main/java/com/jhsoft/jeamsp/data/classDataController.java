package com.jhsoft.jeamsp.data;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class classDataController {

	@RequestMapping(value="/student2/delete")
	public String delete(Model model) 
    {
        return "student2";
    }
}