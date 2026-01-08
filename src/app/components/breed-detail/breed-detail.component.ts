import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatService } from '../../services/cat.service';
import { CatBreed, CatImage } from '../../models/cat.model';
import { CarouselModule, CarouselConfig } from 'ngx-bootstrap/carousel';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-breed-detail',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule
  ],
  providers: [
    { provide: CarouselConfig, useValue: { interval: 3000, noPause: true, showIndicators: true } }
  ],
  templateUrl: './breed-detail.component.html',
  styleUrls: ['./breed-detail.component.css']
})
export class BreedDetailComponent implements OnInit, OnChanges {
  @Input() breedId: string = '';
  
  breed: CatBreed | null = null;
  images: CatImage[] = [];
  isLoading: boolean = false;
  error: string = '';
  activeTabIndex: number = 0;

  constructor(private catService: CatService) {}

  ngOnInit(): void {
    if (this.breedId) {
      this.loadBreedDetails();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['breedId'] && !changes['breedId'].firstChange) {
      this.loadBreedDetails();
    }
  }

  loadBreedDetails(): void {
    if (!this.breedId) return;
    
    this.isLoading = true;
    this.error = '';
    this.breed = null;
    this.images = [];

    // Cargar detalles de la raza
    this.catService.getBreedById(this.breedId).subscribe({
      next: (response) => {
        if (response.success && response.breed) {
          this.breed = response.breed;
        } else {
          this.error = 'No se pudo cargar la información de la raza';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading breed details:', error);
        this.error = 'Error al cargar los detalles de la raza';
        this.isLoading = false;
      }
    });

    // Cargar imágenes
    this.catService.getImagesByBreedId(this.breedId, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.images = response.images || [];
        } else {
          console.warn('No se pudieron cargar las imágenes de la raza');
        }
      },
      error: (error) => {
        console.error('Error loading images:', error);
        // No mostramos error al usuario si falla la carga de imágenes
      }
    });
  }

  getTemperamentArray(): string[] {
    return this.breed?.temperament?.split(', ').filter(Boolean) || [];
  }

  getCharacteristicLevel(level: number | undefined): string {
    if (level === undefined || level === null) return 'No especificado';
    if (level >= 4) return 'Alto';
    if (level >= 2) return 'Medio';
    return 'Bajo';
  }

  getCharacteristicClass(level: number | undefined): string {
    if (level === undefined || level === null) return 'unknown';
    if (level >= 4) return 'high';
    if (level >= 2) return 'medium';
    return 'low';
  }
}