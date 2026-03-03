import { HttpException, HttpStatus } from '@nestjs/common';

export interface ConflictDetail {
    entity: string;
    entityId: string;
    yourValue: any;
    currentValue: any;
    updatedAt?: Date | string;
    updatedBy?: string;
}

/**
 * HC-9 / HC-3: Standardized 409 Conflict Exception
 * Used for optimistic concurrency failures and FSM state conflicts.
 */
export class ConflictException extends HttpException {
    constructor(conflict: ConflictDetail) {
        super(
            {
                statusCode: HttpStatus.CONFLICT,
                error: 'Conflict',
                conflict,
            },
            HttpStatus.CONFLICT,
        );
    }
}
