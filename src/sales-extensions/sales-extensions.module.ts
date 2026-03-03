import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SalesExtensionsController } from './sales-extensions.controller';
import { SalesExtensionsService } from './sales-extensions.service';
import { QuoteService } from './quote.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [SalesExtensionsController],
    providers: [SalesExtensionsService, QuoteService],
})
export class SalesExtensionsModule { }
