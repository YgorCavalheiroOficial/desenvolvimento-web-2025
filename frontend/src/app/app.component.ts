import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importe CommonModule
import { RouterOutlet } from '@angular/router'; // Importe RouterOutlet
import { HttpClientModule } from '@angular/common/http'; // Importe HttpClientModule
import { DataService } from './services/data';

@Component({
  selector: 'app-root',
  standalone: true, // Torne o componente autônomo
  imports: [CommonModule, RouterOutlet, HttpClientModule], // Adicione os módulos que ele precisa
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  apiResponse: any;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getData().subscribe(response => {
      this.apiResponse = response;
      console.log(this.apiResponse);
    });
  }
}