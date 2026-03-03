"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = void 0;
const common_1 = require("@nestjs/common");
class ConflictException extends common_1.HttpException {
    constructor(conflict) {
        super({
            statusCode: common_1.HttpStatus.CONFLICT,
            error: 'Conflict',
            conflict,
        }, common_1.HttpStatus.CONFLICT);
    }
}
exports.ConflictException = ConflictException;
//# sourceMappingURL=conflict.exception.js.map