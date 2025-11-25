# 🎬 Videoflix Frontend

Angular-basiertes Frontend für die Videoflix Video-Streaming-Plattform mit responsivem Design, Video.js Player und adaptivem HLS-Streaming.

![Angular](https://img.shields.io/badge/angular-19.2-red.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)
![Video.js](https://img.shields.io/badge/video.js-8.x-green.svg)

## 📋 Inhaltsverzeichnis

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Projekt-Struktur](#projekt-struktur)

## ✨ Features

### Benutzer-Features
- ✅ Benutzerregistrierung mit E-Mail-Verifikation
- ✅ Login/Logout mit JWT-Authentication
- ✅ Passwort vergessen & zurücksetzen
- ✅ Account-Aktivierung via E-Mail-Link
- ✅ Persistente Session mit HTTP-only Cookies

### Video-Features
- ✅ Video.js Player mit HLS-Unterstützung
- ✅ Automatische Qualitätsauswahl basierend auf Bildschirmauflösung
- ✅ Manuelle Qualitätsumschaltung (120p, 360p, 720p, 1080p)
- ✅ Toast-Benachrichtigungen bei Qualitätswechsel
- ✅ Vollbild-Modus
- ✅ Responsive Player-Controls

### UI/UX
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Video-Dashboard mit Genre-Kategorien
- ✅ Featured Video im Hero-Bereich
- ✅ Thumbnail-Previews
- ✅ Gradient-Overlays und Backdrop-Blur
- ✅ Smooth Scrolling und Animations
- ✅ Dark Theme mit lila/blauen Akzenten

### Rechtliches
- ✅ Impressum (§5 TMG konform)
- ✅ Datenschutzerklärung (DSGVO)
- ✅ Footer mit Links (immer erreichbar)

## 🛠️ Tech Stack

- **Framework:** Angular 19.2
- **Language:** TypeScript 5.x
- **Styling:** SCSS mit responsiven Breakpoints
- **Video Player:** Video.js 8.x mit HLS-Plugin
- **State Management:** Angular Signals
- **HTTP Client:** Angular HttpClient mit Interceptors
- **Routing:** Angular Router mit Guards
- **Forms:** Reactive Forms
- **Build Tool:** Angular CLI mit esbuild

## 📦 Voraussetzungen

- **Node.js:** >= 18.x
- **npm:** >= 9.x
- **Angular CLI:** 19.x

Installation der Angular CLI:
```bash
npm install -g @angular/cli@19
```

## 🚀 Installation

1. **Repository klonen:**
```bash
git clone https://github.com/yourusername/videoflix-frontend.git
cd videoflix-frontend
```

2. **Dependencies installieren:**
```bash
npm install
```

3. **Environment-Konfiguration:**

Erstelle/bearbeite `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

Für Production (`src/environments/environment.production.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

4. **Development Server starten:**
```bash
ng serve
```

Öffne Browser: http://localhost:4200

## ⚙️ Konfiguration

### API-Endpunkt anpassen

In `src/app/core/config/api.config.ts`:
```typescript
export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    register: '/register/',
    login: '/login/',
    logout: '/logout/',
    videos: '/videos/',
    // ...
  }
};
```

### Video.js Konfiguration

In `src/app/video-player/video-player.component.ts`:
```typescript
private videoJsOptions = {
  autoplay: false,
  controls: true,
  fluid: true,
  aspectRatio: '16:9',
  html5: {
    hls: {
      overrideNative: true,
      enableLowInitialPlaylist: true
    }
  }
};
```

### Responsive Breakpoints

In `src/styles.scss`:
```scss
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;
$breakpoint-desktop: 1440px;
```

## 💻 Development

### Development Server

```bash
ng serve
```

Öffne http://localhost:4200. Die App lädt automatisch bei Dateiänderungen neu.

### Neue Komponente erstellen

```bash
ng generate component feature/component-name
```

### Neue Service erstellen

```bash
ng generate service core/services/service-name
```

### Code-Scaffolding

```bash
# Komponente
ng generate component my-component

# Service
ng generate service my-service

# Guard
ng generate guard core/guards/my-guard

# Interceptor
ng generate interceptor core/interceptors/my-interceptor

# Pipe
ng generate pipe shared/pipes/my-pipe
```

## 🏗️ Build & Deployment

### Production Build

```bash
ng build --configuration production
```

Build-Artefakte werden in `dist/browser/` gespeichert.

### Build-Optimierungen

Die Production-Build enthält:
- ✅ Ahead-of-Time (AOT) Compilation
- ✅ Tree Shaking
- ✅ Minification
- ✅ Lazy Loading
- ✅ Service Worker (optional)

### Deployment auf Server

1. **Build erstellen:**
```bash
ng build --configuration production
```

2. **Dateien auf Server kopieren:**
```bash
scp -r dist/browser/* user@server:/var/www/videoflix/frontend/
```

3. **Nginx-Konfiguration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/videoflix/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Media Files
    location /media/ {
        proxy_pass http://localhost:8000/media/;
    }
}
```

### Automatisches Deployment

**Mit Git Hooks:**
```bash
#!/bin/bash
# deploy.sh

cd /var/www/videoflix/frontend
git pull origin main
npm install
ng build --configuration production
sudo systemctl reload nginx
```

## 📂 Projekt-Struktur

```
frontend/
├── public/
│   ├── fonts/                # Custom Fonts
│   ├── images/              # Statische Bilder (Logos, etc.)
│   └── videos/              # Demo-Videos
│
├── src/
│   ├── app/
│   │   ├── core/            # Core-Module (Singleton Services)
│   │   │   ├── config/      # Konfigurationsdateien
│   │   │   ├── guards/      # Route Guards (auth.guard.ts)
│   │   │   ├── interceptors/ # HTTP Interceptors
│   │   │   ├── models/      # TypeScript Interfaces
│   │   │   └── services/    # Singleton Services (auth, video)
│   │   │
│   │   ├── shared/          # Geteilte Module/Komponenten
│   │   │   ├── components/  # Wiederverwendbare Komponenten
│   │   │   ├── pipes/       # Custom Pipes
│   │   │   └── directives/  # Custom Directives
│   │   │
│   │   ├── startpage/       # Landing Page
│   │   ├── sign-up/         # Registrierung
│   │   ├── log-in/          # Login
│   │   ├── forgot-password/ # Passwort vergessen
│   │   ├── reset-password/  # Passwort zurücksetzen
│   │   ├── activate-account/ # Account-Aktivierung
│   │   ├── video-offer/     # Video-Dashboard
│   │   ├── video-player/    # Video-Player
│   │   ├── imprint/         # Impressum
│   │   ├── privacy-policy/  # Datenschutz
│   │   │
│   │   ├── app.component.ts # Root Component
│   │   ├── app.config.ts    # App Configuration
│   │   └── app.routes.ts    # Routing Configuration
│   │
│   ├── environments/        # Environment-Konfiguration
│   │   ├── environment.ts
│   │   └── environment.production.ts
│   │
│   ├── styles.scss          # Globale Styles
│   ├── index.html           # HTML Entry Point
│   └── main.ts              # TypeScript Entry Point
│
├── angular.json             # Angular Workspace Config
├── tsconfig.json            # TypeScript Config
├── package.json             # Dependencies
├── .gitignore
└── README.md
```

## 🧪 Testing

### Unit Tests

```bash
ng test
```

Führt Tests mit Karma aus.

### End-to-End Tests

```bash
ng e2e
```

### Test Coverage

```bash
ng test --code-coverage
```

Coverage-Report: `coverage/index.html`

## 🎨 Styling-Guide

### SCSS-Variablen

```scss
// Colors
$primary-color: #6b46c1;
$secondary-color: #3b82f6;
$background-dark: #0f172a;
$text-color: #f8fafc;

// Gradients
$gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gradient-secondary: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);

