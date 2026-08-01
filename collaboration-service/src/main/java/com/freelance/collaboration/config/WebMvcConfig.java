package com.freelance.collaboration.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve all static chat upload directories
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
