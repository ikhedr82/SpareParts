import { CreateBusinessClientDto } from './create-business-client.dto';
declare const UpdateBusinessClientDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateBusinessClientDto>>;
export declare class UpdateBusinessClientDto extends UpdateBusinessClientDto_base {
    status?: string;
}
export {};
