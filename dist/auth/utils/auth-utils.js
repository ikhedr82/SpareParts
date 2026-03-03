"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPlatformAdmin = assertPlatformAdmin;
const common_1 = require("@nestjs/common");
function assertPlatformAdmin(user) {
    if (!user || user.isPlatformUser !== true) {
        throw new common_1.ForbiddenException('Access denied. Only platform administrators can perform this action.');
    }
}
//# sourceMappingURL=auth-utils.js.map