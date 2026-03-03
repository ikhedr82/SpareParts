import { CashSessionService } from './cash-session.service';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
export declare class CashSessionController {
    private readonly cashSessionService;
    constructor(cashSessionService: CashSessionService);
    open(dto: OpenCashSessionDto, req: any): Promise<any>;
    close(dto: CloseCashSessionDto, req: any): Promise<any>;
    getCurrent(req: any): Promise<any>;
}
