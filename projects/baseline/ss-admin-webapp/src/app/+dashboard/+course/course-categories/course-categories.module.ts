import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCategoriesComponent } from './course-categories.component';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { routes } from './course-categories.routes';
import { CategoryEditorModule } from './category-editor/category-editor.module';
import { CategoryResolver } from './model/categorie.resolve';
import { CategoriesResolver } from './model/categories.resolve';


const materialModules = [
  MatListModule, MatIconModule
]
@NgModule({
  imports: [
    CommonModule,
    CategoryEditorModule,
    ...materialModules,
    RouterModule.forChild(routes),
  ],
  declarations: [CourseCategoriesComponent],
  providers:[
    CategoryResolver,
    CategoriesResolver
  ]
})
export class CourseCategoriesModule { }
