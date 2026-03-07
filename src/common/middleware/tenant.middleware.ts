import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Paths exempt from suspension blocking (auth + platform admin operations)
const SUSPENSION_EXEMPT_PREFIX = ['/auth', '/api/platform'];

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        console.log(`[TenantMiddleware] [DEBUG] Path: ${req.url}`);
        const tenantHeader = req.headers['x-tenant'] as string;
        let tenantSubdomain: string | null = null;

        if (tenantHeader) {
            tenantSubdomain = tenantHeader;
        } else {
            const host = req.headers.host;
            if (!host) {
                return next(); // Let guards handle missing host if necessary
            }

            // Strip port number if present (e.g. localhost:3000)
            const hostWithoutPort = host.split(':')[0];
            const parts = hostWithoutPort.split('.');

            // If we have a subdomain (e.g. alpha.localhost or alpha.domain.com)
            if (parts.length > 1) {
                // If the last part is localhost, then the first part is the subdomain
                // If it's domain.com, then for 3 parts (sub.domain.com) it's parts[0]
                // Simple logic: if parts.length > 1, take first part unless it's just 'localhost'
                if (hostWithoutPort !== 'localhost' && hostWithoutPort !== '127.0.0.1') {
                    tenantSubdomain = parts[0];
                }
            }
        }

        // If no tenant subdomain is found, it might be a platform-wide request or auth (already excluded)
        if (!tenantSubdomain) {
            return next();
        }

        try {
            const tenant = await this.prisma.tenant.findUnique({
                where: { subdomain: tenantSubdomain },
            });

            if (!tenant) {
                // If we are on localhost and the subdomain wasn't found, 
                // it might be a mistake or a platform user. 
                // We'll log it but allow it to proceed (guards will block if tenantId is required)
                console.warn(`[TenantMiddleware] Tenant '${tenantSubdomain}' not found. Proceeding without tenant context.`);
                return next();
            }

            // G-04: Block SUSPENDED tenants — exempt only auth + platform-admin routes
            const exempted = SUSPENSION_EXEMPT_PREFIX.some(prefix => req.url.startsWith(prefix));
            if (tenant.status === 'SUSPENDED' && !exempted) {
                throw new ForbiddenException(`Tenant is suspended: ${tenant.suspensionReason || 'No reason provided'}`);
            }

            // Attach to request
            (req as any).tenant = tenant;
            (req as any).tenantId = tenant.id;
        } catch (error) {
            console.error(`[TenantMiddleware] Error resolving tenant '${tenantSubdomain}':`, error);
            // We don't want to crash the whole app if DB is down but route is public
            // but usually this is a fatal error for multi-tenant apps.
        }

        next();
    }
}
