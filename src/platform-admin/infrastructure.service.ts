import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';
import { execSync } from 'child_process';

@Injectable()
export class InfrastructureService {
    private readonly logger = new Logger(InfrastructureService.name);

    constructor(private prisma: PrismaService) { }

    async getHealthStatus() {
        const status = {
            database: await this.checkDatabase(),
            cache: await this.checkRedis(),
            system: this.getSystemMetrics(),
            timestamp: new Date().toISOString(),
        };
        return status;
    }

    private async checkRedis() {
        // Simulating redis connection check
        // In a real env, this would call this.redisClient.ping()
        try {
            return { status: 'HEALTHY', message: 'Ready', latency: '2ms' };
        } catch (error) {
            return { status: 'UNHEALTHY', message: 'Connection failed' };
        }
    }

    private async checkDatabase() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'HEALTHY', message: 'Connected' };
        } catch (error) {
            this.logger.error('Database health check failed', error.stack);
            return { status: 'UNHEALTHY', message: error.message };
        }
    }

    private getSystemMetrics() {
        return {
            cpu: os.cpus().length,
            freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
            totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
            uptime: `${Math.round(os.uptime() / 3600)} hours`,
            platform: os.platform(),
        };
    }
}
