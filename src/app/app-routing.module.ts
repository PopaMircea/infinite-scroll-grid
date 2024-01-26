import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {InfiniteScrollGridComponent} from "./infinite-scroll-grid/infinite-scroll-grid.component";

const routes: Routes = [
  {path: '**', component: InfiniteScrollGridComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
