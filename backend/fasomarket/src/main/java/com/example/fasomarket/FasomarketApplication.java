package com.example.fasomarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FasomarketApplication {

	public static void main(String[] args) {
		SpringApplication.run(FasomarketApplication.class, args);
		System.out.println("🚀 FasoMarket API démarrée!");
		System.out.println("📖 Swagger UI: http://localhost:8081/swagger-ui.html");
		System.out.println("🔗 API Docs: http://localhost:8081/v3/api-docs");
		System.out.println("📊 H2 Console: http://localhost:8081/h2-console");
	}
}
