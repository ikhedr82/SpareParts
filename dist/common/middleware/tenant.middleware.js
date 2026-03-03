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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const SUSPENSION_EXEMPT_PREFIX = ['/auth', '/api/platform'];
let TenantMiddleware = class TenantMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        console.log(`[TenantMiddleware] [DEBUG] Path: ${req.url}`);
        const tenantHeader = req.headers['x-tenant'];
        let tenantSubdomain = null;
        if (tenantHeader) {
            tenantSubdomain = tenantHeader;
        }
        else {
            const host = req.headers.host;
            if (!host) {
                return next();
            }
            const hostWithoutPort = host.split(':')[0];
            const parts = hostWithoutPort.split('.');
            if (parts.length > 1) {
                if (hostWithoutPort !== 'localhost' && hostWithoutPort !== '127.0.0.1') {
                    tenantSubdomain = parts[0];
                }
            }
        }
        if (!tenantSubdomain) {
            return next();
        }
        try {
            const tenant = await this.prisma.tenant.findUnique({
                where: { subdomain: tenantSubdomain },
            });
            if (!tenant) {
                console.warn(`[TenantMiddleware] Tenant '${tenantSubdomain}' not found. Proceeding without tenant context.`);
                return next();
            }
            const exempted = SUSPENSION_EXEMPT_PREFIX.some(prefix => req.url.startsWith(prefix));
            if (tenant.status === 'SUSPENDED' && !exempted) {
                throw new common_1.ForbiddenException(`Tenant is suspended: ${tenant.suspensionReason || 'No reason provided'}`);
            }
            req.tenant = tenant;
            req.tenantId = tenant.id;
        }
        catch (error) {
            console.error(`[TenantMiddleware] Error resolving tenant '${tenantSubdomain}':`, error);
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map