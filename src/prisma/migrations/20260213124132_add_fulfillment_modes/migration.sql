-- CreateEnum
CREATE TYPE "FulfillmentMode" AS ENUM ('INTERNAL_FLEET', 'EXTERNAL_COURIER', 'CUSTOMER_PICKUP', 'THIRD_PARTY_DRIVER');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'READY_FOR_PICKUP';

-- DropForeignKey
ALTER TABLE "delivery_trips" DROP CONSTRAINT "delivery_trips_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_trips" DROP CONSTRAINT "delivery_trips_vehicle_id_fkey";

-- AlterTable
ALTER TABLE "delivery_trips" ADD COLUMN     "fulfillment_provider_id" TEXT,
ADD COLUMN     "mode" "FulfillmentMode" NOT NULL DEFAULT 'INTERNAL_FLEET',
ALTER COLUMN "driver_id" DROP NOT NULL,
ALTER COLUMN "vehicle_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "fulfillment_providers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "FulfillmentMode" NOT NULL,
    "phone" TEXT,
    "api_endpoint" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fulfillment_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fulfillment_providers_tenant_id_idx" ON "fulfillment_providers"("tenant_id");

-- CreateIndex
CREATE INDEX "fulfillment_providers_mode_idx" ON "fulfillment_providers"("mode");

-- CreateIndex
CREATE INDEX "delivery_trips_mode_idx" ON "delivery_trips"("mode");

-- AddForeignKey
ALTER TABLE "fulfillment_providers" ADD CONSTRAINT "fulfillment_providers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_trips" ADD CONSTRAINT "delivery_trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_trips" ADD CONSTRAINT "delivery_trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_trips" ADD CONSTRAINT "delivery_trips_fulfillment_provider_id_fkey" FOREIGN KEY ("fulfillment_provider_id") REFERENCES "fulfillment_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
