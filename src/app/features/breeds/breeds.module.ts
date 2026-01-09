import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { BreedSelectorComponent } from '../../components/breed-selector/breed-selector.component';
import { BreedDetailComponent } from '../../components/breed-detail/breed-detail.component';
import { BreedsTableComponent } from '../../components/breeds-table/breeds-table.component';

@NgModule({
  declarations: [
],
imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    BreedSelectorComponent,
    BreedDetailComponent,
    BreedsTableComponent
  ],
  exports: [
    BreedSelectorComponent,
    BreedDetailComponent,
    BreedsTableComponent
  ]
})
export class BreedsModule { }
