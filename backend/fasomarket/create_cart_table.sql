CREATE TABLE IF NOT EXISTS cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(client_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_client ON cart(client_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart(product_id);
