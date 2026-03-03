/*
  Warnings:

  - You are about to drop the column `plan` on the `tenants` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "base_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "exchange_rate_used" DECIMAL(18,6) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "base_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "exchange_rate_used" DECIMAL(18,6) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "base_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "exchange_rate" SET DATA TYPE DECIMAL(18,6);

-- AlterTable
ALTER TABLE "refunds" ADD COLUMN     "base_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "exchange_rate_used" DECIMAL(18,6) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "base_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "exchange_rate_used" DECIMAL(18,6) NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "plan",
ADD COLUMN     "base_currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "plan_id" TEXT,
ADD COLUMN     "supported_currencies" TEXT[] DEFAULT ARRAY['USD']::TEXT[];

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "features" JSONB DEFAULT '{}',
    "limits" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_from_currency_to_currency_key" ON "exchange_rates"("from_currency", "to_currency");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
