import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BreedSelectorComponent } from '../../components/breed-selector/breed-selector.component';
import { BreedDetailComponent } from '../../components/breed-detail/breed-detail.component';
import { BreedsTableComponent } from '../../components/breeds-table/breeds-table.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
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