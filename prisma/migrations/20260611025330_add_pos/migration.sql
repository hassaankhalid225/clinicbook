-- CreateTable
CREATE TABLE "pos_products" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(60) NOT NULL DEFAULT 'General',
    "price_cents" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_sales" (
    "id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "sale_number" VARCHAR(40) NOT NULL,
    "patient_name" VARCHAR(120),
    "items" JSONB NOT NULL,
    "subtotal_cents" INTEGER NOT NULL,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "payment_method" VARCHAR(20) NOT NULL DEFAULT 'cash',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pos_products_doctor_id_idx" ON "pos_products"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "pos_sales_sale_number_key" ON "pos_sales"("sale_number");

-- CreateIndex
CREATE INDEX "pos_sales_doctor_id_created_at_idx" ON "pos_sales"("doctor_id", "created_at");

-- AddForeignKey
ALTER TABLE "pos_products" ADD CONSTRAINT "pos_products_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

