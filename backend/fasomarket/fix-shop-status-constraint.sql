-- Script pour corriger la contrainte de statut des boutiques
-- Exécuter dans PostgreSQL

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE shops DROP CONSTRAINT IF EXISTS shops_status_check;

-- Ajouter la nouvelle contrainte avec tous les statuts valides
ALTER TABLE shops ADD CONSTRAINT shops_status_check 
CHECK (status IN ('BROUILLON', 'EN_ATTENTE_APPROBATION', 'ACTIVE', 'REJETEE', 'SUSPENDUE'));

-- Vérifier les statuts existants
SELECT status, COUNT(*) FROM shops GROUP BY status;

-- Mettre à jour les statuts invalides s'il y en a
UPDATE shops SET status = 'EN_ATTENTE_APPROBATION' WHERE status NOT IN ('BROUILLON', 'EN_ATTENTE_APPROBATION', 'ACTIVE', 'REJETEE', 'SUSPENDUE');