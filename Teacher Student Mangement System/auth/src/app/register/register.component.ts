import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    username: '',
    email: '',
    password: '',
    name: ''
  };

  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.user).subscribe(
      () => {
        console.log('User registered successfully');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Registration error:', error);
        this.errorMessage = error.error.message || 'Error registering user';
      }
    );
  }
}
