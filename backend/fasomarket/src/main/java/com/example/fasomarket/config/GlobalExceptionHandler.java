package com.example.fasomarket.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, Object>> errorResponse(
            HttpStatus status,
            String code,
            String message,
            Object details) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("message", message);
        response.put("details", details == null ? Map.of() : details);
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        return errorResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Erreurs de validation",
                errors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String param = ex.getParameter().getParameterName();
        if ("X-User-Id".equals(param)) {
            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_USER_ID",
                    "ID utilisateur invalide",
                    Map.of("param", param));
        }
        return errorResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_PARAMETER",
                "Parametre invalide",
                Map.of("param", param));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String rootMessage = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        return errorResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_JSON_BODY",
                "Corps de requete invalide",
                Map.of("error", rootMessage));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        return errorResponse(
                HttpStatus.BAD_REQUEST,
                "BUSINESS_ERROR",
                ex.getMessage(),
                Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        return errorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                "Erreur interne serveur",
                Map.of("error", ex.getClass().getSimpleName()));
    }
}
