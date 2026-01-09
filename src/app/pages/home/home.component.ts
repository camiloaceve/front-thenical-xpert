import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BreedSelectorComponent } from '../../components/breed-selector/breed-selector.component';
import { BreedDetailComponent } from '../../components/breed-detail/breed-detail.component';
import { BreedsTableComponent } from '../../components/breeds-table/breeds-table.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Angular Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    // Componentes
    BreedSelectorComponent,
    BreedDetailComponent,
    BreedsTableComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectedBreedId: string = '';
  activeTabIndex: number = 0;

  constructor() {
    console.log('HomeComponent - Constructor');
  }
  ngOnInit(): void {
    console.log('HomeComponent - ngOnInit');
  }

  onBreedSelected(breedId: string): void {
    this.selectedBreedId = breedId;
    if (breedId) {
      this.activeTabIndex = 1; // Cambia a la pestaña de detalles
    }
  }

  setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }
}