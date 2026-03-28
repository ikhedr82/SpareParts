import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  entity: 'ORDER' | 'SALE' | 'TRIP' | 'INVENTORY' | 'STOCK_ADJUSTMENT' | 'PAYMENT';
  payload: any;
  version: number;
  sequenceNumber: number;
  deviceId: string;
  clientTimestamp: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  retryCount: number;
}

const QUEUE_KEY = '@partivo_sync_queue';
const DEVICE_ID_KEY = '@partivo_device_id';
const MAX_RETRIES = 5;

class SyncQueueManager {
  private isProcessing = false;

  async getDeviceId() {
    let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
       id = 'dev_' + Date.now() + Math.random().toString(36).substring(7);
       await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  async enqueue(operationParams: Omit<SyncOperation, 'id' | 'sequenceNumber' | 'deviceId' | 'clientTimestamp' | 'retryCount'>) {
    const queue = await this.getQueue();
    const deviceId = await this.getDeviceId();
    
    const op: SyncOperation = {
      ...operationParams,
      id: 'op_' + Date.now() + Math.random().toString(36).substring(7),
      sequenceNumber: Date.now(),
      deviceId,
      clientTimestamp: Date.now(),
      retryCount: 0
    };
    
    queue.push(op);
    await this.saveQueue(queue);
    
    this.processQueue().catch(console.error);
    return op.id;
  }
  
  async getQueue(): Promise<SyncOperation[]> {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  async saveQueue(queue: SyncOperation[]) {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
  
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      let queue = await this.getQueue();
      if (queue.length === 0) return;
      
      // Priority sorting
      queue.sort((a, b) => {
         const pWeights = { HIGH: 1, MEDIUM: 2, LOW: 3 };
         if (pWeights[a.priority] !== pWeights[b.priority]) {
            return pWeights[a.priority] - pWeights[b.priority];
         }
         return a.sequenceNumber - b.sequenceNumber; // Ordering
      });
      
      // Batch size limit to prevent huge payloads
      const batch = queue.slice(0, 50);
      
      const response = await apiClient.post('/api/sync/batch', { operations: batch });
      const { success, failed } = response.data;
      
      // Remove successful events
      queue = queue.filter(op => !success.includes(op.id));
      
      // Handle partial failures via exponential backoff / retry max
      for (const fail of failed) {
        const op = queue.find(q => q.id === fail.id);
        if (op) {
           op.retryCount++;
           if (op.retryCount >= MAX_RETRIES) {
             queue = queue.filter(q => q.id !== op.id); // Permanently fail
             console.warn('Dropped permanent failed op', op.id, fail.reason);
           }
        }
      }
      
      await this.saveQueue(queue);

      // If there are still items and we succeeded, process next batch
      if (queue.length > 0 && success.length > 0) {
        setTimeout(() => this.processQueue(), 2000);
      }
      
    } catch (err) {
      console.warn('Batch process failed (device offline or server error)', err);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const SyncQueue = new SyncQueueManager();
