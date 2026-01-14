package com.example.fasomarket.dto;

import com.example.fasomarket.model.Role;
import java.util.UUID;

public class AuthResponse {
    private String token;
    private UUID userId;
    private String nomComplet;
    private String telephone;
    private String email;
    private Role role;
    private Boolean estActif;
    private Boolean estVerifie;

    public AuthResponse() {}

    public AuthResponse(String token, UUID userId, String nomComplet, String telephone, 
                       String email, Role role, Boolean estActif, Boolean estVerifie) {
        this.token = token;
        this.userId = userId;
        this.nomComplet = nomComplet;
        this.telephone = telephone;
        this.email = email;
        this.role = role;
        this.estActif = estActif;
        this.estVerifie = estVerifie;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getEstActif() { return estActif; }
    public void setEstActif(Boolean estActif) { this.estActif = estActif; }

    public Boolean getEstVerifie() { return estVerifie; }
    public void setEstVerifie(Boolean estVerifie) { this.estVerifie = estVerifie; }
}