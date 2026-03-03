"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvariantException = void 0;
const common_1 = require("@nestjs/common");
class InvariantException extends common_1.HttpException {
    constructor(code, message, context = {}) {
        super({
            statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            error: 'Invariant Violation',
            invariant: code,
            message,
            context,
        }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
exports.InvariantException = InvariantException;
//# sourceMappingURL=invariant.exception.js.map