package com.jhsoft.jeamsp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;

//@ComponentScan(basePackages="com.jhsoft.jeamsp")

@SpringBootApplication
public class jEamspApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(jEamspApplication.class, args);
	}
	
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(jEamspApplication.class);
	}
}
