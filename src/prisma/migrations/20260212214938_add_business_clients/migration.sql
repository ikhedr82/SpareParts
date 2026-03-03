-- CreateEnum
CREATE TYPE "BusinessClientType" AS ENUM ('WORKSHOP', 'RETAILER');

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "business_client_id" TEXT;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "business_client_id" TEXT;

-- CreateTable
CREATE TABLE "business_clients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "BusinessClientType" NOT NULL,
    "business_name" TEXT NOT NULL,
    "registration_number" TEXT,
    "tax_id" TEXT,
    "primary_email" TEXT,
    "primary_phone" TEXT,
    "credit_limit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "current_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_terms_days" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_client_contacts" (
    "id" TEXT NOT NULL,
    "business_client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "can_place_orders" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_client_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_client_addresses" (
    "id" TEXT NOT NULL,
    "business_client_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Egypt',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_client_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_clients_tenant_id_idx" ON "business_clients"("tenant_id");

-- CreateIndex
CREATE INDEX "business_clients_tenant_id_type_idx" ON "business_clients"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "business_clients_tenant_id_status_idx" ON "business_clients"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "business_client_contacts_business_client_id_idx" ON "business_client_contacts"("business_client_id");

-- CreateIndex
CREATE INDEX "business_client_addresses_business_client_id_idx" ON "business_client_addresses"("business_client_id");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_business_client_id_fkey" FOREIGN KEY ("business_client_id") REFERENCES "business_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_client_id_fkey" FOREIGN KEY ("business_client_id") REFERENCES "business_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_clients" ADD CONSTRAINT "business_clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_client_contacts" ADD CONSTRAINT "business_client_contacts_business_client_id_fkey" FOREIGN KEY ("business_client_id") REFERENCES "business_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_client_addresses" ADD CONSTRAINT "business_client_addresses_business_client_id_fkey" FOREIGN KEY ("business_client_id") REFERENCES "business_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
