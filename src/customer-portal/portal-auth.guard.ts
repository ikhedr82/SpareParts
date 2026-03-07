import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class PortalAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const user = (request as any).user;

        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        // Check if user is linked to a Business Client
        // We assume the JWT strategy has already attached the user and their businessClientId
        // If businessClientId is missing, they are not a portal user (maybe an internal admin trying to access portal?)
        // Internal admins MIGHT be allowed, but for now let's strict guard for Business Users.

        // Actually, in our Auth design, a User can be an employee OR a client contact.
        // If they are a client contact, they should have `businessClientId` on their profile/token.

        if (!user.businessClientId) {
            throw new UnauthorizedException('User is not a Business Client');
        }

        return true;
    }
}
