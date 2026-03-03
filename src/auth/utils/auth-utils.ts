import { ForbiddenException } from '@nestjs/common';

export function assertPlatformAdmin(user: any) {
    if (!user || user.isPlatformUser !== true) {
        throw new ForbiddenException('Access denied. Only platform administrators can perform this action.');
    }
}
