import { HttpException } from '@nestjs/common';
export interface ConflictDetail {
    entity: string;
    entityId: string;
    yourValue: any;
    currentValue: any;
    updatedAt?: Date | string;
    updatedBy?: string;
}
export declare class ConflictException extends HttpException {
    constructor(conflict: ConflictDetail);
}
