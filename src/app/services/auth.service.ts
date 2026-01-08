import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/users/login`, { email, password })
    .pipe(
      tap({
        next: (response) => {
          if (response.success && response.data?.token) {
            // Store the nested user data and token
            const user = {
              ...response.data.user,
              token: response.data.token
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            this.router.navigate(['/home']);
          } else {
            throw new Error(response.message || 'Invalid response from server');
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          throw error;
        }
      }),
      catchError(error => {
        console.error('Login error in catchError:', error);
        return throwError(() => error);
      })
    );
}

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/register`, userData)
      .pipe(
        tap(user => {
          if (user && user.token) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            this.router.navigate(['/home']);
          }
          return user;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.token) {
      return false;
    }
    
    // Check if token is expired (if you're using JWT)
    try {
      const tokenPayload = JSON.parse(atob(user.token.split('.')[1]));
      return tokenPayload.exp * 1000 > Date.now();
    } catch (e) {
      console.error('Error validating token:', e);
      return false;
    }
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user ? user.token : null;
  }
}