package com.example.fasomarket.config;

import com.example.fasomarket.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtService jwtService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        
        // Exclure les endpoints publics
        if (path.startsWith("/api/auth/") || path.startsWith("/api/public/")) {
            return true;
        }
        
        String token = request.getHeader("Authorization");
        String userId = request.getHeader("X-User-Id");
        
        // Permettre X-User-Id pour les endpoints client et vendeur (développement)
        if (userId != null && !userId.isEmpty() && 
            (path.startsWith("/api/client/") || path.startsWith("/api/vendeur/"))) {
            return true;
        }
        
        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatus(403);
            return false;
        }
        
        try {
            String jwt = token.substring(7);
            String roleFromToken = jwtService.extractRole(jwt);
            
            // Vérifier l'accès admin
            if (path.startsWith("/api/admin/")) {
                if (!"ADMIN".equals(roleFromToken)) {
                    response.setStatus(403);
                    return false;
                }
            }
            
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            return false;
        }
    }
}