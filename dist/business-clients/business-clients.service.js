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
exports.BusinessClientsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_aware_prisma_service_1 = require("../prisma/tenant-aware-prisma.service");
const translation_service_1 = require("../i18n/translation.service");
let BusinessClientsService = class BusinessClientsService {
    constructor(prisma, t) {
        this.prisma = prisma;
        this.t = t;
    }
    async create(dto) {
        return this.prisma.client.businessClient.create({
            data: {
                tenantId: this.prisma.tenantId,
                type: dto.type,
                businessName: dto.businessName,
                registrationNumber: dto.registrationNumber,
                taxId: dto.taxId,
                primaryEmail: dto.primaryEmail,
                primaryPhone: dto.primaryPhone,
                creditLimit: dto.creditLimit || 0,
                paymentTermsDays: dto.paymentTermsDays || 0,
                notes: dto.notes,
            },
            include: {
                contacts: true,
                addresses: true,
            },
        });
    }
    async findAll(type) {
        const where = type ? { type } : {};
        return this.prisma.client.businessClient.findMany({
            where,
            include: {
                contacts: true,
                addresses: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const client = await this.prisma.client.businessClient.findUnique({
            where: { id },
            include: {
                contacts: {
                    orderBy: { isPrimary: 'desc' },
                },
                addresses: {
                    orderBy: { isPrimary: 'desc' },
                },
                sales: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                invoices: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!client) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Business client' }));
        }
        return client;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.client.businessClient.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (dto.type && { type: dto.type })), (dto.businessName && { businessName: dto.businessName })), (dto.registrationNumber !== undefined && { registrationNumber: dto.registrationNumber })), (dto.taxId !== undefined && { taxId: dto.taxId })), (dto.primaryEmail !== undefined && { primaryEmail: dto.primaryEmail })), (dto.primaryPhone !== undefined && { primaryPhone: dto.primaryPhone })), (dto.creditLimit !== undefined && { creditLimit: dto.creditLimit })), (dto.paymentTermsDays !== undefined && { paymentTermsDays: dto.paymentTermsDays })), (dto.status && { status: dto.status })), (dto.notes !== undefined && { notes: dto.notes })),
            include: {
                contacts: true,
                addresses: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.client.businessClient.delete({
            where: { id },
        });
    }
    async getBalance(id) {
        const client = await this.findOne(id);
        const availableCredit = client.creditLimit.toNumber() - client.currentBalance.toNumber();
        return {
            creditLimit: client.creditLimit.toNumber(),
            currentBalance: client.currentBalance.toNumber(),
            availableCredit,
            status: availableCredit < 0 ? 'OVER_LIMIT' : 'ACTIVE',
            paymentTermsDays: client.paymentTermsDays,
        };
    }
    async addContact(businessClientId, dto) {
        await this.findOne(businessClientId);
        if (dto.isPrimary) {
            await this.prisma.client.businessClientContact.updateMany({
                where: { businessClientId },
                data: { isPrimary: false },
            });
        }
        return this.prisma.client.businessClientContact.create({
            data: {
                businessClientId,
                name: dto.name,
                position: dto.position,
                email: dto.email,
                phone: dto.phone,
                isPrimary: dto.isPrimary || false,
                canPlaceOrders: dto.canPlaceOrders !== undefined ? dto.canPlaceOrders : true,
            },
        });
    }
    async findContacts(businessClientId) {
        await this.findOne(businessClientId);
        return this.prisma.client.businessClientContact.findMany({
            where: { businessClientId },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'asc' },
            ],
        });
    }
    async updateContact(businessClientId, contactId, dto) {
        const contact = await this.prisma.client.businessClientContact.findFirst({
            where: { id: contactId, businessClientId },
        });
        if (!contact) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Contact' }));
        }
        if (dto.isPrimary) {
            await this.prisma.client.businessClientContact.updateMany({
                where: { businessClientId, id: { not: contactId } },
                data: { isPrimary: false },
            });
        }
        return this.prisma.client.businessClientContact.update({
            where: { id: contactId },
            data: dto,
        });
    }
    async removeContact(businessClientId, contactId) {
        const contact = await this.prisma.client.businessClientContact.findFirst({
            where: { id: contactId, businessClientId },
        });
        if (!contact) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Contact' }));
        }
        return this.prisma.client.businessClientContact.delete({
            where: { id: contactId },
        });
    }
    async addAddress(businessClientId, dto) {
        await this.findOne(businessClientId);
        if (dto.isPrimary) {
            await this.prisma.client.businessClientAddress.updateMany({
                where: { businessClientId },
                data: { isPrimary: false },
            });
        }
        return this.prisma.client.businessClientAddress.create({
            data: {
                businessClientId,
                type: dto.type,
                addressLine1: dto.addressLine1,
                addressLine2: dto.addressLine2,
                city: dto.city,
                state: dto.state,
                postalCode: dto.postalCode,
                country: dto.country || 'Egypt',
                isPrimary: dto.isPrimary || false,
            },
        });
    }
    async findAddresses(businessClientId) {
        await this.findOne(businessClientId);
        return this.prisma.client.businessClientAddress.findMany({
            where: { businessClientId },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'asc' },
            ],
        });
    }
    async updateAddress(businessClientId, addressId, dto) {
        const address = await this.prisma.client.businessClientAddress.findFirst({
            where: { id: addressId, businessClientId },
        });
        if (!address) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Address' }));
        }
        if (dto.isPrimary) {
            await this.prisma.client.businessClientAddress.updateMany({
                where: { businessClientId, id: { not: addressId } },
                data: { isPrimary: false },
            });
        }
        return this.prisma.client.businessClientAddress.update({
            where: { id: addressId },
            data: dto,
        });
    }
    async removeAddress(businessClientId, addressId) {
        const address = await this.prisma.client.businessClientAddress.findFirst({
            where: { id: addressId, businessClientId },
        });
        if (!address) {
            throw new common_1.NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Address' }));
        }
        return this.prisma.client.businessClientAddress.delete({
            where: { id: addressId },
        });
    }
};
exports.BusinessClientsService = BusinessClientsService;
exports.BusinessClientsService = BusinessClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_aware_prisma_service_1.TenantAwarePrismaService,
        translation_service_1.TranslationService])
], BusinessClientsService);
//# sourceMappingURL=business-clients.service.js.map