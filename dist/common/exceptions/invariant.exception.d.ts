import { HttpException } from '@nestjs/common';
export declare class InvariantException extends HttpException {
    constructor(code: string, message: string, context?: Record<string, any>);
}
