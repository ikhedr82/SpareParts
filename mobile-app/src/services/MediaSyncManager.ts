import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import apiClient from './api';
import { SyncQueue } from './SyncQueue';

const MEDIA_QUEUE_KEY = '@partivo_media_queue';
const MAX_RETRIES = 5;

export interface MediaUploadTask {
  id: string;
  localUri: string;
  mimeType: string;
  uploadEndpoint: string;
  tripStopId: string;
  fileField: 'signature' | 'photo';
  retryCount: number;
}

class MediaSyncManagerImpl {
  private processing = false;

  async enqueueUpload(localUri: string, mimeType: string, uploadEndpoint: string, tripStopId: string, fileField: 'signature' | 'photo') {
    const queue = await this.getQueue();
    
    // Copy the file to a permanent local directory to prevent cleanup
    const fileName = localUri.split('/').pop() || 'file';
    const permanentUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.copyAsync({ from: localUri, to: permanentUri });

    const task: MediaUploadTask = {
      id: 'media_' + Date.now(),
      localUri: permanentUri,
      mimeType,
      uploadEndpoint,
      tripStopId,
      fileField,
      retryCount: 0
    };

    queue.push(task);
    await this.saveQueue(queue);
    
    this.processMediaQueue().catch(console.error);
    return task.id;
  }

  private async getQueue(): Promise<MediaUploadTask[]> {
    const data = await AsyncStorage.getItem(MEDIA_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async saveQueue(queue: MediaUploadTask[]) {
    await AsyncStorage.setItem(MEDIA_QUEUE_KEY, JSON.stringify(queue));
  }

  async processMediaQueue() {
    if (this.processing) return;
    this.processing = true;

    try {
      let queue = await this.getQueue();
      if (queue.length === 0) return;

      const toRemove: string[] = [];

      for (const task of queue) {
        try {
          const fileExists = await FileSystem.getInfoAsync(task.localUri);
          if (!fileExists.exists) {
            toRemove.push(task.id);
            continue;
          }

          // In real implementation we'd use FileSystem.uploadAsync
          const response = await FileSystem.uploadAsync(task.uploadEndpoint, task.localUri, {
            fieldName: 'file',
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            headers: apiClient.defaults.headers as any
          });

          if (response.status >= 200 && response.status < 300) {
            const result = JSON.parse(response.body);
            const mediaUrl = result.url || result.path;

            // Enqueue subsequent data operation to link media 
            await SyncQueue.enqueue({
               type: 'UPDATE',
               entity: 'TRIP',
               priority: 'MEDIUM',
               payload: {
                   status: 'COMPLETED',
                   stopId: task.tripStopId,
                   [task.fileField]: mediaUrl // link media using the returned URL
               },
               version: 1
            });
            
            toRemove.push(task.id);
            // Cleanup file
            await FileSystem.deleteAsync(task.localUri, { idempotent: true });
          } else {
             task.retryCount++;
             if (task.retryCount >= MAX_RETRIES) {
                toRemove.push(task.id);
             }
          }

        } catch (error) {
           console.warn('Media upload error:', error);
           task.retryCount++;
           if (task.retryCount >= MAX_RETRIES) {
             toRemove.push(task.id);
           }
        }
      }

      // Update queue
      queue = queue.filter(t => !toRemove.includes(t.id));
      await this.saveQueue(queue);

    } finally {
      this.processing = false;
    }
  }
}

export const MediaSyncManager = new MediaSyncManagerImpl();
