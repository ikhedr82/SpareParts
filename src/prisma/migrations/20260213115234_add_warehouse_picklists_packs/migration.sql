-- CreateEnum
CREATE TYPE "PickListStatus" AS ENUM ('CREATED', 'PICKING', 'PICKED', 'PACKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('OPEN', 'SEALED');

-- CreateEnum
CREATE TYPE "PickListItemStatus" AS ENUM ('PENDING', 'PICKED', 'SHORTAGE');

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "bin_location" TEXT,
ADD COLUMN     "last_counted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "pick_lists" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "PickListStatus" NOT NULL DEFAULT 'CREATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "pick_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pick_list_items" (
    "id" TEXT NOT NULL,
    "pick_list_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "required_qty" INTEGER NOT NULL,
    "picked_qty" INTEGER NOT NULL DEFAULT 0,
    "bin_location" TEXT,
    "status" "PickListItemStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pick_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packs" (
    "id" TEXT NOT NULL,
    "pick_list_id" TEXT NOT NULL,
    "pack_number" TEXT NOT NULL,
    "weight" DECIMAL(10,2),
    "packed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PackStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_items" (
    "id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pack_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pick_lists_order_id_key" ON "pick_lists"("order_id");

-- CreateIndex
CREATE INDEX "pick_lists_tenant_id_idx" ON "pick_lists"("tenant_id");

-- CreateIndex
CREATE INDEX "pick_lists_branch_id_idx" ON "pick_lists"("branch_id");

-- CreateIndex
CREATE INDEX "pick_lists_status_idx" ON "pick_lists"("status");

-- CreateIndex
CREATE INDEX "pick_list_items_pick_list_id_idx" ON "pick_list_items"("pick_list_id");

-- CreateIndex
CREATE INDEX "pick_list_items_product_id_idx" ON "pick_list_items"("product_id");

-- CreateIndex
CREATE INDEX "packs_pick_list_id_idx" ON "packs"("pick_list_id");

-- CreateIndex
CREATE UNIQUE INDEX "packs_pick_list_id_pack_number_key" ON "packs"("pick_list_id", "pack_number");

-- CreateIndex
CREATE INDEX "pack_items_pack_id_idx" ON "pack_items"("pack_id");

-- CreateIndex
CREATE INDEX "pack_items_product_id_idx" ON "pack_items"("product_id");

-- AddForeignKey
ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_list_items" ADD CONSTRAINT "pick_list_items_pick_list_id_fkey" FOREIGN KEY ("pick_list_id") REFERENCES "pick_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_list_items" ADD CONSTRAINT "pick_list_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packs" ADD CONSTRAINT "packs_pick_list_id_fkey" FOREIGN KEY ("pick_list_id") REFERENCES "pick_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_items" ADD CONSTRAINT "pack_items_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_items" ADD CONSTRAINT "pack_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
