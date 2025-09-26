
import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ImageUploadProgress {
  percentage: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface ImageData {
  url: string;
  publicId: string;
  filename: string;
  optimizedUrls: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = environment.apiUrl;
  private uploadProgress = new BehaviorSubject<ImageUploadProgress | null>(null);

  constructor(private http: HttpClient) { }
  getUploadProgress(): Observable<ImageUploadProgress | null> {
    return this.uploadProgress.asObservable();
  }
  uploadDevelopmentImage(developmentId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    this.uploadProgress.next({ percentage: 0, status: 'uploading' });

    return this.http.post(
      `${this.apiUrl}/developments/${developmentId}/image`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      map((event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentage = Math.round((event.loaded * 100) / event.total!);
          this.uploadProgress.next({ percentage, status: 'uploading' });
          return { status: 'progress', percentage };
        } else if (event instanceof HttpResponse) {
          this.uploadProgress.next({ percentage: 100, status: 'completed' });
          return event.body;
        }
        return event;
      })
    );
  }
  removeDevelopmentImage(developmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/developments/${developmentId}/image`);
  }
  getDevelopmentImage(developmentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/developments/${developmentId}/image`);
  }
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo 10MB.'
      };
    }

    return { valid: true };
  }
  resetProgress(): void {
    this.uploadProgress.next(null);
  }
}