import { Component, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Animaciones
import { trigger, transition, style, animate } from '@angular/animations';

// Servicios y modelos
import { CatService } from '../../services/cat.service';
import { CatBreed } from '../../models/cat.model';

@Component({
  selector: 'app-breeds-table',
  standalone: true,
  templateUrl: './breeds-table.component.html',
  styleUrls: ['./breeds-table.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatDividerModule,
    BrowserAnimationsModule
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('200ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ])
  ]
})
export class BreedsTableComponent implements OnInit, AfterViewInit {
  // Expose Math object to template
  Math = Math;
  
  breeds: CatBreed[] = [];
  filteredBreeds: CatBreed[] = [];
  pagedBreeds: CatBreed[] = [];
  displayedColumns: string[] = ['image', 'name', 'temperament', 'actions'];
  isLoading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  
  // Vistas
  isGridView: boolean = false;
  
  // Filtros
  showAdvancedFilters: boolean = false;
  selectedOrigin: string[] = [];
  selectedTemperaments: string[] = [];
  availableOrigins: string[] = [];
  availableTemperaments: string[] = [];
  
  // Paginación
  pageSize = 10;
  pageIndex = 0;
  currentPage = 1;
  totalPages = 1;
  pageSizeOptions = [5, 10, 20, 50];
  
  // Ordenamiento
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedBreedId: string | null = null;
  
  // Scroll
  showBackToTop: boolean = false;
  private scrollThreshold = 300;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private catService: CatService
  ) {}

  ngOnInit(): void {
    this.loadBreeds();
  }

  ngAfterViewInit() {
    // Configure paginator internationalization after view init
    if (this.paginator) {
      const paginatorIntl = new MatPaginatorIntl();
      paginatorIntl.itemsPerPageLabel = 'Razas por página:';
      paginatorIntl.nextPageLabel = 'Siguiente página';
      paginatorIntl.previousPageLabel = 'Página anterior';
      paginatorIntl.firstPageLabel = 'Primera página';
      paginatorIntl.lastPageLabel = 'Última página';
      paginatorIntl.getRangeLabel = this.getRangeLabel.bind(this);
      this.paginator._intl = paginatorIntl;
    }
    
    // Configurar el scroll para el botón de volver arriba
    this.checkScroll();
  }
  
  @HostListener('window:scroll')
  onWindowScroll() {
    this.checkScroll();
  }
  
  private checkScroll() {
    this.showBackToTop = window.pageYOffset > this.scrollThreshold;
  }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadBreeds(): void {
    this.isLoading = true;
    this.error = null;
    
    this.catService.getAllBreeds().subscribe({
      next: (response) => {
        if (response.success && response.breeds?.length) {
          this.breeds = response.breeds;
          this.filteredBreeds = [...this.breeds];
          this.extractFilterOptions();
          this.applySorting();
          this.updatePagination();
          console.log('Breeds loaded:', this.breeds);
        } else {
          this.error = 'No se encontraron razas de gatos.';
          console.error('No breeds found or invalid response:', response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading breeds:', error);
        this.error = 'Error al cargar las razas de gatos. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }
  
  private extractFilterOptions(): void {
    // Extraer orígenes únicos
    const origins = new Set<string>();
    const temperaments = new Set<string>();
    
    this.breeds.forEach(breed => {
      if (breed.origin) {
        origins.add(breed.origin);
      }
      
      if (breed.temperament) {
        const traits = this.getTemperamentTraits(breed.temperament);
        traits.forEach(trait => temperaments.add(trait));
      }
    });
    
    this.availableOrigins = Array.from(origins).sort();
    this.availableTemperaments = Array.from(temperaments).sort();
  }

  applyFilter(): void {
    this.applyFilters();
  }
  
  applyFilters(): void {
    let filtered = [...this.breeds];
    
    // Aplicar búsqueda por término
    if (this.searchTerm.trim()) {
      const searchTerms = this.searchTerm.trim().toLowerCase().split(/\s+/).filter(t => t.length > 0);
      
      filtered = filtered.filter(breed => {
        const searchableText = [
          breed.name,
          breed.description,
          breed.temperament,
          breed.origin,
          breed.alt_names || '',
          breed.life_span || ''
        ].join(' ').toLowerCase();
        
        return searchTerms.every(t => searchableText.includes(t));
      });
    }
    
    // Aplicar filtros de origen
    if (this.selectedOrigin.length > 0) {
      filtered = filtered.filter(breed => 
        breed.origin && this.selectedOrigin.includes(breed.origin)
      );
    }
    
    // Aplicar filtros de temperamento
    if (this.selectedTemperaments.length > 0) {
      filtered = filtered.filter(breed => {
        if (!breed.temperament) return false;
        const breedTemperaments = this.getTemperamentTraits(breed.temperament);
        return this.selectedTemperaments.some(temp => 
          breedTemperaments.some(bt => 
            bt.toLowerCase().includes(temp.toLowerCase())
          )
        );
      });
    }
    
    this.filteredBreeds = filtered;
    this.pageIndex = 0;
    this.applySorting();
    
    // Scroll to top of the table after filtering
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
  
  hasActiveFilters(): boolean {
    return this.selectedOrigin.length > 0 || 
           this.selectedTemperaments.length > 0 || 
           !!this.searchTerm.trim();
  }
  
  removeFilter(type: 'origin' | 'temperament', value: string): void {
    if (type === 'origin') {
      this.selectedOrigin = this.selectedOrigin.filter(o => o !== value);
    } else {
      this.selectedTemperaments = this.selectedTemperaments.filter(t => t !== value);
    }
    this.applyFilters();
  }
  
  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedOrigin = [];
    this.selectedTemperaments = [];
    this.applyFilters();
  }

  applySorting(): void {
    this.filteredBreeds.sort((a, b) => {
      const aValue = a[this.sortColumn as keyof CatBreed];
      const bValue = b[this.sortColumn as keyof CatBreed];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });
    
    this.updatePagination();
  }

  getBreedImage(breed: CatBreed): string {
    if (breed.image?.url) {
      return breed.image.url;
    }
    if (breed.reference_image_id) {
      return `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
    }
    return '';
  }

  onImageError(event: any, breed: CatBreed): void {
    console.error(`Error loading image for ${breed.name}`, event);
    event.target.style.display = 'none';
  }

  getShortTemperament(temperament: string | undefined): string {
    if (!temperament) return 'Sin información de temperamento';
    const maxLength = 80;
    return temperament.length > maxLength 
      ? `${temperament.substring(0, maxLength)}...` 
      : temperament;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
    // Set focus back to search input
    setTimeout(() => {
      const searchInput = document.querySelector('input[matInput]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    });
  }

  getTemperamentTraits(temperament: string | undefined): string[] {
    if (!temperament) return [];
    return temperament.split(',').map(t => t.trim());
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.updatePagination();
    
    // Scroll suave a la parte superior de la tabla
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  private updatePagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedBreeds = this.filteredBreeds.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredBreeds.length / this.pageSize);
    this.currentPage = this.pageIndex + 1;
  }

  viewDetails(breed: CatBreed): void {
    if (breed.id) {
      // Navegar a la página de detalles de la raza
      // this.router.navigate(['/breeds', breed.id]);
      console.log('Ver detalles de:', breed.name);
    }
  }

  getTotalCount(): number {
    return this.filteredBreeds.length;
  }
  
  toggleView(): void {
    this.isGridView = !this.isGridView;
    // Guardar preferencia en localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('breedsViewMode', this.isGridView ? 'grid' : 'table');
    }
  }

  // Custom range label for paginator
  private getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? 
      Math.min(startIndex + pageSize, length) : 
      startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

  onSortChange(sort: Sort): void {
    if (sort.direction) {
      this.sortColumn = sort.active;
      this.sortDirection = sort.direction;
      this.applySorting();
    }
  }
  
  // Método para manejar el clic en una tarjeta en la vista de cuadrícula
  onCardClick(breed: CatBreed, event: Event): void {
    // Evitar la propagación para que no interfiera con otros manejadores
    event.stopPropagation();
    this.viewDetails(breed);
  }
}