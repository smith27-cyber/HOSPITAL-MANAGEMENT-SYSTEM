/**
 * =====================================================
 * HMS THEME SERVICE
 * File:
 * src/app/core/services/theme.service.ts
 * =====================================================
 *
 * Responsibilities:
 *
 * 1. Apply tenant-selected theme.
 * 2. Support Light / Dark / System.
 * 3. Resolve System using OS/browser preference.
 * 4. React to OS theme changes.
 * 5. Keep the selected theme available locally.
 *
 * Theme attributes:
 *
 * data-theme-mode
 *   = light | dark | system
 *
 * data-theme
 *   = light | dark
 *
 * The global HMS stylesheet uses:
 *
 * html[data-theme="light"]
 * html[data-theme="dark"]
 *
 * =====================================================
 */

import {
  Injectable
} from '@angular/core';

import {
  SystemSettings
} from '../../shared/models/settings.model';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {


  // =====================================================
  // LOCAL STORAGE KEY
  // =====================================================

  private readonly THEME_STORAGE_KEY =
    'hms-theme-mode';


  // =====================================================
  // SYSTEM MEDIA QUERY
  // =====================================================

  private readonly systemMediaQuery =
    '(prefers-color-scheme: dark)';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.listenForSystemThemeChanges();

    this.initializeStoredTheme();

  }


  // =====================================================
  // APPLY SYSTEM SETTINGS
  // =====================================================

  applySystemSettings(
    settings: SystemSettings
  ): void {

    this.applyTheme(
      settings?.theme || 'System'
    );

  }


  // =====================================================
  // APPLY THEME
  // =====================================================

  applyTheme(
    theme:
      SystemSettings['theme']
  ): void {

    const selectedTheme =
      this.normalizeTheme(
        theme
      );


    /*
     * Store the user's selected mode.
     *
     * This is only a fast local cache.
     *
     * The backend remains the source of truth
     * for tenant system preferences.
     */

    this.storeTheme(
      selectedTheme
    );


    /*
     * Store the selected mode separately from
     * the resolved visual theme.
     */

    document.documentElement
      .setAttribute(
        'data-theme-mode',
        selectedTheme.toLowerCase()
      );


    // =================================================
    // LIGHT
    // =================================================

    if (
      selectedTheme === 'Light'
    ) {

      this.setResolvedTheme(
        'light'
      );

      return;

    }


    // =================================================
    // DARK
    // =================================================

    if (
      selectedTheme === 'Dark'
    ) {

      this.setResolvedTheme(
        'dark'
      );

      return;

    }


    // =================================================
    // SYSTEM
    // =================================================

    this.applySystemTheme();

  }


  // =====================================================
  // GET CURRENT SELECTED MODE
  // =====================================================

  getSelectedTheme():
    SystemSettings['theme'] {

    const selectedMode =
      document.documentElement
        .getAttribute(
          'data-theme-mode'
        );


    return this.normalizeTheme(
      selectedMode
    );

  }


  // =====================================================
  // GET CURRENT RESOLVED THEME
  // =====================================================

  getResolvedTheme():
    'light' |
    'dark' {

    const resolvedTheme =
      document.documentElement
        .getAttribute(
          'data-theme'
        );


    return resolvedTheme === 'dark'
      ? 'dark'
      : 'light';

  }


  // =====================================================
  // APPLY RESOLVED THEME
  // =====================================================

  private setResolvedTheme(
    theme:
      'light' |
      'dark'
  ): void {

    document.documentElement
      .setAttribute(
        'data-theme',
        theme
      );

  }


  // =====================================================
  // APPLY SYSTEM THEME
  // =====================================================

  private applySystemTheme(): void {

    /*
     * Browser / operating system preference.
     */

    const prefersDark =
      window.matchMedia(
        this.systemMediaQuery
      ).matches;


    this.setResolvedTheme(
      prefersDark
        ? 'dark'
        : 'light'
    );

  }


  // =====================================================
  // INITIALIZE STORED THEME
  // =====================================================

  private initializeStoredTheme(): void {

    const storedTheme =
      localStorage.getItem(
        this.THEME_STORAGE_KEY
      );


    if (!storedTheme) {

      /*
       * Do not permanently force Light.
       *
       * Until the backend loads the tenant's
       * preferences, use System as the fallback.
       */

      this.applyTheme(
        'System'
      );

      return;

    }


    this.applyTheme(
      this.normalizeTheme(
        storedTheme
      )
    );

  }


  // =====================================================
  // STORE THEME
  // =====================================================

  private storeTheme(
    theme:
      SystemSettings['theme']
  ): void {

    localStorage.setItem(
      this.THEME_STORAGE_KEY,
      theme
    );

  }


  // =====================================================
  // SYSTEM THEME CHANGES
  // =====================================================

  private listenForSystemThemeChanges(): void {

    const mediaQuery =
      window.matchMedia(
        this.systemMediaQuery
      );


    mediaQuery.addEventListener(
      'change',
      event => {

        const selectedMode =
          document.documentElement
            .getAttribute(
              'data-theme-mode'
            );


        /*
         * Only change the resolved theme when
         * the tenant selected System.
         */

        if (
          selectedMode !== 'system'
        ) {

          return;

        }


        this.setResolvedTheme(
          event.matches
            ? 'dark'
            : 'light'
        );

      }
    );

  }


  // =====================================================
  // NORMALIZE THEME
  // =====================================================

  private normalizeTheme(
    theme:
      string |
      null |
      undefined
  ):
    SystemSettings['theme'] {

    switch (
      theme?.trim().toLowerCase()
    ) {

      case 'dark':

        return 'Dark';


      case 'light':

        return 'Light';


      case 'system':

        return 'System';


      default:

        return 'System';

    }

  }

}