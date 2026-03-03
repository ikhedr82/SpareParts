import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * HC-8: Standardized 422 Invariant Violation Exception
 * Every business invariant violation MUST use this exception class.
 *
 * Invariant codes:
 *  INV-01: Refund amount must be positive
 *  INV-02: Refund amount cannot exceed sale total
 *  INV-03: Order total exceeds available credit limit
 *  INV-04: Inventory quantity cannot go negative
 *  INV-05: Cannot allocate more than available quantity
 *  INV-06: Cannot commit more than allocated quantity
 *  INV-07: Sale requires an open cash session
 *  INV-08: Cannot void a sale in a closed accounting period
 *  INV-09: PO receive quantity cannot exceed ordered quantity
 *  INV-10: Price must come from DB sellingPrice — no hardcoded values
 */
export class InvariantException extends HttpException {
    constructor(
        code: string,
        message: string,
        context: Record<string, any> = {},
    ) {
        super(
            {
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                error: 'Invariant Violation',
                invariant: code,
                message,
                context,
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}
