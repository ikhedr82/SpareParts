import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class EventBus {
    private eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    emit(eventName: string, payload: any): void;
}
