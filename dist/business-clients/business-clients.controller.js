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
exports.BusinessClientsController = void 0;
const common_1 = require("@nestjs/common");
const business_clients_service_1 = require("./business-clients.service");
const create_business_client_dto_1 = require("./dto/create-business-client.dto");
const update_business_client_dto_1 = require("./dto/update-business-client.dto");
const create_business_client_contact_dto_1 = require("./dto/create-business-client-contact.dto");
const create_business_client_address_dto_1 = require("./dto/create-business-client-address.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const client_1 = require("@prisma/client");
let BusinessClientsController = class BusinessClientsController {
    constructor(businessClientsService) {
        this.businessClientsService = businessClientsService;
    }
    create(createBusinessClientDto) {
        return this.businessClientsService.create(createBusinessClientDto);
    }
    findAll(type) {
        return this.businessClientsService.findAll(type);
    }
    findOne(id) {
        return this.businessClientsService.findOne(id);
    }
    update(id, updateBusinessClientDto) {
        return this.businessClientsService.update(id, updateBusinessClientDto);
    }
    remove(id) {
        return this.businessClientsService.remove(id);
    }
    getBalance(id) {
        return this.businessClientsService.getBalance(id);
    }
    addContact(id, createContactDto) {
        return this.businessClientsService.addContact(id, createContactDto);
    }
    findContacts(id) {
        return this.businessClientsService.findContacts(id);
    }
    updateContact(id, contactId, updateContactDto) {
        return this.businessClientsService.updateContact(id, contactId, updateContactDto);
    }
    removeContact(id, contactId) {
        return this.businessClientsService.removeContact(id, contactId);
    }
    addAddress(id, createAddressDto) {
        return this.businessClientsService.addAddress(id, createAddressDto);
    }
    findAddresses(id) {
        return this.businessClientsService.findAddresses(id);
    }
    updateAddress(id, addressId, updateAddressDto) {
        return this.businessClientsService.updateAddress(id, addressId, updateAddressDto);
    }
    removeAddress(id, addressId) {
        return this.businessClientsService.removeAddress(id, addressId);
    }
};
exports.BusinessClientsController = BusinessClientsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_business_client_dto_1.CreateBusinessClientDto]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_business_client_dto_1.UpdateBusinessClientDto]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)(':id/contacts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_business_client_contact_dto_1.CreateBusinessClientContactDto]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "addContact", null);
__decorate([
    (0, common_1.Get)(':id/contacts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "findContacts", null);
__decorate([
    (0, common_1.Patch)(':id/contacts/:contactId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('contactId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "updateContact", null);
__decorate([
    (0, common_1.Delete)(':id/contacts/:contactId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "removeContact", null);
__decorate([
    (0, common_1.Post)(':id/addresses'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_business_client_address_dto_1.CreateBusinessClientAddressDto]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Get)(':id/addresses'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "findAddresses", null);
__decorate([
    (0, common_1.Patch)(':id/addresses/:addressId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)(':id/addresses/:addressId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BusinessClientsController.prototype, "removeAddress", null);
exports.BusinessClientsController = BusinessClientsController = __decorate([
    (0, common_1.Controller)('business-clients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [business_clients_service_1.BusinessClientsService])
], BusinessClientsController);
//# sourceMappingURL=business-clients.controller.js.map