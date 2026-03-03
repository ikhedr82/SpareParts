/*
  Warnings:

  - You are about to drop the column `user_id` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `return_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `returns` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `returns` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[parent_return_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[return_id]` on the table `refunds` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refund_number]` on the table `refunds` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[delivery_exception_id]` on the table `returns` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[return_number]` on the table `returns` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refund_number` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Made the column `reason` on table `refunds` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `requested_by` to the `returns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `return_number` to the `returns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `returns` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeliveryExceptionType" AS ENUM ('CUSTOMER_UNAVAILABLE', 'ADDRESS_INCORRECT', 'REFUSED_DELIVERY', 'DAMAGED_IN_TRANSIT', 'LOST_IN_TRANSIT', 'ACCESS_DENIED', 'WEATHER_DELAY', 'OTHER');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('WRONG_ITEM', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'CUSTOMER_CHANGED_MIND', 'DAMAGED_IN_DELIVERY', 'QUALITY_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'RECEIVED', 'INSPECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_sale_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_user_id_fkey";

-- DropForeignKey
ALTER TABLE "return_items" DROP CONSTRAINT "return_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "returns" DROP CONSTRAINT "returns_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "returns" DROP CONSTRAINT "returns_sale_id_fkey";

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "allocated" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "parent_return_id" TEXT;

-- AlterTable
ALTER TABLE "packs" ADD COLUMN     "device_info" TEXT;

-- AlterTable
ALTER TABLE "pick_lists" ADD COLUMN     "assigned_to_id" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "exchange_rate" DECIMAL(10,4) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "refunds" DROP COLUMN "user_id",
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "cancelled_by" TEXT,
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "processed_at" TIMESTAMP(3),
ADD COLUMN     "processed_by" TEXT,
ADD COLUMN     "refund_number" TEXT NOT NULL,
ADD COLUMN     "return_id" TEXT,
ADD COLUMN     "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "branch_id" DROP NOT NULL,
ALTER COLUMN "sale_id" DROP NOT NULL,
ALTER COLUMN "reason" SET NOT NULL;

-- AlterTable
ALTER TABLE "return_items" DROP COLUMN "created_at",
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "inspection_notes" TEXT,
ADD COLUMN     "order_item_id" TEXT,
ADD COLUMN     "restockable" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "product_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "returns" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "delivery_exception_id" TEXT,
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "reason_notes" TEXT,
ADD COLUMN     "received_at" TIMESTAMP(3),
ADD COLUMN     "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "requested_by" TEXT NOT NULL,
ADD COLUMN     "return_number" TEXT NOT NULL,
ADD COLUMN     "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
ALTER COLUMN "branch_id" DROP NOT NULL,
ALTER COLUMN "sale_id" DROP NOT NULL,
DROP COLUMN "reason",
ADD COLUMN     "reason" "ReturnReason" NOT NULL;

-- CreateTable
CREATE TABLE "substitutions" (
    "id" TEXT NOT NULL,
    "product_a_id" TEXT NOT NULL,
    "product_b_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INTERCHANGEABLE',
    "confidence_score" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "substitutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_receipts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by_id" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "purchase_order_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_receipt_items" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "accepted_unit_cost" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "purchase_order_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_suppliers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "supplier_sku" TEXT,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "is_preferred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_exceptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "trip_stop_id" TEXT NOT NULL,
    "exception_type" "DeliveryExceptionType" NOT NULL,
    "description" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolution_type" TEXT,
    "resolution_notes" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "delivery_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "substitutions_product_a_id_product_b_id_key" ON "substitutions"("product_a_id", "product_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_supplier_id_product_id_key" ON "product_suppliers"("supplier_id", "product_id");

-- CreateIndex
CREATE INDEX "delivery_exceptions_tenant_id_idx" ON "delivery_exceptions"("tenant_id");

-- CreateIndex
CREATE INDEX "delivery_exceptions_trip_stop_id_idx" ON "delivery_exceptions"("trip_stop_id");

-- CreateIndex
CREATE INDEX "delivery_exceptions_resolved_idx" ON "delivery_exceptions"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "orders_parent_return_id_key" ON "orders"("parent_return_id");

-- CreateIndex
CREATE INDEX "pick_lists_assigned_to_id_idx" ON "pick_lists"("assigned_to_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_return_id_key" ON "refunds"("return_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_refund_number_key" ON "refunds"("refund_number");

-- CreateIndex
CREATE INDEX "refunds_order_id_idx" ON "refunds"("order_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "refunds_refund_number_idx" ON "refunds"("refund_number");

-- CreateIndex
CREATE INDEX "return_items_return_id_idx" ON "return_items"("return_id");

-- CreateIndex
CREATE INDEX "return_items_order_item_id_idx" ON "return_items"("order_item_id");

-- CreateIndex
CREATE INDEX "return_items_product_id_idx" ON "return_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "returns_delivery_exception_id_key" ON "returns"("delivery_exception_id");

-- CreateIndex
CREATE UNIQUE INDEX "returns_return_number_key" ON "returns"("return_number");

-- CreateIndex
CREATE INDEX "returns_tenant_id_idx" ON "returns"("tenant_id");

-- CreateIndex
CREATE INDEX "returns_order_id_idx" ON "returns"("order_id");

-- CreateIndex
CREATE INDEX "returns_sale_id_idx" ON "returns"("sale_id");

-- CreateIndex
CREATE INDEX "returns_status_idx" ON "returns"("status");

-- CreateIndex
CREATE INDEX "returns_return_number_idx" ON "returns"("return_number");

-- AddForeignKey
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_product_a_id_fkey" FOREIGN KEY ("product_a_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_product_b_id_fkey" FOREIGN KEY ("product_b_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipts" ADD CONSTRAINT "purchase_order_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipt_items" ADD CONSTRAINT "purchase_order_receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "purchase_order_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_receipt_items" ADD CONSTRAINT "purchase_order_receipt_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_parent_return_id_fkey" FOREIGN KEY ("parent_return_id") REFERENCES "returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_exceptions" ADD CONSTRAINT "delivery_exceptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_exceptions" ADD CONSTRAINT "delivery_exceptions_trip_stop_id_fkey" FOREIGN KEY ("trip_stop_id") REFERENCES "trip_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_delivery_exception_id_fkey" FOREIGN KEY ("delivery_exception_id") REFERENCES "delivery_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
