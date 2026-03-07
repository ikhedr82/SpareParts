import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { RoleScope } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true; // No permissions required
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assumes JwtAuthGuard has attached user to request

        if (!user || !user.id) {
            throw new ForbiddenException('User not authenticated');
        }

        const tenantId = (request as any).tenantId || user.tenantId; // From TenantMiddleware or JWT fallback
        const branchId = request.query?.branchId || request.body?.branchId; // Optional branch context

        // Fetch user roles with permissions
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId: user.id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true },
                        },
                    },
                },
            },
        });

        // Collect all permissions based on scope
        const userPermissions = new Set<string>();

        for (const userRole of userRoles) {
            const role = userRole.role;

            // PLATFORM scope: Bypass tenant and branch filters
            if (role.scope === RoleScope.PLATFORM) {
                role.permissions.forEach(rp => userPermissions.add(rp.permission.code));
            }
            // TENANT scope: Must match tenantId, bypass branch filter
            else if (role.scope === RoleScope.TENANT) {
                if (userRole.tenantId === tenantId || !tenantId) {
                    role.permissions.forEach(rp => userPermissions.add(rp.permission.code));
                }
            }
            // BRANCH scope: Must match both tenantId and branchId
            else if (role.scope === RoleScope.BRANCH) {
                if (userRole.tenantId === tenantId && (!branchId || userRole.branchId === branchId)) {
                    role.permissions.forEach(rp => userPermissions.add(rp.permission.code));
                }
            }
        }

        // Check if user has ANY of the required permissions
        const hasPermission = requiredPermissions.some(perm => userPermissions.has(perm));

        if (!hasPermission) {
            throw new ForbiddenException(`Missing required permissions: ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
}
