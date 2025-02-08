import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:3000';


  // Fetch all users from MongoDB
  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }
}