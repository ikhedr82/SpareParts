import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { SignupDto } from './dto/signup.dto';

@Controller('onboarding')
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) {}

    /**
     * POST /onboarding/signup
     * Public endpoint — no auth required.
     * Creates a new tenant with a FREE plan and admin user.
     */
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() dto: SignupDto) {
        return this.onboardingService.signup(dto);
    }

    /**
     * GET /onboarding/check-subdomain?subdomain=acme
     * Public endpoint — real-time subdomain availability check.
     */
    @Get('check-subdomain')
    async checkSubdomain(@Query('subdomain') subdomain: string) {
        return this.onboardingService.checkSubdomain(subdomain);
    }
}
