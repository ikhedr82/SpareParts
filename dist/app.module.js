"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const accounting_module_1 = require("./accounting/accounting.module");
const branches_module_1 = require("./branches/branches.module");
const users_module_1 = require("./users/users.module");
const prisma_module_1 = require("./prisma/prisma.module");
const tenant_middleware_1 = require("./common/middleware/tenant.middleware");
const correlation_id_middleware_1 = require("./common/middleware/correlation-id.middleware");
const idempotency_middleware_1 = require("./common/middleware/idempotency.middleware");
const language_middleware_1 = require("./common/middleware/language.middleware");
const inventory_module_1 = require("./inventory/inventory.module");
const sales_module_1 = require("./sales/sales.module");
const returns_module_1 = require("./returns/returns.module");
const payment_module_1 = require("./payment/payment.module");
const cash_session_module_1 = require("./cash-session/cash-session.module");
const invoices_module_1 = require("./invoices/invoices.module");
const receipts_module_1 = require("./receipts/receipts.module");
const z_reports_module_1 = require("./z-reports/z-reports.module");
const stripe_payments_module_1 = require("./stripe-payments/stripe-payments.module");
const analytics_module_1 = require("./analytics/analytics.module");
const auth_module_1 = require("./auth/auth.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const tax_module_1 = require("./taxes/tax.module");
const customers_module_1 = require("./customers/customers.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const reports_module_1 = require("./reports/reports.module");
const accounting_reports_module_1 = require("./accounting/reports/accounting-reports.module");
const business_clients_module_1 = require("./business-clients/business-clients.module");
const cart_module_1 = require("./cart/cart.module");
const orders_module_1 = require("./orders/orders.module");
const public_inventory_module_1 = require("./public-inventory/public-inventory.module");
const warehouse_module_1 = require("./warehouse/warehouse.module");
const logistics_module_1 = require("./logistics/logistics.module");
const customer_portal_module_1 = require("./customer-portal/customer-portal.module");
const mobile_module_1 = require("./mobile/mobile.module");
const finance_module_1 = require("./finance/finance.module");
const shared_module_1 = require("./shared/shared.module");
const purchase_returns_module_1 = require("./purchase-returns/purchase-returns.module");
const tenant_admin_module_1 = require("./tenant-admin/tenant-admin.module");
const sales_extensions_module_1 = require("./sales-extensions/sales-extensions.module");
const procurement_module_1 = require("./procurement/procurement.module");
const admin_module_1 = require("./admin/admin.module");
const i18n_module_1 = require("./i18n/i18n.module");
const language_response_interceptor_1 = require("./common/interceptors/language-response.interceptor");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(correlation_id_middleware_1.CorrelationIdMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(idempotency_middleware_1.IdempotencyMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(tenant_middleware_1.TenantMiddleware)
            .exclude({ path: 'auth/(.*)', method: common_1.RequestMethod.ALL })
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
        consumer
            .apply(language_middleware_1.LanguageMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            accounting_module_1.AccountingModule,
            accounting_reports_module_1.AccountingReportsModule,
            tax_module_1.TaxModule,
            customers_module_1.CustomersModule,
            suppliers_module_1.SuppliersModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            inventory_module_1.InventoryModule,
            sales_module_1.SalesModule,
            warehouse_module_1.WarehouseModule,
            customer_portal_module_1.CustomerPortalModule,
            mobile_module_1.MobileModule,
            payment_module_1.PaymentsModule,
            cash_session_module_1.CashSessionModule,
            invoices_module_1.InvoicesModule,
            receipts_module_1.ReceiptsModule,
            z_reports_module_1.ZReportsModule,
            stripe_payments_module_1.StripePaymentsModule,
            analytics_module_1.AnalyticsModule,
            reports_module_1.ReportsModule,
            business_clients_module_1.BusinessClientsModule,
            cart_module_1.CartModule,
            orders_module_1.OrdersModule,
            public_inventory_module_1.PublicInventoryModule,
            logistics_module_1.LogisticsModule,
            branches_module_1.BranchesModule,
            returns_module_1.ReturnsModule,
            finance_module_1.FinanceModule,
            shared_module_1.SharedModule,
            purchase_returns_module_1.PurchaseReturnsModule,
            tenant_admin_module_1.TenantAdminModule,
            sales_extensions_module_1.SalesExtensionsModule,
            procurement_module_1.ProcurementModule,
            admin_module_1.AdminModule,
            i18n_module_1.I18nModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: language_response_interceptor_1.LanguageResponseInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map