import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountingModule } from './accounting/accounting.module';
import { BranchesModule } from './branches/branches.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { IdempotencyMiddleware } from './common/middleware/idempotency.middleware';
import { LanguageMiddleware } from './common/middleware/language.middleware';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { ReturnsModule } from './returns/returns.module';
import { PaymentsModule } from './payment/payment.module';
import { CashSessionModule } from './cash-session/cash-session.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { ZReportsModule } from './z-reports/z-reports.module';
import { StripePaymentsModule } from './stripe-payments/stripe-payments.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { TaxModule } from './taxes/tax.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ReportsModule } from './reports/reports.module';
import { AccountingReportsModule } from './accounting/reports/accounting-reports.module';
import { BusinessClientsModule } from './business-clients/business-clients.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PublicInventoryModule } from './public-inventory/public-inventory.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { LogisticsModule } from './logistics/logistics.module';
import { CustomerPortalModule } from './customer-portal/customer-portal.module';
import { MobileModule } from './mobile/mobile.module';
import { FinanceModule } from './finance/finance.module';
import { SharedModule } from './shared/shared.module';
import { PurchaseReturnsModule } from './purchase-returns/purchase-returns.module';
import { TenantAdminModule } from './tenant-admin/tenant-admin.module';
import { SalesExtensionsModule } from './sales-extensions/sales-extensions.module';
import { ProcurementModule } from './procurement/procurement.module';
import { AdminModule } from './admin/admin.module';
import { I18nModule } from './i18n/i18n.module';
import { LanguageResponseInterceptor } from './common/interceptors/language-response.interceptor';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        PrismaModule,
        AuthModule,
        UsersModule,
        // Removed empty/non-existent modules: UsersModule, TenantsModule, ComplianceModule
        AccountingModule,
        AccountingReportsModule,
        TaxModule,
        CustomersModule,
        SuppliersModule,
        PurchaseOrdersModule,
        InventoryModule,
        SalesModule,
        WarehouseModule,
        CustomerPortalModule,
        MobileModule,
        PaymentsModule,
        CashSessionModule,
        InvoicesModule,
        ReceiptsModule,
        ZReportsModule,
        StripePaymentsModule,
        AnalyticsModule,
        ReportsModule,
        BusinessClientsModule,
        CartModule,
        OrdersModule,
        PublicInventoryModule,
        LogisticsModule,
        BranchesModule,
        ReturnsModule,
        FinanceModule,
        SharedModule,
        PurchaseReturnsModule,
        TenantAdminModule,
        SalesExtensionsModule,
        ProcurementModule,
        AdminModule,
        I18nModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LanguageResponseInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // G-10: Correlation ID on every request for traceability
        consumer
            .apply(CorrelationIdMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });

        // G-09: Idempotency on mutating requests
        consumer
            .apply(IdempotencyMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });

        // Tenant context (auth routes excluded)
        consumer
            .apply(TenantMiddleware)
            .exclude({ path: 'auth/(.*)', method: RequestMethod.ALL })
            .forRoutes({ path: '*', method: RequestMethod.ALL });

        // Language resolution (runs after TenantMiddleware)
        consumer
            .apply(LanguageMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
