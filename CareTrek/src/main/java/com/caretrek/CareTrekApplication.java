package com.caretrek;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CareTrekApplication {
    public static void main(String[] args) {
        SpringApplication.run(CareTrekApplication.class, args);
    }
}
