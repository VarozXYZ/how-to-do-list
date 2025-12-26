# [How] ToDoList - Project Status Report

## 📋 Project Overview

**Project Name:** [How] ToDoList - AI Enhanced Task Manager  
**Repository:** https://github.com/VarozXYZ/how-to-do-list  
**Tech Stack:** React + Vite (Frontend), Node.js + Express + JSON DB (Backend)  
**Last Updated:** December 23, 2025

---

## 🎯 Project Vision

A modern ToDo list application with AI integration (using DeepSeek via OpenAI SDK) that allows users to:
- Create, edit, and manage tasks with custom tags/colors
- Get AI-powered suggestions and task improvements
- Have a beautiful, responsive UI with Spanish language support
- Dark mode support with persistent theme preference

---

## 🏗️ Original Project Roadmap

### Phase 1: Project Setup & Frontend Foundation

#### 1.1 Initialize Project ✅
- React + Vite setup
- Dependencies: react-bootstrap, react-router-dom, axios

#### 1.2 Frontend Structure ✅
```
src/
├── components/
│   ├── auth/ (Login, Register)
│   ├── cards/ (CardItem, CardDetail, CardList)
│   └── layout/ (Sidebar, Layout, Navbar)
├── context/ (AuthContext, CardsContext, ThemeContext)
├── pages/ (Dashboard, Completed, Settings)
├── services/ (api.js, auth.js)
└── main.jsx, App.jsx, index.css
```

#### 1.3 Backend Structure ✅
```
server/
├── config/
│   └── db.js              # JSON file database (read/write data.json)
├── controllers/
│   ├── authController.js  # Register, login, profile
│   ├── cardsController.js # CRUD for cards
│   └── tagsController.js  # CRUD for tags
├── middleware/
│   └── auth.js            # JWT verification middleware
├── routes/
│   ├── auth.js
│   ├── cards.js
│   └── tags.js
├── data.json              # Database file (users, cards, tags)
├── .env                   # JWT_SECRET, PORT
├── index.js               # Express server entry point
└── package.json
```

### Phase 2: Authentication UI ✅
- Login page with gradient design
- Register page
- Social login placeholders (disabled, with "Próximamente" tooltip)

### Phase 3: Dashboard & Cards ✅
- Sidebar navigation
- Card grid with filtering and sorting
- Card creation modal
- Card editing functionality
- Tag-based color system

### Phase 4: Backend Implementation ✅
- Express server setup with CORS
- JSON file database (simpler than SQLite for this project)
- JWT authentication with bcryptjs
- RESTful API endpoints for auth, cards, and tags
- Frontend fully connected to backend API

### Phase 5: AI Integration (IN PROGRESS)
- DeepSeek API integration via OpenAI SDK
- Task improvement suggestions
- Auto-generate descriptions
- Content moderation filter
- AI usage tracking per user
- AI logs stored in database

---

## ✅ Completed Work (Session 1)

### Layout & Styling Fixes
1. **Full-width layout** - Removed centering constraints, fixed horizontal scroll
2. **Settings page centering** - Content now centered with max-width for readability
3. **FAB button** - Improved centering of the + icon, subtle hover animation

### Logo & Branding
4. **Custom logo** - Replaced emoji logo with Cloudinary-hosted image
5. **Navigation icons** - Changed "Mis Tareas" icon to clipboard emoji (📋)

### Card System Overhaul
6. **Tag-based color system** - Complete refactor:
   - Tags now determine card colors (gradient background + border)
   - Default tags: Marketing, Personal, Diseño, Trabajo, Investigación
   - Custom tag creation with 8 color presets
   - Removed separate color picker

7. **Card colors** - Subtle gradients from tag color to white, matching borders

### UX Improvements
8. **Click-outside behavior** - All dropdown menus close when clicking outside
9. **Edit functionality** - Clicking a card opens edit modal
10. **Spanish capitalization** - Fixed throughout the app

---

## ✅ Completed Work (Session 2 - December 23, 2025)

### Backend Implementation
1. **Server Setup** - Node.js + Express server on port 3001
   - CORS enabled for frontend communication
   - JSON file database (`data.json`) for simplicity
   - Environment variables via dotenv (`.env` in server folder)

2. **Authentication System**
   - User registration with bcryptjs password hashing
   - JWT token generation (stored in localStorage)
   - Login/logout functionality
   - Protected routes middleware

3. **API Endpoints**
   - `POST /api/auth/register` - Create new user
   - `POST /api/auth/login` - Authenticate user
   - `GET /api/auth/me` - Get current user
   - `PUT /api/auth/profile` - Update profile
   - `GET/POST /api/cards` - List/create cards (user-specific)
   - `PUT/DELETE /api/cards/:id` - Update/delete cards
   - `POST /api/cards/:id/toggle` - Toggle completion
   - `GET/POST /api/tags` - List/create tags
   - `DELETE /api/tags/:id` - Delete custom tags

### Frontend-Backend Integration
4. **API Service Layer**
   - `src/services/api.js` - Axios instance with JWT interceptor
   - `src/services/auth.js` - Auth API functions
   - `src/services/cards.js` - Cards CRUD functions
   - `src/services/tags.js` - Tags CRUD functions

