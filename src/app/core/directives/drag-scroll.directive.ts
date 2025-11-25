import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDragScroll]',
  standalone: true
})
export class DragScrollDirective {
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    this.isDown = true;
    this.startX = e.pageX - this.el.nativeElement.offsetLeft;
    this.scrollLeft = this.el.nativeElement.scrollLeft;
    this.el.nativeElement.style.cursor = 'grabbing';
  }

  @HostListener('mouseleave')
  @HostListener('mouseup')
  endScroll() {
    this.isDown = false;
    this.el.nativeElement.style.cursor = 'grab';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isDown) return;
    e.preventDefault();
    const x = e.pageX - this.el.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.el.nativeElement.scrollLeft = this.scrollLeft - walk;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    this.startX = e.touches[0].pageX - this.el.nativeElement.offsetLeft;
    this.scrollLeft = this.el.nativeElement.scrollLeft;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    const x = e.touches[0].pageX - this.el.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.2;
    this.el.nativeElement.scrollLeft = this.scrollLeft - walk;
  }
}
