import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateBusinessClientDto } from './dto/create-business-client.dto';
import { UpdateBusinessClientDto } from './dto/update-business-client.dto';
import { CreateBusinessClientContactDto } from './dto/create-business-client-contact.dto';
import { CreateBusinessClientAddressDto } from './dto/create-business-client-address.dto';
import { BusinessClientType } from '@prisma/client';
import { TranslationService } from '../i18n/translation.service';

@Injectable()
export class BusinessClientsService {
    constructor(
        private readonly prisma: TenantAwarePrismaService,
        private readonly t: TranslationService,
    ) { }

    async create(dto: CreateBusinessClientDto) {
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

    async findAll(type?: BusinessClientType) {
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

    async findOne(id: string) {
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
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Business client' }));
        }

        return client;
    }

    async update(id: string, dto: UpdateBusinessClientDto) {
        await this.findOne(id); // Check if exists

        return this.prisma.client.businessClient.update({
            where: { id },
            data: {
                ...(dto.type && { type: dto.type }),
                ...(dto.businessName && { businessName: dto.businessName }),
                ...(dto.registrationNumber !== undefined && { registrationNumber: dto.registrationNumber }),
                ...(dto.taxId !== undefined && { taxId: dto.taxId }),
                ...(dto.primaryEmail !== undefined && { primaryEmail: dto.primaryEmail }),
                ...(dto.primaryPhone !== undefined && { primaryPhone: dto.primaryPhone }),
                ...(dto.creditLimit !== undefined && { creditLimit: dto.creditLimit }),
                ...(dto.paymentTermsDays !== undefined && { paymentTermsDays: dto.paymentTermsDays }),
                ...(dto.status && { status: dto.status }),
                ...(dto.notes !== undefined && { notes: dto.notes }),
            },
            include: {
                contacts: true,
                addresses: true,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Check if exists

        return this.prisma.client.businessClient.delete({
            where: { id },
        });
    }

    async getBalance(id: string) {
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

    // Contact management
    async addContact(businessClientId: string, dto: CreateBusinessClientContactDto) {
        await this.findOne(businessClientId); // Verify client exists

        // If this contact is marked as primary, unset other primary contacts
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

    async findContacts(businessClientId: string) {
        await this.findOne(businessClientId); // Verify client exists

        return this.prisma.client.businessClientContact.findMany({
            where: { businessClientId },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'asc' },
            ],
        });
    }

    async updateContact(businessClientId: string, contactId: string, dto: Partial<CreateBusinessClientContactDto>) {
        const contact = await this.prisma.client.businessClientContact.findFirst({
            where: { id: contactId, businessClientId },
        });

        if (!contact) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Contact' }));
        }

        // If this contact is marked as primary, unset other primary contacts
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

    async removeContact(businessClientId: string, contactId: string) {
        const contact = await this.prisma.client.businessClientContact.findFirst({
            where: { id: contactId, businessClientId },
        });

        if (!contact) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Contact' }));
        }

        return this.prisma.client.businessClientContact.delete({
            where: { id: contactId },
        });
    }

    // Address management
    async addAddress(businessClientId: string, dto: CreateBusinessClientAddressDto) {
        await this.findOne(businessClientId); // Verify client exists

        // If this address is marked as primary, unset other primary addresses
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

    async findAddresses(businessClientId: string) {
        await this.findOne(businessClientId); // Verify client exists

        return this.prisma.client.businessClientAddress.findMany({
            where: { businessClientId },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'asc' },
            ],
        });
    }

    async updateAddress(businessClientId: string, addressId: string, dto: Partial<CreateBusinessClientAddressDto>) {
        const address = await this.prisma.client.businessClientAddress.findFirst({
            where: { id: addressId, businessClientId },
        });

        if (!address) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Address' }));
        }

        // If this address is marked as primary, unset other primary addresses
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

    async removeAddress(businessClientId: string, addressId: string) {
        const address = await this.prisma.client.businessClientAddress.findFirst({
            where: { id: addressId, businessClientId },
        });

        if (!address) {
            throw new NotFoundException(this.t.translate('errors.validation.not_found', 'EN', { entity: 'Address' }));
        }

        return this.prisma.client.businessClientAddress.delete({
            where: { id: addressId },
        });
    }
}