5. **Context Updates**
   - `AuthContext.jsx` - Global auth state, login/register/logout
   - `CardsContext.jsx` - Async API calls, loading states

6. **Additional Fixes**
   - Date/time pickers using react-datepicker with custom styling
   - Tag deletion functionality
   - Default dates (current date + 2 hours for new cards)
   - Sticky sidebar on all pages

---

## ✅ Completed Work (Session 3 - December 23, 2025)

### Card Controls Redesign
1. **Removed three-dots menu** - Replaced with direct delete button
2. **Delete button styling** - Uses tag's color scheme with opacity for visibility
3. **AI button unified** - Changed to consistent blue (#3D97EF) with "IA" text
4. **AI button tooltip** - Shows "Mejorar con IA" on hover

### User Interface Improvements
5. **Logout button** - Added accessible logout button in sidebar with SVG icon
6. **Settings connected to backend** - Username and bio now persist to database

### Dark Mode Implementation ✅
7. **ThemeContext** - New context for global theme management
   - `darkMode` state with `toggleDarkMode` function
   - Persistence in localStorage
   - Applies `dark-mode` class to document.body

8. **CSS Variables** - Light/dark theme support in `index.css`:
   ```css
   :root {
     --bg-primary, --bg-secondary, --bg-card, --bg-input
     --text-primary, --text-secondary, --text-muted
     --border-color, --border-light
     --shadow-sm
   }
   ```

9. **Component Updates for Dark Mode**:
   - `Sidebar.css` - Dark background, borders, hover states
   - `Dashboard.css` - Main background, filter buttons
   - `CardItem.css` - Card gradients that adapt to theme
   - `CardItem.jsx` - Dynamic gradient calculation for dark mode
   - `CardDetail.css` - Modal styling, inputs, datepicker
   - `Settings.css` - All sections, inputs, toggles, buttons

10. **Dynamic Logos** - Theme-aware logo switching:
    - Light theme: `logo-white_p2msnm.png`
    - Dark theme: `logo-dark_hlp0ri.png`
    - Applied in Sidebar, Login, and Register pages

---

## 📁 Current File Structure

```
how-to-do-list/
├── public/
├── references/              # UI design references
│   ├── dashboard.html/png
│   ├── crear-card.html/png
│   ├── login.html/png
│   ├── profile.html/png
│   └── logo.png
├── server/                  # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js            # JSON database helpers
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cardsController.js
│   │   └── tagsController.js
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cards.js
│   │   └── tags.js
│   ├── data.json            # Database file
│   ├── .env                 # JWT_SECRET, PORT
│   ├── index.js
│   └── package.json
├── src/                     # Frontend (React + Vite)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx + Login.css
│   │   │   └── Register.jsx
│   │   ├── cards/
│   │   │   ├── CardItem.jsx + CardItem.css
│   │   │   ├── CardDetail.jsx + CardDetail.css
│   │   │   └── CardList.jsx
│   │   └── layout/
│   │       ├── Sidebar.jsx + Sidebar.css
│   │       ├── Layout.jsx
│   │       └── Navbar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx   # Auth state + API calls
│   │   ├── CardsContext.jsx  # Cards/tags state + API calls
│   │   └── ThemeContext.jsx  # Dark mode state + toggle
│   ├── pages/
│   │   ├── Dashboard.jsx + Dashboard.css
│   │   ├── Completed.jsx
│   │   ├── Settings.jsx + Settings.css
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── services/
│   │   ├── api.js           # Axios instance + interceptors
│   │   ├── auth.js          # Auth API functions
│   │   ├── cards.js         # Cards CRUD API
│   │   └── tags.js          # Tags CRUD API
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

---

## 🔧 Key Technical Details

### ThemeContext (src/context/ThemeContext.jsx)
```javascript
// Provides
{ darkMode: boolean, toggleDarkMode: function }

// Persists to localStorage key: 'darkMode'
// Applies/removes class 'dark-mode' on document.body
```

### CardsContext (src/context/CardsContext.jsx)
```javascript
// Default tags structure
{ id: 'marketing', name: 'Marketing', color: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1d4ed8' }

// Card structure
{ id, title, description, tagId, completed, aiPrompt, dueDate, dueTime }

// Available functions
addCard, updateCard, deleteCard, toggleComplete, addTag, deleteTag, getTagById
```

### Color Presets for Custom Tags
```javascript
[
  { color: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1d4ed8' }, // Blue
  { color: '#faf5ff', borderColor: '#e9d5ff', textColor: '#7c3aed' }, // Purple
  { color: '#fff7ed', borderColor: '#fed7aa', textColor: '#c2410c' }, // Orange
  { color: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#15803d' }, // Green
  { color: '#fdf2f8', borderColor: '#fbcfe8', textColor: '#be185d' }, // Pink
  { color: '#fef2f2', borderColor: '#fecaca', textColor: '#dc2626' }, // Red
  { color: '#fffbeb', borderColor: '#fde68a', textColor: '#d97706' }, // Amber
  { color: '#f0fdfa', borderColor: '#99f6e4', textColor: '#0d9488' }, // Teal
]
```

### Routes (src/App.jsx)
```javascript
/login → Login
/register → Register
/dashboard → Dashboard (main tasks view)
/completed → Completed tasks
/settings → User settings/profile
/ → Redirects to /dashboard (if authenticated) or /login
```

---

## 🚧 Pending Work

### 🔴 Alta prioridad

1. **Mejoras de IA**
   - [ ] Mostrar descripción con formato Markdown en el textarea/preview
   - [ ] Dar funcionalidad al botón "IA" en las tarjetas (CardItem)
   - [ ] Conectar configuración del usuario (creatividad/formalidad) a las generaciones
   - [ ] Limitar cantidad de generaciones por usuario
   - [ ] (OPCIONAL) Crear cuestionario con IA para mejorar prompts

2. **Sistema de borradores**
   - [ ] Guardar borradores para evitar perder contenido generado no guardado
   - [ ] Pedir confirmación si se cierra una tarjeta sin guardar

3. **Pantalla de preview de tarjetas**
   - [ ] Crear vista de preview donde el texto sea más fácil de leer
   - [ ] Botones de eliminar/editar aparecen en hover y dentro del preview

4. **Arreglar errores**
   - [ ] Fix nodemon port conflict error (desarrollo)
   - [ ] Arreglar modo oscuro (consistencia de colores)

### 🟡 Media prioridad

5. **Mejoras de UX**
   - [ ] Cambiar prioridad por defecto a "Baja"
   - [ ] Fecha por defecto en blanco, seleccionar actual al hacer clic
   - [ ] Rediseño del FAB (Floating Action Button)

6. **Sistema de notificaciones**
   - [ ] El botón de notificaciones (🔔) no funciona
   - [ ] Implementar sistema completo de notificaciones

7. **Internacionalización**
   - [ ] Traducir la aplicación
   - [ ] Opción para cambiar idioma (ES/EN)

### 🟢 Baja prioridad

8. **Sistema de sonidos**
   - [ ] Añadir sonidos para acciones (crear, completar, eliminar)
   - [ ] Opción para activar/desactivar en Settings

9. **Otras mejoras**
   - [ ] Profile photo upload functionality
   - [ ] Search improvements

### ✅ Completado

- ~~Sistema de prioridad~~ → Campo, filtro y ordenación implementados
- ~~AI Integration básica~~ → Backend DeepSeek, generación, moderación, tracking
- ~~Blur-out animation~~ → Animación al eliminar/completar tarjetas

---

## ✅ Recently Completed (Session 4 - December 26, 2025)

- ~~AI Integration~~ → DeepSeek backend, moderation, generation, usage tracking
- ~~Sistema de prioridad~~ → Alta/Media/Baja con filtros y ordenación
- ~~Blur-out animation~~ → Animación al eliminar/completar tarjetas
- ~~AI usage count~~ → Visible en Settings page

### Previously Completed
- ~~Rediseño de controles de tarjeta~~ → Delete button added, three-dots removed
- ~~Mejora visual de etiquetas~~ → Tags now have distinct styling
- ~~Logout accesible~~ → Added in sidebar with icon
- ~~Conectar configuración al backend~~ → Username/bio connected
- ~~Modo oscuro~~ → Fully implemented with CSS variables and persistence

---

## 📝 Important User Preferences

1. **No documentation/tests unless explicitly requested**
2. **Commit and push after each significant change**
3. **Spanish language for UI (proper capitalization rules)**
4. **"IA Sugerencias" page was removed from the project scope**
5. **Social login buttons kept as disabled placeholders**

---

## 🔗 External Resources

- **Logo (Light theme):** `https://res.cloudinary.com/diycpogap/image/upload/v1766521088/logo-white_p2msnm.png`
- **Logo (Dark theme):** `https://res.cloudinary.com/diycpogap/image/upload/v1766521136/logo-dark_hlp0ri.png`
- **Design References:** Located in `/references/` folder (HTML + PNG mockups)
- **Font:** Plus Jakarta Sans (imported via Google Fonts in CSS)

---

## 🚀 How to Run

```bash
# Frontend (runs on http://localhost:5173)
npm install
npm run dev

# Backend (runs on http://localhost:3001)
cd server
npm install
npm run dev

# Note: Both servers must be running for the app to work
```

---

## 📌 Notes for Future Sessions

1. ✅ Frontend and backend are fully connected and functional
2. ✅ Authentication works (register, login, logout, protected routes)
3. ✅ Cards and tags are persisted to `server/data.json`
4. ✅ Dark mode fully functional with CSS variables and localStorage
5. ✅ Settings page connected (username, bio persist)
6. ✅ AI "Generar" button works - generates descriptions via DeepSeek
7. ✅ AI usage tracking - count visible in Settings
8. The `.env` file must be in the `server/` folder with `JWT_SECRET` and `DEEPSEEK_API_KEY`
9. User data is isolated - each user only sees their own cards and custom tags
10. Default tags are shared across all users (defined in `server/config/db.js`)
11. AI logs stored in `data.json` under `aiLogs` array
12. Nodemon may show port conflict errors - this is normal, the original server keeps running
