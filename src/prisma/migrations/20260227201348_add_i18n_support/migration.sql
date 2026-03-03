/*
  Warnings:

  - You are about to drop the column `parent_return_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_by` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `processed_by` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `product_a_id` on the `substitutions` table. All the data in the column will be lost.
  - You are about to drop the column `product_b_id` on the `substitutions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[return_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[delivery_exception_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[delivery_exception_id]` on the table `refunds` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,refund_number]` on the table `refunds` will be added. If there are existing duplicate values, this will fail.
  - Made the column `reference_id` on table `inventory_ledger` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `created_by_id` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Made the column `branch_id` on table `refunds` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `original_product_id` to the `substitutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `substitute_product_id` to the `substitutions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubstitutionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "PriceRuleType" AS ENUM ('MARKUP', 'MARGIN', 'FIXED', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "PurchaseReturnStatus" AS ENUM ('DRAFT', 'REQUESTED', 'APPROVED', 'SHIPPED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('EN', 'AR');

-- CreateEnum
CREATE TYPE "ChargebackStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "BranchTransferStatus" AS ENUM ('REQUESTED', 'APPROVED', 'SHIPPED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupplierInvoiceStatus" AS ENUM ('PENDING', 'MATCHED', 'MISMATCHED', 'POSTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ManifestStatus" AS ENUM ('DRAFT', 'SEALED', 'DISPATCHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaxFilingStatus" AS ENUM ('DRAFT', 'FILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "DeliveryTripStatus" ADD VALUE 'RETURNED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InventoryReferenceType" ADD VALUE 'ORDER';
ALTER TYPE "InventoryReferenceType" ADD VALUE 'DELIVERY_TRIP';
ALTER TYPE "InventoryReferenceType" ADD VALUE 'RETURN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InventoryTransactionType" ADD VALUE 'ALLOCATION';
ALTER TYPE "InventoryTransactionType" ADD VALUE 'COMMIT';
ALTER TYPE "InventoryTransactionType" ADD VALUE 'DEALLOCATION';
ALTER TYPE "InventoryTransactionType" ADD VALUE 'RETURN';
ALTER TYPE "InventoryTransactionType" ADD VALUE 'VOID_REVERSAL';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PARTIALLY_FULFILLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PurchaseOrderStatus" ADD VALUE 'PARTIALLY_RECEIVED';
ALTER TYPE "PurchaseOrderStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_parent_return_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "substitutions" DROP CONSTRAINT "substitutions_product_a_id_fkey";

-- DropForeignKey
ALTER TABLE "substitutions" DROP CONSTRAINT "substitutions_product_b_id_fkey";

-- DropIndex
DROP INDEX "business_clients_tenant_id_type_idx";

-- DropIndex
DROP INDEX "orders_parent_return_id_key";

-- DropIndex
DROP INDEX "refunds_order_id_idx";

-- DropIndex
DROP INDEX "refunds_refund_number_idx";

-- DropIndex
DROP INDEX "refunds_refund_number_key";

-- DropIndex
DROP INDEX "refunds_status_idx";

-- DropIndex
DROP INDEX "substitutions_product_a_id_product_b_id_key";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "correlation_id" TEXT;

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "name_ar" TEXT;

-- AlterTable
ALTER TABLE "business_clients" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "payment_terms" TEXT,
ADD COLUMN     "price_tier_id" TEXT;

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "cash_sessions" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "chart_of_accounts" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "delivery_trips" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "inventory_ledger" ADD COLUMN     "revenue_amount" DECIMAL(10,2),
ALTER COLUMN "reference_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "parent_return_id",
ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "delivery_exception_id" TEXT,
ADD COLUMN     "return_id" TEXT,
ADD COLUMN     "source_quote_id" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "pick_lists" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product_categories" ADD COLUMN     "name_ar" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "description_ar" TEXT,
ADD COLUMN     "name_ar" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "refunds" DROP COLUMN "cancelled_by",
DROP COLUMN "created_by",
DROP COLUMN "payment_method",
DROP COLUMN "processed_by",
ADD COLUMN     "cancelled_by_id" TEXT,
ADD COLUMN     "created_by_id" TEXT NOT NULL,
ADD COLUMN     "delivery_exception_id" TEXT,
ADD COLUMN     "processed_by_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "branch_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "returns" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "void_reason" TEXT;

-- AlterTable
ALTER TABLE "stripe_payments" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "substitutions" DROP COLUMN "product_a_id",
DROP COLUMN "product_b_id",
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "order_item_id" TEXT,
ADD COLUMN     "original_product_id" TEXT NOT NULL,
ADD COLUMN     "responded_at" TIMESTAMP(3),
ADD COLUMN     "status" "SubstitutionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "substitute_product_id" TEXT NOT NULL,
ADD COLUMN     "tenant_id" TEXT;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "default_language" "LanguageCode" NOT NULL DEFAULT 'EN',
ADD COLUMN     "supported_languages" "LanguageCode"[] DEFAULT ARRAY['EN', 'AR']::"LanguageCode"[],
ADD COLUMN     "suspension_reason" TEXT;

-- AlterTable
ALTER TABLE "trip_stops" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "exception_resolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "failure_reason" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "refund_items" (
    "id" TEXT NOT NULL,
    "refund_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refund_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_returns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "status" "PurchaseReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT,
    "rejection_reason" TEXT,
    "total_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_return_items" (
    "id" TEXT NOT NULL,
    "purchase_return_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PriceRuleType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "brand_id" TEXT,
    "category_id" TEXT,
    "product_id" TEXT,
    "business_client_id" TEXT,
    "price_tier_id" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "quote_number" TEXT NOT NULL,
    "business_client_id" TEXT,
    "customer_name" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "valid_until" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "line_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "commit_ledger_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proof_of_delivery" (
    "id" TEXT NOT NULL,
    "trip_stop_id" TEXT NOT NULL,
    "signer_name" TEXT,
    "signature_url" TEXT,
    "photo_url" TEXT,
    "notes" TEXT,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,

    CONSTRAINT "proof_of_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chargebacks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ChargebackStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "return_id" TEXT,
    "delivery_exception_id" TEXT,

    CONSTRAINT "chargebacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "correlation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_body" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_to_warehouse" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "stop_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "received_at" TIMESTAMP(3),
    "received_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "return_to_warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_transfers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "source_branch_id" TEXT NOT NULL,
    "dest_branch_id" TEXT NOT NULL,
    "status" "BranchTransferStatus" NOT NULL DEFAULT 'REQUESTED',
    "requested_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "shipped_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "branch_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_transfer_items" (
    "id" TEXT NOT NULL,
    "branch_transfer_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "requested_qty" INTEGER NOT NULL,
    "shipped_qty" INTEGER NOT NULL DEFAULT 0,
    "received_qty" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortage_substitutions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "pick_list_item_id" TEXT NOT NULL,
    "original_product_id" TEXT NOT NULL,
    "substitute_product_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "status" "SubstitutionStatus" NOT NULL DEFAULT 'PENDING',
    "price_delta" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shortage_substitutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_fulfillment_lines" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "fulfilled_qty" INTEGER NOT NULL,
    "backordered_qty" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_fulfillment_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "supplier_id" TEXT,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "SupplierInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "mismatch_details" JSONB,
    "posted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoice_items" (
    "id" TEXT NOT NULL,
    "supplier_invoice_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chargeback_resolutions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "chargeback_id" TEXT NOT NULL,
    "resolved_by_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ledger_entry_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chargeback_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_filings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "total_vat_due" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "TaxFilingStatus" NOT NULL DEFAULT 'DRAFT',
    "filed_at" TIMESTAMP(3),
    "filed_by_id" TEXT,
    "report_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tax_filings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_manifests" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "manifest_ref" TEXT NOT NULL,
    "trip_id" TEXT,
    "status" "ManifestStatus" NOT NULL DEFAULT 'DRAFT',
    "sealed_at" TIMESTAMP(3),
    "dispatched_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shipment_manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifest_orders" (
    "id" TEXT NOT NULL,
    "shipment_manifest_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manifest_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "refund_items_refund_id_idx" ON "refund_items"("refund_id");

-- CreateIndex
CREATE INDEX "refund_items_order_item_id_idx" ON "refund_items"("order_item_id");

-- CreateIndex
CREATE INDEX "price_rules_tenant_id_idx" ON "price_rules"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quote_number_key" ON "quotes"("quote_number");

-- CreateIndex
CREATE INDEX "quotes_tenant_id_idx" ON "quotes"("tenant_id");

-- CreateIndex
CREATE INDEX "quote_items_quote_id_idx" ON "quote_items"("quote_id");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_ledger_commit_ledger_id_key" ON "revenue_ledger"("commit_ledger_id");

-- CreateIndex
CREATE UNIQUE INDEX "proof_of_delivery_trip_stop_id_key" ON "proof_of_delivery"("trip_stop_id");

-- CreateIndex
CREATE UNIQUE INDEX "chargebacks_return_id_key" ON "chargebacks"("return_id");

-- CreateIndex
CREATE UNIQUE INDEX "chargebacks_delivery_exception_id_key" ON "chargebacks"("delivery_exception_id");

-- CreateIndex
CREATE INDEX "chargebacks_tenant_id_idx" ON "chargebacks"("tenant_id");

-- CreateIndex
CREATE INDEX "chargebacks_order_id_idx" ON "chargebacks"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "chargebacks_tenant_id_order_id_return_id_delivery_exception_key" ON "chargebacks"("tenant_id", "order_id", "return_id", "delivery_exception_id");

-- CreateIndex
CREATE INDEX "outbox_events_tenant_id_idx" ON "outbox_events"("tenant_id");

-- CreateIndex
CREATE INDEX "outbox_events_status_idx" ON "outbox_events"("status");

-- CreateIndex
CREATE INDEX "idempotency_records_expires_at_idx" ON "idempotency_records"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_tenant_id_idempotency_key_key" ON "idempotency_records"("tenant_id", "idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "return_to_warehouse_stop_id_key" ON "return_to_warehouse"("stop_id");

-- CreateIndex
CREATE INDEX "return_to_warehouse_tenant_id_idx" ON "return_to_warehouse"("tenant_id");

-- CreateIndex
CREATE INDEX "return_to_warehouse_trip_id_idx" ON "return_to_warehouse"("trip_id");

-- CreateIndex
CREATE INDEX "branch_transfers_tenant_id_idx" ON "branch_transfers"("tenant_id");

-- CreateIndex
CREATE INDEX "branch_transfers_source_branch_id_idx" ON "branch_transfers"("source_branch_id");

-- CreateIndex
CREATE INDEX "branch_transfers_dest_branch_id_idx" ON "branch_transfers"("dest_branch_id");

-- CreateIndex
CREATE INDEX "branch_transfers_status_idx" ON "branch_transfers"("status");

-- CreateIndex
CREATE INDEX "branch_transfer_items_branch_transfer_id_idx" ON "branch_transfer_items"("branch_transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "shortage_substitutions_pick_list_item_id_key" ON "shortage_substitutions"("pick_list_item_id");

-- CreateIndex
CREATE INDEX "shortage_substitutions_tenant_id_idx" ON "shortage_substitutions"("tenant_id");

-- CreateIndex
CREATE INDEX "shortage_substitutions_pick_list_item_id_idx" ON "shortage_substitutions"("pick_list_item_id");

-- CreateIndex
CREATE INDEX "order_fulfillment_lines_order_id_idx" ON "order_fulfillment_lines"("order_id");

-- CreateIndex
CREATE INDEX "order_fulfillment_lines_order_item_id_idx" ON "order_fulfillment_lines"("order_item_id");

-- CreateIndex
CREATE INDEX "supplier_invoices_tenant_id_idx" ON "supplier_invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "supplier_invoices_purchase_order_id_idx" ON "supplier_invoices"("purchase_order_id");

-- CreateIndex
CREATE INDEX "supplier_invoices_status_idx" ON "supplier_invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_invoices_tenant_id_invoice_number_key" ON "supplier_invoices"("tenant_id", "invoice_number");

-- CreateIndex
CREATE INDEX "supplier_invoice_items_supplier_invoice_id_idx" ON "supplier_invoice_items"("supplier_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "chargeback_resolutions_chargeback_id_key" ON "chargeback_resolutions"("chargeback_id");

-- CreateIndex
CREATE INDEX "chargeback_resolutions_tenant_id_idx" ON "chargeback_resolutions"("tenant_id");

-- CreateIndex
CREATE INDEX "tax_filings_tenant_id_idx" ON "tax_filings"("tenant_id");

-- CreateIndex
CREATE INDEX "tax_filings_status_idx" ON "tax_filings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tax_filings_tenant_id_period_start_period_end_key" ON "tax_filings"("tenant_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "shipment_manifests_tenant_id_idx" ON "shipment_manifests"("tenant_id");

-- CreateIndex
CREATE INDEX "shipment_manifests_branch_id_idx" ON "shipment_manifests"("branch_id");

-- CreateIndex
CREATE INDEX "shipment_manifests_status_idx" ON "shipment_manifests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_manifests_tenant_id_manifest_ref_key" ON "shipment_manifests"("tenant_id", "manifest_ref");

-- CreateIndex
CREATE INDEX "manifest_orders_shipment_manifest_id_idx" ON "manifest_orders"("shipment_manifest_id");

-- CreateIndex
CREATE INDEX "manifest_orders_order_id_idx" ON "manifest_orders"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "manifest_orders_shipment_manifest_id_order_id_key" ON "manifest_orders"("shipment_manifest_id", "order_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_return_id_key" ON "orders"("return_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_delivery_exception_id_key" ON "orders"("delivery_exception_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_delivery_exception_id_key" ON "refunds"("delivery_exception_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_tenant_id_refund_number_key" ON "refunds"("tenant_id", "refund_number");

-- AddForeignKey
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_original_product_id_fkey" FOREIGN KEY ("original_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_substitute_product_id_fkey" FOREIGN KEY ("substitute_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_delivery_exception_id_fkey" FOREIGN KEY ("delivery_exception_id") REFERENCES "delivery_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_items" ADD CONSTRAINT "refund_items_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_items" ADD CONSTRAINT "refund_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_purchase_return_id_fkey" FOREIGN KEY ("purchase_return_id") REFERENCES "purchase_returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_rules" ADD CONSTRAINT "price_rules_business_client_id_fkey" FOREIGN KEY ("business_client_id") REFERENCES "business_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_rules" ADD CONSTRAINT "price_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_business_client_id_fkey" FOREIGN KEY ("business_client_id") REFERENCES "business_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_exception_id_fkey" FOREIGN KEY ("delivery_exception_id") REFERENCES "delivery_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_ledger" ADD CONSTRAINT "revenue_ledger_commit_ledger_id_fkey" FOREIGN KEY ("commit_ledger_id") REFERENCES "inventory_ledger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof_of_delivery" ADD CONSTRAINT "proof_of_delivery_trip_stop_id_fkey" FOREIGN KEY ("trip_stop_id") REFERENCES "trip_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chargebacks" ADD CONSTRAINT "chargebacks_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chargebacks" ADD CONSTRAINT "chargebacks_delivery_exception_id_fkey" FOREIGN KEY ("delivery_exception_id") REFERENCES "delivery_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chargebacks" ADD CONSTRAINT "chargebacks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chargebacks" ADD CONSTRAINT "chargebacks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_to_warehouse" ADD CONSTRAINT "return_to_warehouse_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfers" ADD CONSTRAINT "branch_transfers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_transfer_items" ADD CONSTRAINT "branch_transfer_items_branch_transfer_id_fkey" FOREIGN KEY ("branch_transfer_id") REFERENCES "branch_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortage_substitutions" ADD CONSTRAINT "shortage_substitutions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoice_items" ADD CONSTRAINT "supplier_invoice_items_supplier_invoice_id_fkey" FOREIGN KEY ("supplier_invoice_id") REFERENCES "supplier_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chargeback_resolutions" ADD CONSTRAINT "chargeback_resolutions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_filings" ADD CONSTRAINT "tax_filings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_manifests" ADD CONSTRAINT "shipment_manifests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_orders" ADD CONSTRAINT "manifest_orders_shipment_manifest_id_fkey" FOREIGN KEY ("shipment_manifest_id") REFERENCES "shipment_manifests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
