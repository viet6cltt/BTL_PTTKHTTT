
package com.training.logistics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class TrainingLogisticsApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrainingLogisticsApplication.class, args);
    }
}
