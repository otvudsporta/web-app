import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'Login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading: boolean;

  data = {
    login: <LoginData>{},
    register: <RegisterData>{}
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  login(data: LoginData) {
    this.loading = true;
    this.authService.login(data.email, data.password)
      .then(() => this.router.navigate(['/']))
      .catch(() => this.loading = false)
    ;
  }

  register(data: RegisterData) {
    if (data.password !== data.passwordConfirmation) {
      throw new Error(`Паролата не съвпада с потвърждението! Моля, опитайте отново!`);
    }

    this.loading = true;
    this.authService.register(data.email, data.password)
      .then(() => this.router.navigate(['/']))
      .catch(() => this.loading = false)
    ;
  }
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
}