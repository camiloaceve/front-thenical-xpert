import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CatBreed, CatImage } from '../models/cat.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0')
      .set('Pragma', 'no-cache')
      .set('Expires', '0');
  }

  private getDefaultOptions(): { headers: HttpHeaders, params: HttpParams } {
    return {
      headers: this.getHeaders(),
      params: new HttpParams().set('t', Date.now().toString())
    };
  }

  getAllBreeds(): Observable<{ success: boolean; breeds: CatBreed[] }> {
    const options = this.getDefaultOptions();
    return this.http.get<any>(
      `${this.apiUrl}/cats/breeds`,
      options
    ).pipe(
      map(response => {
        console.log('Breeds API Response:', response); // Add this line to debug

        // Handle different possible response formats
        if (response && Array.isArray(response)) {
          return {
            success: true,
            breeds: response.map(breed => this.mapBreed(breed))
          };
        }

        if (response?.success && Array.isArray(response.breeds)) {
          return {
            success: true,
            breeds: response.breeds.map((breed: any) => this.mapBreed(breed))
          };
        }

        if (response?.data?.breeds && Array.isArray(response.data.breeds)) {
          return {
            success: true,
            breeds: response.data.breeds.map((breed: any) => this.mapBreed(breed))
          };
        }

        console.warn('Unexpected API response format:', response);
        return { success: false, breeds: [] };
      }),
      catchError(error => {
        console.error('Error fetching breeds:', error);
        return of({ success: false, breeds: [] });
      })
    );
  }

  getBreedById(breedId: string): Observable<{ success: boolean; breed: CatBreed | null }> {
    const options = this.getDefaultOptions();
    return this.http.get<{ success: boolean; breed: CatBreed }>(
      `${this.apiUrl}/cats/breeds/${breedId}`,
      options
    ).pipe(
      map(response => {
        if (response?.success && response.breed) {
          return {
            success: true,
            breed: this.mapBreed(response.breed)
          };
        }
        return { success: false, breed: null };
      }),
      catchError(error => {
        console.error(`Error fetching breed ${breedId}:`, error);
        return of({ success: false, breed: null });
      })
    );
  }

  searchBreeds(query: string): Observable<{ success: boolean; breeds: CatBreed[] }> {
    const options = this.getDefaultOptions();
    const params = options.params.set('q', query);

    return this.http.get<{ success: boolean; breeds: CatBreed[] }>(
      `${this.apiUrl}/cats/breeds/search`,
      { ...options, params }
    ).pipe(
      map(response => ({
        success: response?.success || false,
        breeds: response?.breeds?.map(breed => this.mapBreed(breed)) || []
      })),
      catchError(error => {
        console.error('Error searching breeds:', error);
        return of({ success: false, breeds: [] });
      })
    );
  }

  getImagesByBreedId(breedId: string, limit: number = 5): Observable<{ success: boolean; images: any[] }> {
    const options = this.getDefaultOptions();
    const params = options.params
      .set('breed_id', breedId)
      .set('limit', limit.toString());

    return this.http.get<{ success: boolean; data: { images: any[] } }>(
      `${this.apiUrl}/images/imagesbybreedid`,
      { ...options, params }
    ).pipe(
      map(response => ({
        success: response?.success || false,
        images: response?.data?.images || []
      })),
      catchError(error => {
        console.error(`Error fetching images for breed ${breedId}:`, error);
        return of({ success: false, images: [] });
      })
    );
  }

  private mapBreed(breed: any): CatBreed {
    return {
      ...breed,
      image: breed.image || (breed.reference_image_id ? {
        id: breed.reference_image_id,
        url: `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`,
        width: 0,
        height: 0
      } : undefined)
    };
  }
}