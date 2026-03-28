import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SyncService, SyncOperation } from './sync.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * Bulk Sync Endpoint
   * Flushes multiple offline actions in one transaction-safe batch.
   */
  @Post('batch')
  async syncBatch(@Req() req: any, @Body('operations') operations: SyncOperation[]) {
    // TenantId is attached to req.user by JwtAuthGuard/TenantMiddleware
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return this.syncService.processBatch(tenantId, userId, operations);
  }
}