// Spacing
$spacing-xs: 0.5rem;
$spacing-sm: 1rem;
$spacing-md: 1.5rem;
$spacing-lg: 2rem;
$spacing-xl: 3rem;
```

### Responsive Mixins

```scss
@mixin mobile {
  @media (max-width: 768px) { @content; }
}

@mixin tablet {
  @media (min-width: 769px) and (max-width: 1024px) { @content; }
}

@mixin desktop {
  @media (min-width: 1025px) { @content; }
}
```

## 🔐 Sicherheit

### Auth Guard

Routes sind mit `authGuard` geschützt:
```typescript
{
  path: 'videoflix',
  component: VideoOfferComponent,
  canActivate: [authGuard]
}
```

### HTTP Interceptor

Automatisches Token-Handling:
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Token wird automatisch aus Cookie gelesen
  // Refresh bei 401 Errors
};
```

### CSRF-Schutz

Cookies mit `SameSite=Strict` und `Secure` Flag (Production).

## 🛠️ Nützliche Commands

```bash
# Development Server
ng serve

# Build (Development)
ng build

# Build (Production)
ng build --configuration production

# Tests
ng test

# Linting
ng lint

# Format Code
npx prettier --write "src/**/*.{ts,html,scss}"

# Analyze Bundle Size
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## 🔧 Troubleshooting

### Port bereits belegt
```bash
ng serve --port 4300
```

### Node Module Probleme
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build-Fehler
```bash
# Cache löschen
rm -rf .angular/cache
ng build --configuration production
```

### CORS-Probleme (Development)
Proxy-Konfiguration in `angular.json`:
```json
{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

`proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 👤 Autor

**Dein Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Credits

- Angular Team
- Video.js Community
- Icons: Font Awesome / Material Icons

## 📞 Support

Bei Fragen oder Problemen:
- Erstelle ein [Issue](https://github.com/yourusername/videoflix-frontend/issues)
- Email: support@yourdomain.com

---

**Entwickelt mit ❤️ für Videoflix**
