import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.apiKey.findMany({
            select: {
                id: true,
                name: true,
                tenantId: true,
                expiresAt: true,
                createdAt: true,
                lastUsedAt: true,
                tenant: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(data: { name: string; tenantId?: string; expiresAt?: Date }) {
        const rawKey = `sk_${crypto.randomBytes(24).toString('hex')}`;
        const secretHash = this.hashKey(rawKey);

        const key = await this.prisma.apiKey.create({
            data: {
                name: data.name,
                tenantId: data.tenantId,
                expiresAt: data.expiresAt,
                secretHash,
            },
        });

        return {
            ...key,
            rawKey, // This is the ONLY time we return the raw key
        };
    }

    async delete(id: string) {
        return this.prisma.apiKey.delete({
            where: { id },
        });
    }

    async validateKey(rawKey: string) {
        const secretHash = this.hashKey(rawKey);
        const key = await this.prisma.apiKey.findUnique({
            where: { secretHash },
            include: { tenant: true }
        });

        if (!key) throw new UnauthorizedException('Invalid API key');
        if (key.expiresAt && key.expiresAt < new Date()) {
            throw new UnauthorizedException('API key expired');
        }

        // Update last used at asynchronously
        this.prisma.apiKey.update({
            where: { id: key.id },
            data: { lastUsedAt: new Date() }
        }).catch(err => console.error('Failed to update API key stats', err));

        return key;
    }

    async getMetrics(id: string) {
        // Mock data for demonstration of the telemetry UI
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return {
            volume: days.map(day => ({
                date: day,
                requests: Math.floor(Math.random() * 500) + 100,
                errors: Math.floor(Math.random() * 20),
            })),
            distribution: [
                { name: 'GET', value: 65 },
                { name: 'POST', value: 20 },
                { name: 'PUT', value: 10 },
                { name: 'DELETE', value: 5 },
            ],
            statusCodes: [
                { code: '200', count: 850 },
                { code: '401', count: 45 },
                { code: '403', count: 12 },
                { code: '429', count: 28 },
                { code: '500', count: 5 },
            ]
        };
    }

    private hashKey(key: string): string {
        return crypto.createHash('sha256').update(key).digest('hex');
    }
}
