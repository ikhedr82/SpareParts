import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        console.log(`[AuthService] [DEBUG] Validating user: ${email}`);
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async login(email: string, password: string) {
        console.log(`[AuthService] [DEBUG] Login attempt for: ${email}`);
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const roles = user.userRoles.map((ur) => ur.role.name);

        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            branchId: user.userRoles.find((ur) => ur.branchId)?.branchId || null,
            roles,
            isPlatformUser: user.isPlatformUser,
        };

        return {
            accessToken: this.jwtService.sign(payload),
            expiresIn: 3600, // 1 hour in seconds
        };
    }
}
