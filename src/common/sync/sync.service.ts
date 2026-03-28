import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SyncOperation {
  id: string; // client-side syncId
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entity: 'ORDER' | 'SALE' | 'TRIP' | 'INVENTORY' | 'STOCK_ADJUSTMENT' | 'PAYMENT';
  payload: any;
  version: number;
  sequenceNumber?: number;
  deviceId?: string;
  clientTimestamp?: number;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  async processBatch(tenantId: string, userId: string, operations: SyncOperation[]) {
    this.logger.log(`Processing batch of ${operations.length} operations for tenant ${tenantId}`);
    
    // Sort operations by sequenceNumber to enforce CREATE -> UPDATE -> STATUS_CHANGE
    const sortedOps = [...operations].sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

    const success: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const op of sortedOps) {
      try {
        await this.processOperation(tenantId, userId, op);
        success.push(op.id);
      } catch (error) {
        this.logger.error(`Failed to process operation ${op.id}:`, error.message);
        failed.push({ 
          id: op.id, 
          reason: error.message
        });
      }
    }

    return { success, failed };
  }

  private async processOperation(tenantId: string, userId: string, op: SyncOperation) {
    switch (op.entity) {
      case 'SALE':
        return this.syncSale(tenantId, op);
      case 'ORDER':
        return this.syncOrder(tenantId, op);
      case 'PAYMENT':
        return this.syncPayment(tenantId, op);
      case 'TRIP':
        return this.syncTrip(tenantId, op);
      case 'INVENTORY':
        return this.syncInventory(tenantId, op);
      default:
        throw new Error(`Unsupported entity type: ${op.entity}`);
    }
  }

  private async syncSale(tenantId: string, op: SyncOperation) {
    const { payload, version, type } = op;
    
    const existing = await (this.prisma as any).sale.findUnique({
      where: { offlineSyncId: op.id }
    });
    
    if (existing && type === 'CREATE') {
      return existing; // Idempotency
    }

    if (!existing && type !== 'CREATE') {
      throw new Error('Out of order: Cannot UPDATE an entity that does not exist.');
    }

    if (type === 'CREATE') {
      return await (this.prisma as any).sale.create({
        data: {
          ...payload,
          tenantId,
          offlineSyncId: op.id,
          version: 1,
          createdAt: new Date() // authoritative timestamp
        }
      });
    }

    // UPDATE with LWW
    if (version <= existing.version) {
      throw new ConflictException({
        message: 'Version conflict: server has a newer or equal version.',
        serverVersion: existing.version,
        currentData: existing,
      });
    }

    return await (this.prisma as any).sale.update({
      where: { id: existing.id },
      data: { ...payload, version: { increment: 1 } }
    });
  }

  private async syncPayment(tenantId: string, op: SyncOperation) {
    const clientPaymentId = op.payload.clientPaymentId || op.id; // Idempotency key
    
    const existing = await (this.prisma as any).payment.findFirst({
        where: { tenantId, clientPaymentId }
    });

    if (existing && op.type === 'CREATE') return existing;

    if (op.type === 'CREATE') {
        return await (this.prisma as any).payment.create({
            data: {
                ...op.payload,
                tenantId,
                clientPaymentId,
                version: 1,
                createdAt: new Date()
            }
        });
    }

    throw new Error('Unsupported offline UPDATE for Payment.');
  }

  private async syncOrder(tenantId: string, op: SyncOperation) {
    const clientOrderId = op.payload.clientOrderId || op.id; // Fallback to id if clientOrderId is missing
    
    // Validate required fields
    if (op.type === 'CREATE' && (!op.payload.businessClientId || !op.payload.branchId)) {
        throw new Error('Missing required offline payload fields for Order');
    }

    const existing = await (this.prisma as any).order.findFirst({
      where: { tenantId, OR: [{ clientOrderId }, { offlineSyncId: op.id }] }
    });

    if (existing && op.type === 'CREATE') {
        return existing; // Idempotency
    }

    if (!existing && op.type !== 'CREATE') {
        throw new Error('Out of order: Cannot UPDATE or STATUS_CHANGE an entity that does not exist.');
    }

    if (op.type === 'CREATE') {
      return await (this.prisma as any).order.create({
        data: { 
          ...op.payload, 
          tenantId, 
          offlineSyncId: op.id, 
          clientOrderId, 
          version: 1,
          createdAt: new Date() // Server assigns authoritative timestamp
        }
      });
    }

    // UPDATE logic logic...
    if (op.version <= existing.version) {
      throw new ConflictException('Version conflict: server has a newer or equal version.');
    }

    return await (this.prisma as any).order.update({
      where: { id: existing.id },
      data: { ...op.payload, version: { increment: 1 } }
    });
  }

  private async syncTrip(tenantId: string, op: SyncOperation) {
    // Driver app specific: Status updates
    const current = await (this.prisma as any).deliveryTrip.findUnique({
      where: { offlineSyncId: op.id }
    });

    if (current && op.payload.status === 'PLANNED' && current.status === 'COMPLETED') {
      throw new ConflictException('Cannot move trip back to PLANNED from COMPLETED via offline sync.');
    }

    return await (this.prisma as any).deliveryTrip.update({
      where: { offlineSyncId: op.id },
      data: { ...op.payload, version: { increment: 1 } }
    });
  }

  private async syncInventory(tenantId: string, op: SyncOperation) {
    // Warehouse specific: Stock adjustments
    return await (this.prisma as any).inventory.upsert({
      where: { offlineSyncId: op.id },
      update: { quantity: op.payload.quantity, version: { increment: 1 } },
      create: { ...op.payload, tenantId, offlineSyncId: op.id, version: 1 }
    });
  }
}
