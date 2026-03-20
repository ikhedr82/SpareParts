-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "outbox_events" DROP CONSTRAINT "outbox_events_tenant_id_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "tenant_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "outbox_events" ALTER COLUMN "tenant_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
