package com.example.fasomarket.dto;

public class StockInfoResponse {
    private int stockGlobal;
    private int stockVariantesTotal;
    private int stockDisponible;
    private boolean stockValide;

    public StockInfoResponse() {}

    public StockInfoResponse(int stockGlobal, int stockVariantesTotal, int stockDisponible) {
        this.stockGlobal = stockGlobal;
        this.stockVariantesTotal = stockVariantesTotal;
        this.stockDisponible = stockDisponible;
        this.stockValide = stockVariantesTotal <= stockGlobal;
    }

    // Getters et Setters
    public int getStockGlobal() { return stockGlobal; }
    public void setStockGlobal(int stockGlobal) { this.stockGlobal = stockGlobal; }

    public int getStockVariantesTotal() { return stockVariantesTotal; }
    public void setStockVariantesTotal(int stockVariantesTotal) { this.stockVariantesTotal = stockVariantesTotal; }

    public int getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(int stockDisponible) { this.stockDisponible = stockDisponible; }

    public boolean isStockValide() { return stockValide; }
    public void setStockValide(boolean stockValide) { this.stockValide = stockValide; }
}