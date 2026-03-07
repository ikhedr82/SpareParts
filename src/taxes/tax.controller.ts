import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TaxService } from './tax.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('taxes')
@UseGuards(JwtAuthGuard)
export class TaxController {
    constructor(private readonly taxService: TaxService) { }

    @Post()
    create(@Body() dto: CreateTaxRateDto) {
        return this.taxService.create(dto);
    }

    @Get()
    findAll() {
        return this.taxService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.taxService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: CreateTaxRateDto) {
        return this.taxService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.taxService.remove(id);
    }
}
