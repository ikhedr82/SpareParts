import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreditStatus } from '@prisma/client';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('customers/:id/360')
  getCustomer360(@Param('id') id: string) {
    return this.crmService.getCustomer360(id);
  }

  @Post('leads')
  createLead(@Body() dto: CreateLeadDto) {
    return this.crmService.createLead(dto);
  }

  @Get('leads')
  findAllLeads() {
    return this.crmService.findAllLeads();
  }

  @Post('opportunities')
  createOpportunity(@Body() dto: CreateOpportunityDto) {
    return this.crmService.createOpportunity(dto);
  }

  @Get('opportunities')
  findAllOpportunities() {
    return this.crmService.findAllOpportunities();
  }

  @Post('deals')
  createDeal(@Body() dto: CreateDealDto) {
    return this.crmService.createDeal(dto);
  }

  @Post('activities')
  createActivity(@Body() dto: CreateActivityDto) {
    return this.crmService.createActivity(dto);
  }

  @Get('activities')
  findAllActivities() {
    return this.crmService.findAllActivities();
  }

  @Post('notes')
  createNote(@Body() dto: CreateNoteDto) {
    return this.crmService.createNote(dto);
  }

  @Patch('credit/limit')
  updateCreditLimit(
    @Body('businessClientId') businessClientId: string,
    @Body('limit') limit: number,
    @Body('status') status?: CreditStatus,
  ) {
    return this.crmService.updateCreditLimit(businessClientId, limit, status);
  }
}
