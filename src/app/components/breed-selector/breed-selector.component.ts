import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatService } from '../../services/cat.service';
import { CatBreed } from '../../models/cat.model';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-breed-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './breed-selector.component.html',
  styleUrls: ['./breed-selector.component.css']
})
export class BreedSelectorComponent implements OnInit {
  breeds: CatBreed[] = [];
  selectedBreedId: string = '';
  isLoading: boolean = false;
  error: string = '';
  
  @Output() breedSelected = new EventEmitter<string>();

  constructor(private catService: CatService) {}

  ngOnInit(): void {
    this.loadBreeds();
  }

loadBreeds(): void {
  this.isLoading = true;
  this.error = '';
  
  this.catService.getAllBreeds().subscribe({
    next: (response) => {
      if (response && response.success && response.breeds) {
        this.breeds = response.breeds;
        this.breeds.sort((a, b) => a.name.localeCompare(b.name));
        
        if (this.breeds.length > 0) {
          this.selectedBreedId = this.breeds[0].id;
          this.onBreedChange();
        }
      } else {
        this.error = 'No se encontraron razas disponibles';
      }
    },
    error: (error) => {
      console.error('Error al cargar las razas:', error);
      this.error = 'Error al cargar las razas de gatos';
      this.isLoading = false;
    },
    complete: () => {
      this.isLoading = false;
    }
  });
}

  onBreedChange(): void {
    if (this.selectedBreedId) {
      this.breedSelected.emit(this.selectedBreedId);
    }
  }

  trackByBreedId(index: number, breed: CatBreed): string {
    return breed.id;
  }

  getBreedImage(breed: CatBreed): string {
    if (breed.image?.url) return breed.image.url;
    if (breed.reference_image_id) return `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
    return '';
  }

  onImageError(event: Event, breed: CatBreed): void {
    const imgElement = event.target as HTMLImageElement;
    if (breed.reference_image_id && !imgElement.src.includes(breed.reference_image_id)) {
      // Try to use the reference image ID if available
      imgElement.src = `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
    } else {
      // Fallback to a placeholder
      imgElement.style.display = 'none';
      const icon = imgElement.nextElementSibling as HTMLElement;
      if (icon && icon.tagName === 'MAT-ICON') {
        icon.style.display = 'block';
      }
    }
  }
}