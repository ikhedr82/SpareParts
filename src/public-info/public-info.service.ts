import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicInfoService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        price: true,
        currency: true,
        billingCycle: true,
        features: true,
        limits: true,
      },
      orderBy: { price: 'asc' },
    });
  }

  async getTestimonials() {
    return this.prisma.landingTestimonial.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getFAQs() {
    return this.prisma.landingFAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getPageContent(key: string) {
    return this.prisma.landingPageContent.findUnique({
      where: { key },
    });
  }

  async getLegalContent(type: string) {
    return this.prisma.legalContent.findUnique({
      where: { type },
    });
  }

  async getSystemConfig() {
    const config = await this.prisma.currency.findMany({
      where: { isActive: true },
    });
    return {
      currencies: config,
      defaultCurrency: 'USD',
    };
  }
}
