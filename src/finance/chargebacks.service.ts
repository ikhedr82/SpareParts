import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChargebackStatus, ReturnStatus, DeliveryExceptionType } from '@prisma/client';

@Injectable()
export class ChargebacksService {
    constructor(private prisma: PrismaService) { }

    async processChargeback(
        tenantId: string,
        orderId: string,
        amount: number,
        reason: string,
        returnId?: string,
        deliveryExceptionId?: string
    ) {
        // Law C1 Guard 1: Must have exactly one proof
        if (!returnId && !deliveryExceptionId) {
            throw new BadRequestException('COMMERCIAL SAFETY C1: Chargeback requires loss proof');
        }
        if (returnId && deliveryExceptionId) {
            throw new BadRequestException('COMMERCIAL SAFETY C1: Only one proof allowed');
        }

        // Law C1 Guard 2: Proof must be valid
        if (returnId) {
            const returnProof = await this.prisma.return.findUnique({ where: { id: returnId } });
            if (!returnProof) throw new BadRequestException('Return not found');

            if (returnProof.status !== ReturnStatus.RECEIVED) {
                throw new BadRequestException('COMMERCIAL SAFETY C1: Return must be RECEIVED');
            }
        }

        if (deliveryExceptionId) {
            const exceptionProof = await this.prisma.deliveryException.findUnique({ where: { id: deliveryExceptionId } });
            if (!exceptionProof) throw new BadRequestException('Delivery Exception not found');

            const validTypes: DeliveryExceptionType[] = [DeliveryExceptionType.LOST_IN_TRANSIT, DeliveryExceptionType.DAMAGED_IN_TRANSIT];
            if (!validTypes.includes(exceptionProof.exceptionType)) {
                throw new BadRequestException('COMMERCIAL SAFETY C1: Exception must be LOST or DAMAGED');
            }
        }

        // Create Chargeback
        return this.prisma.chargeback.create({
            data: {
                tenantId,
                orderId,
                amount,
                reason,
                status: ChargebackStatus.PENDING,
                returnId,
                deliveryExceptionId
            }
        });
    }
}
