import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReceiptsComponent } from './receipts';

describe('ReceiptsComponent', () => {
  let component: ReceiptsComponent;
  let fixture: ComponentFixture<ReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptsComponent],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
