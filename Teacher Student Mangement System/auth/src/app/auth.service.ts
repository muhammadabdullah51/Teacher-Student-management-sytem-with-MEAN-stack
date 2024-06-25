// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;
  private userName = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken;
      const decodedToken: any = jwtDecode(this.token);
      this.userName.next(decodedToken.name);
    }
  }

  register(user: any): Observable<any> {
    return this.http.post('http://localhost:3000/register', user).pipe(
      tap((response: any) => {
        console.log('User registered successfully', response);
      }),
      catchError(error => {
        console.error('Error registering user', error);
        throw error;
      })
    );;
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post('http://localhost:3000/login', credentials).subscribe(
        (response: any) => {
          this.token = response.token;
          if (this.token) {
            localStorage.setItem('token', this.token);
            const decodedToken: any = jwtDecode(this.token);
            this.userName.next(decodedToken.name);
          }
          observer.next(response);
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    });
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    this.userName.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUserName(): Observable<string | null> {
    return this.userName.asObservable();
  }

  getToken(): string | null {
    return this.token;
  }
}
