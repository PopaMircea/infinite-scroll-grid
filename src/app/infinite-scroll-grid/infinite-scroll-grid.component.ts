import {Component, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Images, ImagesService} from "./images.service";
import {BehaviorSubject, finalize,} from "rxjs";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {saveAs} from "file-saver";

@Component({
  selector: 'app-infinite-scroll-grid',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './infinite-scroll-grid.component.html',
  styleUrls: ['./infinite-scroll-grid.component.scss']
})
export class InfiniteScrollGridComponent implements OnInit {

  pages$$: BehaviorSubject<{ pageNumber: number, images: Images[] }[]> = new BehaviorSubject<{
    pageNumber: number,
    images: Images[]
  }[]>([]);
  page: number = 1;
  allImagesFullyLoaded: boolean = false;
  latestBatch!: { images: Images[]; pageNumber: number };

  constructor(private imageService: ImagesService, private elementRef: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.loadImages();
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeAllGridItems();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollPosition = window.scrollY;
    let maxScroll = document.body.offsetHeight - window.innerHeight;
    if (scrollPosition >= maxScroll && this.allImagesFullyLoaded) {
      this.allImagesFullyLoaded = false;
      const lastPage = this.pages$$.getValue()[1]?.pageNumber;
      lastPage && lastPage > this.page ? this.page = lastPage + 1 : this.page++;
      this.loadImages();
    }

    // Scroll up
    if (scrollPosition === 0 && this.page > 1) {
      this.page--;
      this.loadPreviousPage();
      setTimeout(() => {
        window.scrollBy({
          top: (document.body.offsetHeight - window.innerHeight) / 2,
        })
      }, 100)
    }
  }

  loadImages(): void {
    this.imageService.getImages(this.page).subscribe(newImages => {
      const currentValue = this.pages$$.getValue();
      this.latestBatch = {pageNumber: this.page, images: newImages}
      if (currentValue.length === 0) {
        this.pages$$.next([this.latestBatch]);
        return;
      }
      if (currentValue.length === 1) {
        this.pages$$.next([...currentValue, this.latestBatch])
        return;
      }
      currentValue.splice(0, 1);
      this.pages$$.next([...currentValue, this.latestBatch])
    })
  }

  setLoaded(image: any, last: boolean) {
    image.loaded = true;
    this.allImagesFullyLoaded = this.latestBatch.images.every(image => image.loaded);
    if (this.allImagesFullyLoaded) {
      this.resizeAllGridItems()
    }
  }

  resizeGridItem(item: HTMLElement): void {
    const grid = this.elementRef.nativeElement.querySelector('.container');
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    const rowSpan = Math.ceil(
      (item.querySelector('.image')!.getBoundingClientRect().height + rowGap) / ((rowHeight + rowGap))
    );
    this.renderer.setStyle(item, 'gridRowEnd', `span ${rowSpan + 2}`);
  }

  resizeAllGridItems(): void {
    const allItems = this.elementRef.nativeElement.querySelectorAll('.masonry-item');
    allItems.forEach((item: HTMLElement) => {
      this.resizeGridItem(item);
    });
  }

  downloadImage(image: any) {
    this.imageService.getImageBlob(image.urls.full).pipe(
    ).subscribe(blob => {
      const filename = image.alt_description + '.jpg';
      saveAs(blob, filename)
    })
  }

  private loadPreviousPage() {
    while (this.pages$$.getValue().some(page => page.pageNumber === this.page) && this.page > 1) {
      this.page--;
    }
    this.imageService.getImages(this.page).subscribe(newImages => {
      const currentValue = this.pages$$.getValue();
      this.latestBatch = {pageNumber: this.page, images: newImages}
      currentValue.splice(1, 1);
      this.pages$$.next([this.latestBatch, ...currentValue])
    })
  }
}
