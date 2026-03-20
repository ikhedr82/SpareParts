import { Controller, Get, Param } from '@nestjs/common';
import { PublicInfoService } from './public-info.service';

@Controller('api/public')
export class PublicInfoController {
  constructor(private readonly publicInfoService: PublicInfoService) {}

  @Get('plans')
  async getPlans() {
    return this.publicInfoService.getPlans();
  }

  @Get('testimonials')
  async getTestimonials() {
    return this.publicInfoService.getTestimonials();
  }

  @Get('faqs')
  async getFAQs() {
    return this.publicInfoService.getFAQs();
  }

  @Get('content/:key')
  async getPageContent(@Param('key') key: string) {
    return this.publicInfoService.getPageContent(key);
  }

  @Get('legal/:type')
  async getLegalContent(@Param('type') type: string) {
    return this.publicInfoService.getLegalContent(type);
  }

  @Get('config')
  async getSystemConfig() {
    return this.publicInfoService.getSystemConfig();
  }
}
