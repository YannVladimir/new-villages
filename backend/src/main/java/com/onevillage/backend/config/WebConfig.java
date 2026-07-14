package com.onevillage.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.uploads.dir}")
    private String uploadsDir;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadsDir.endsWith("/") ? uploadsDir : uploadsDir + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + location);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**").allowedOrigins(allowedOrigins.split(","));
    }
}
