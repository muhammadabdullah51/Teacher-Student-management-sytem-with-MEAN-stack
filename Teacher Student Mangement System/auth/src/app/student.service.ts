import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private studentsUrl = 'http://localhost:3000/students';  // URL to web API
  public studentsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public students$: Observable<any[]> = this.studentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getAllStudents().subscribe();  // Initialize the students list on service creation
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getAllStudents(): Observable<any[]> {
    return this.http.get<any[]>(this.studentsUrl, { headers: this.getHeaders() }).pipe(
      tap(students => this.studentsSubject.next(students))
    );
  }

  createStudent(student: any): Observable<any> {
    return this.http.post<any>(this.studentsUrl, student, { headers: this.getHeaders() }).pipe(
      tap(newStudent => {
        const currentStudents = this.studentsSubject.value;
        this.studentsSubject.next([...currentStudents, newStudent]);
      })
    );
  }

  updateStudent(id: string, student: any): Observable<any> {
    return this.http.put<any>(`${this.studentsUrl}/${id}`, student, { headers: this.getHeaders() }).pipe(
      tap(updatedStudent => {
        const currentStudents = this.studentsSubject.value.map(s => s._id === id ? updatedStudent : s);
        this.studentsSubject.next(currentStudents);
      })
    );
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.studentsUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => {
        const currentStudents = this.studentsSubject.value.filter(s => s._id !== id);
        this.studentsSubject.next(currentStudents);
      })
    );
  }
}
