import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
    constructor(private prisma: PrismaService) { }

    // Landing Page Content
    async findAllPageContent() {
        return this.prisma.landingPageContent.findMany({
            orderBy: { key: 'asc' }
        });
    }

    async upsertPageContent(key: string, data: { contentEn: any; contentAr?: any; titleEn?: string; titleAr?: string }) {
        return this.prisma.landingPageContent.upsert({
            where: { key },
            update: data,
            create: { key, ...data }
        });
    }

    // Testimonials
    async findAllTestimonials() {
        return this.prisma.landingTestimonial.findMany({
            orderBy: { order: 'asc' }
        });
    }

    async createTestimonial(data: any) {
        return this.prisma.landingTestimonial.create({ data });
    }

    async updateTestimonial(id: string, data: any) {
        return this.prisma.landingTestimonial.update({
            where: { id },
            data
        });
    }

    async deleteTestimonial(id: string) {
        return this.prisma.landingTestimonial.delete({
            where: { id }
        });
    }

    // FAQs
    async findAllFAQs() {
        return this.prisma.landingFAQ.findMany({
            orderBy: { order: 'asc' }
        });
    }

    async createFAQ(data: any) {
        return this.prisma.landingFAQ.create({ data });
    }

    async updateFAQ(id: string, data: any) {
        return this.prisma.landingFAQ.update({
            where: { id },
            data
        });
    }

    async deleteFAQ(id: string) {
        return this.prisma.landingFAQ.delete({
            where: { id }
        });
    }

    // Legal Content
    async findAllLegal() {
        return this.prisma.legalContent.findMany();
    }

    async upsertLegal(type: string, data: { titleEn: string; titleAr: string; contentEn: string; contentAr: string }) {
        return this.prisma.legalContent.upsert({
            where: { type },
            update: data,
            create: { type, ...data }
        });
    }
}
