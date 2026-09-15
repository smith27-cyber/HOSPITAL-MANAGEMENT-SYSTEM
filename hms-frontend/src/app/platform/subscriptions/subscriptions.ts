import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Subscription,
  SubscriptionStatus
} from '../../shared/models/platform/subscription.model';

import { SubscriptionService } from '../../core/services/platform/subscription.service';


@Component({
  selector: 'app-platform-subscriptions',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './subscriptions.html',

  styleUrl: './subscriptions.css'
})
export class Subscriptions implements OnInit {

  private readonly subscriptionService =
    inject(SubscriptionService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  subscriptions: Subscription[] = [];

  loading = true;

  errorMessage = '';

  updatingSubscriptionId: number | null = null;


  ngOnInit(): void {

    this.loadSubscriptions();

  }


  // =====================================================
  // LOAD SUBSCRIPTIONS
  // =====================================================

  loadSubscriptions(): void {

    console.log(
      'PLATFORM SUBSCRIPTIONS: loading'
    );

    this.loading = true;

    this.errorMessage = '';

    this.subscriptionService
      .getAll()
      .subscribe({

        next: (subscriptions) => {

          console.log(
            'PLATFORM SUBSCRIPTIONS: received',
            subscriptions
          );

          this.subscriptions =
            subscriptions ?? [];

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'PLATFORM SUBSCRIPTIONS: failed',
            error
          );

          this.subscriptions = [];

          this.loading = false;

          this.errorMessage =
            this.getErrorMessage(error);

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // STATUS UPDATE
  // =====================================================

  updateStatus(
    subscription: Subscription,
    status: SubscriptionStatus
  ): void {

    if (
      this.updatingSubscriptionId !== null
    ) {
      return;
    }

    this.updatingSubscriptionId =
      subscription.id;

    this.subscriptionService
      .updateStatus(
        subscription.id,
        status
      )
      .subscribe({

        next: (updatedSubscription) => {

          console.log(
            'PLATFORM SUBSCRIPTION: status updated',
            updatedSubscription
          );

          const index =
            this.subscriptions.findIndex(
              item =>
                item.id === subscription.id
            );

          if (index !== -1) {

            this.subscriptions[index] =
              updatedSubscription;

          }

          this.updatingSubscriptionId =
            null;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'PLATFORM SUBSCRIPTION: status update failed',
            error
          );

          this.errorMessage =
            this.getErrorMessage(error);

          this.updatingSubscriptionId =
            null;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // TRACK BY
  // =====================================================

  trackBySubscriptionId(
    index: number,
    subscription: Subscription
  ): number {

    return subscription.id;

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  statusClass(
    status: SubscriptionStatus
  ): string {

    return String(status)
      .toLowerCase()
      .replace(/_/g, '-');

  }


  // =====================================================
  // FORMAT STATUS
  // =====================================================

  formatStatus(
    status: SubscriptionStatus
  ): string {

    return String(status)
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string | null
  ): string {

    if (!date) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'en-UG',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      new Date(date)
    );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount: number,
    currency = 'UGX'
  ): string {

    return new Intl.NumberFormat(
      'en-UG',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      }
    ).format(amount);

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: any
  ): string {

    if (error?.status === 401) {

      return 'Your session has expired. Please log in again.';

    }

    if (error?.status === 403) {

      return 'You do not have permission to manage subscriptions.';

    }

    if (error?.status === 404) {

      return 'The subscription service could not be found.';

    }

    if (error?.status >= 500) {

      return 'The server encountered an error. Please try again.';

    }

    return 'Unable to load subscriptions. Please try again.';

  }

}