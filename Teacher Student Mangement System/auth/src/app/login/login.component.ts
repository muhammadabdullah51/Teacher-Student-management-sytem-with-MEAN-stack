import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.credentials).subscribe((res: any) => {
      localStorage.setItem('token', res.token);
      this.router.navigate(['/protected']);
    }, error => {
      this.errorMessage = 'Invalid email or password';
    });
  }
}
