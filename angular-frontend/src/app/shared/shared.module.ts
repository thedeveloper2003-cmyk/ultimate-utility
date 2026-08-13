import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ButtonComponent],
  imports: [CommonModule, HttpClientModule],
  exports: [ButtonComponent, CommonModule]
})
export class SharedModule {}
