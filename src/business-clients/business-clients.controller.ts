import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BusinessClientsService } from './business-clients.service';
import { CreateBusinessClientDto } from './dto/create-business-client.dto';
import { UpdateBusinessClientDto } from './dto/update-business-client.dto';
import { CreateBusinessClientContactDto } from './dto/create-business-client-contact.dto';
import { CreateBusinessClientAddressDto } from './dto/create-business-client-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessClientType } from '@prisma/client';

@Controller('business-clients')
@UseGuards(JwtAuthGuard)
export class BusinessClientsController {
    constructor(private readonly businessClientsService: BusinessClientsService) { }

    @Post()
    create(@Body() createBusinessClientDto: CreateBusinessClientDto) {
        return this.businessClientsService.create(createBusinessClientDto);
    }

    @Get()
    findAll(@Query('type') type?: BusinessClientType) {
        return this.businessClientsService.findAll(type);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.businessClientsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBusinessClientDto: UpdateBusinessClientDto) {
        return this.businessClientsService.update(id, updateBusinessClientDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.businessClientsService.remove(id);
    }

    @Get(':id/balance')
    getBalance(@Param('id') id: string) {
        return this.businessClientsService.getBalance(id);
    }

    // Contact endpoints
    @Post(':id/contacts')
    addContact(
        @Param('id') id: string,
        @Body() createContactDto: CreateBusinessClientContactDto,
    ) {
        return this.businessClientsService.addContact(id, createContactDto);
    }

    @Get(':id/contacts')
    findContacts(@Param('id') id: string) {
        return this.businessClientsService.findContacts(id);
    }

    @Patch(':id/contacts/:contactId')
    updateContact(
        @Param('id') id: string,
        @Param('contactId') contactId: string,
        @Body() updateContactDto: Partial<CreateBusinessClientContactDto>,
    ) {
        return this.businessClientsService.updateContact(id, contactId, updateContactDto);
    }

    @Delete(':id/contacts/:contactId')
    removeContact(@Param('id') id: string, @Param('contactId') contactId: string) {
        return this.businessClientsService.removeContact(id, contactId);
    }

    // Address endpoints
    @Post(':id/addresses')
    addAddress(
        @Param('id') id: string,
        @Body() createAddressDto: CreateBusinessClientAddressDto,
    ) {
        return this.businessClientsService.addAddress(id, createAddressDto);
    }

    @Get(':id/addresses')
    findAddresses(@Param('id') id: string) {
        return this.businessClientsService.findAddresses(id);
    }

    @Patch(':id/addresses/:addressId')
    updateAddress(
        @Param('id') id: string,
        @Param('addressId') addressId: string,
        @Body() updateAddressDto: Partial<CreateBusinessClientAddressDto>,
    ) {
        return this.businessClientsService.updateAddress(id, addressId, updateAddressDto);
    }

    @Delete(':id/addresses/:addressId')
    removeAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
        return this.businessClientsService.removeAddress(id, addressId);
    }
}
