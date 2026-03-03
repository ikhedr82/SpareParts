-- AlterTable
ALTER TABLE "products" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "unit_of_measure" TEXT DEFAULT 'EA';

-- CreateTable
CREATE TABLE "vehicle_makes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_makes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_models" (
    "id" TEXT NOT NULL,
    "make_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year_start" INTEGER NOT NULL,
    "year_end" INTEGER,
    "engine_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_fitments" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "vehicle_model_id" TEXT NOT NULL,
    "position" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_fitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternate_part_numbers" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "part_number" TEXT NOT NULL,
    "manufacturer" TEXT,
    "is_superseded" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alternate_part_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sources" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "external_id" TEXT,
    "raw_data" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_makes_name_key" ON "vehicle_makes"("name");

-- CreateIndex
CREATE INDEX "vehicle_models_make_id_idx" ON "vehicle_models"("make_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_make_id_name_year_start_engine_type_key" ON "vehicle_models"("make_id", "name", "year_start", "engine_type");

-- CreateIndex
CREATE INDEX "product_fitments_product_id_idx" ON "product_fitments"("product_id");

-- CreateIndex
CREATE INDEX "product_fitments_vehicle_model_id_idx" ON "product_fitments"("vehicle_model_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_fitments_product_id_vehicle_model_id_position_key" ON "product_fitments"("product_id", "vehicle_model_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "alternate_part_numbers_part_number_key" ON "alternate_part_numbers"("part_number");

-- CreateIndex
CREATE INDEX "alternate_part_numbers_product_id_idx" ON "alternate_part_numbers"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_sources_name_key" ON "data_sources"("name");

-- CreateIndex
CREATE INDEX "product_sources_product_id_idx" ON "product_sources"("product_id");

-- CreateIndex
CREATE INDEX "product_sources_data_source_id_idx" ON "product_sources"("data_source_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_sources_product_id_data_source_id_key" ON "product_sources"("product_id", "data_source_id");

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_make_id_fkey" FOREIGN KEY ("make_id") REFERENCES "vehicle_makes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_fitments" ADD CONSTRAINT "product_fitments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_fitments" ADD CONSTRAINT "product_fitments_vehicle_model_id_fkey" FOREIGN KEY ("vehicle_model_id") REFERENCES "vehicle_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternate_part_numbers" ADD CONSTRAINT "alternate_part_numbers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sources" ADD CONSTRAINT "product_sources_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sources" ADD CONSTRAINT "product_sources_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
