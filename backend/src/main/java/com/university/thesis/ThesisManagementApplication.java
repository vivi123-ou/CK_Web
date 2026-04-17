package com.university.thesis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ThesisManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThesisManagementApplication.class, args);
    }
}
