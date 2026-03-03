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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelRefundDto = exports.CreateRefundDto = exports.RejectReturnDto = exports.ReceiveReturnDto = exports.ReceiveItemDto = exports.InitiateReturnDto = exports.ReturnItemDto = exports.ResolveExceptionDto = exports.CreateDeliveryExceptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateDeliveryExceptionDto {
}
exports.CreateDeliveryExceptionDto = CreateDeliveryExceptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryExceptionDto.prototype, "tripStopId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.DeliveryExceptionType),
    __metadata("design:type", String)
], CreateDeliveryExceptionDto.prototype, "exceptionType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryExceptionDto.prototype, "description", void 0);
class ResolveExceptionDto {
}
exports.ResolveExceptionDto = ResolveExceptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveExceptionDto.prototype, "resolutionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveExceptionDto.prototype, "resolutionNotes", void 0);
class ReturnItemDto {
}
exports.ReturnItemDto = ReturnItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "orderItemId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReturnItemDto.prototype, "quantity", void 0);
class InitiateReturnDto {
}
exports.InitiateReturnDto = InitiateReturnDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateReturnDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ReturnReason),
    __metadata("design:type", String)
], InitiateReturnDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateReturnDto.prototype, "reasonNotes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReturnItemDto),
    __metadata("design:type", Array)
], InitiateReturnDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateReturnDto.prototype, "deliveryExceptionId", void 0);
class ReceiveItemDto {
}
exports.ReceiveItemDto = ReceiveItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveItemDto.prototype, "returnItemId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveItemDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReceiveItemDto.prototype, "restockable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiveItemDto.prototype, "inspectionNotes", void 0);
class ReceiveReturnDto {
}
exports.ReceiveReturnDto = ReceiveReturnDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiveItemDto),
    __metadata("design:type", Array)
], ReceiveReturnDto.prototype, "items", void 0);
class RejectReturnDto {
}
exports.RejectReturnDto = RejectReturnDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectReturnDto.prototype, "reason", void 0);
class CreateRefundDto {
}
exports.CreateRefundDto = CreateRefundDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateRefundDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "returnId", void 0);
class CancelRefundDto {
}
exports.CancelRefundDto = CancelRefundDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelRefundDto.prototype, "reason", void 0);
//# sourceMappingURL=exceptions.dto.js.map