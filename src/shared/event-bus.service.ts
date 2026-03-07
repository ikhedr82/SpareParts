import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventBus {
    constructor(private eventEmitter: EventEmitter2) { }

    emit(eventName: string, payload: any) {
        this.eventEmitter.emit(eventName, payload);
        console.log(`[EventBus] Emitted: ${eventName}`, payload);
    }
}
