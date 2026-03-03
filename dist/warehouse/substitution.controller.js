"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstitutionController = void 0;
const common_1 = require("@nestjs/common");
const substitution_service_1 = require("./substitution.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SubstitutionController = class SubstitutionController {
    constructor(service) {
        this.service = service;
    }
    async suggest(pickListId, itemId, body, req) {
        return this.service.suggestSubstitution(req.user.tenantId, itemId, body.substituteProductId, body.reason, req.user.sub, req.correlationId);
    }
    async approve(id, req) {
        return this.service.approveSubstitution(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
    async reject(id, req) {
        return this.service.rejectSubstitution(req.user.tenantId, id, req.user.sub, req.correlationId);
    }
    async findByPickList(pickListId, req) {
        return this.service.findByPickList(req.user.tenantId, pickListId);
    }
};
exports.SubstitutionController = SubstitutionController;
__decorate([
    (0, common_1.Post)('picklists/:pickListId/items/:itemId/substitution'),
    __param(0, (0, common_1.Param)('pickListId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SubstitutionController.prototype, "suggest", null);
__decorate([
    (0, common_1.Patch)('substitutions/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubstitutionController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)('substitutions/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubstitutionController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('picklists/:pickListId/substitutions'),
    __param(0, (0, common_1.Param)('pickListId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubstitutionController.prototype, "findByPickList", null);
exports.SubstitutionController = SubstitutionController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('warehouse'),
    __metadata("design:paramtypes", [substitution_service_1.SubstitutionService])
], SubstitutionController);
//# sourceMappingURL=substitution.controller.js.map