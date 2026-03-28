import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { CreditStatus } from '@prisma/client';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: TenantAwarePrismaService) {}

  // --- Leads ---
  async createLead(dto: CreateLeadDto) {
    return this.prisma.client.lead.create({
      data: {
        ...dto,
        tenantId: this.prisma.tenantId,
      },
    });
  }

  async findAllLeads() {
    return this.prisma.client.lead.findMany({
      where: { tenantId: this.prisma.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Opportunities ---
  async createOpportunity(dto: CreateOpportunityDto) {
    return this.prisma.client.opportunity.create({
      data: {
        ...dto,
        tenantId: this.prisma.tenantId,
      },
    });
  }

  async findAllOpportunities() {
    return this.prisma.client.opportunity.findMany({
      where: { tenantId: this.prisma.tenantId },
      include: { lead: true, businessClient: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // --- Deals ---
  async createDeal(dto: CreateDealDto) {
    return this.prisma.client.deal.create({
      data: {
        ...dto,
        tenantId: this.prisma.tenantId,
      },
    });
  }

  // --- Activities ---
  async createActivity(dto: CreateActivityDto) {
    return this.prisma.client.activity.create({
      data: {
        ...dto,
        tenantId: this.prisma.tenantId,
      },
    });
  }

  async findAllActivities() {
    return this.prisma.client.activity.findMany({
      where: { tenantId: this.prisma.tenantId },
      orderBy: { dueDate: 'asc' },
    });
  }

  // --- Notes ---
  async createNote(dto: CreateNoteDto) {
    return this.prisma.client.note.create({
      data: {
        ...dto,
        tenantId: this.prisma.tenantId,
      },
    });
  }

  // --- Credit Management ---
  async getCreditAccount(businessClientId: string) {
    let account = await this.prisma.client.creditAccount.findUnique({
      where: { businessClientId },
    });

    if (!account) {
        // Auto-create if not exists based on BusinessClient existing fields
        const client = await this.prisma.client.businessClient.findUnique({
            where: { id: businessClientId }
        });
        if (!client) throw new NotFoundException('Business client not found');

        account = await this.prisma.client.creditAccount.create({
            data: {
                tenantId: this.prisma.tenantId,
                businessClientId,
                creditLimit: client.creditLimit,
                balance: client.currentBalance,
                status: CreditStatus.ACTIVE,
            }
        });
    }

    return account;
  }

  async updateCreditLimit(businessClientId: string, limit: number, status?: CreditStatus) {
    const account = await this.getCreditAccount(businessClientId);

    const updated = await this.prisma.client.creditAccount.update({
      where: { id: account.id },
      data: { 
          creditLimit: limit,
          ...(status && { status })
      },
    });

    // Sync back to BusinessClient for compatibility
    await this.prisma.client.businessClient.update({
        where: { id: businessClientId },
        data: { creditLimit: limit }
    });

    return updated;
  }

  // --- Customer 360 View ---
  async getCustomer360(id: string) {
    const client = await this.prisma.client.businessClient.findUnique({
      where: { id },
      include: {
        contacts: true,
        addresses: true,
        orders: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { items: true }
        },
        sales: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { payments: true }
        },
        invoices: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        },
        crmActivities: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        },
        crmNotes: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        },
        creditAccount: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Customer not found');
    }

    // Determine Risk Level
    let riskLevel = 'LOW';
    if (client.creditAccount) {
        const balance = client.creditAccount.balance.toNumber();
        const limit = client.creditAccount.creditLimit.toNumber();
        if (balance > limit) {
            riskLevel = 'CRITICAL';
        } else if (balance > limit * 0.8) {
            riskLevel = 'HIGH';
        } else if (balance > limit * 0.5) {
            riskLevel = 'MEDIUM';
        }
    }
    if (client.creditAccount?.status === CreditStatus.BLOCKED) {
        riskLevel = 'BLOCKED';
    }

    // Customer Segmentation (Simplified logic)
    let segmentation = 'Active';
    const totalSpent = client.sales.reduce((sum, s) => sum + s.total.toNumber(), 0);
    if (totalSpent > 100000) segmentation = 'VIP';
    else if (client.sales.length === 0) segmentation = 'Inactive';
    else if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') segmentation = 'Risky';

    return {
      profile: {
        id: client.id,
        name: client.businessName,
        email: client.primaryEmail,
        phone: client.primaryPhone,
        status: client.status,
        segmentation,
        riskLevel,
      },
      contacts: client.contacts,
      addresses: client.addresses,
      orderHistory: client.orders,
      paymentHistory: client.sales.flatMap(s => s.payments),
      invoiceHistory: client.invoices,
      timeline: [
        ...client.crmActivities.map(a => ({ type: 'ACTIVITY', data: a, timestamp: a.createdAt })),
        ...client.crmNotes.map(n => ({ type: 'NOTE', data: n, timestamp: n.createdAt })),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      credit: client.creditAccount,
    };
  }
}
