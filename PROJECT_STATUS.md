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
├── context/ (AuthContext, CardsContext)
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

### Phase 5: AI Integration (PENDING)
- DeepSeek API integration via OpenAI SDK
- Task improvement suggestions
- Auto-generate descriptions

---

## ✅ Completed Work (This Session)

### Layout & Styling Fixes
1. **Full-width layout** - Removed centering constraints, fixed horizontal scroll
2. **Settings page centering** - Content now centered with max-width for readability
3. **FAB button** - Improved centering of the + icon, subtle hover animation

### Logo & Branding
4. **Custom logo** - Replaced emoji logo with Cloudinary-hosted image:
   `https://res.cloudinary.com/diycpogap/image/upload/v1766428693/logo_e2ytv1.png`
5. **Navigation icons** - Changed "Mis Tareas" icon to clipboard emoji (📋)

### Card System Overhaul
6. **Tag-based color system** - Complete refactor:
   - Tags now determine card colors (gradient background + border)
   - Tags also determine "Mejorar con IA" button color
   - Default tags: Marketing, Personal, Diseño, Trabajo, Investigación
   - Custom tag creation with 8 color presets
   - Removed separate color picker

7. **Card colors** - Subtle gradients from tag color to white, matching borders

8. **AI Button styling** - Solid color with subtle gradient, Spanish text "Mejorar con IA"

### UX Improvements
9. **Click-outside behavior** - All dropdown menus close when clicking outside:
   - Card three-dots menu
   - Filter dropdown
   - Sort dropdown
   - Tag picker in modal

10. **Edit functionality** - Added ability to edit existing cards:
    - Edit option in card dropdown menu
    - Modal adapts title/button text for edit mode
    - Pre-fills form with existing data

### Translations
11. **Spanish UI** - Dashboard header, buttons, and labels translated

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

6. **Component Updates**
   - `Login.jsx` / `Register.jsx` - Connected to auth API with error handling
   - `App.jsx` - Protected routes (redirect to /login if not authenticated)
   - `Dashboard.jsx` / `Completed.jsx` - Loading states while fetching
   - `CardDetail.jsx` - Async save/update with loading indicator

### Additional Fixes
7. **Spanish capitalization** - Fixed throughout the app (only first letter capitalized)
8. **Date/time pickers** - Using react-datepicker with custom styling
9. **Tag deletion** - Added ability to delete custom tags
10. **Default dates** - New cards default to current date + 2 hours
11. **Sticky sidebar** - Fixed position sidebar on all pages
12. **Click-to-edit cards** - Clicking a card opens edit modal

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
│   │   ├── AuthContext.jsx  # Auth state + API calls
│   │   └── CardsContext.jsx # Cards/tags state + API calls
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

### CardsContext (src/context/CardsContext.jsx)
Main state management for cards and tags:

```javascript
// Default tags structure
{ id: 'marketing', name: 'Marketing', color: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1d4ed8' }

// Card structure
{ id, title, description, tagId, completed, aiPrompt }

// Available functions
addCard, updateCard, deleteCard, toggleComplete, addTag, getTagById
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
/ → Redirects to /login
```

---

## 🚧 Pending Work

### 🔴 Alta prioridad
1. **AI Integration**
   - Setup DeepSeek API connection via OpenAI SDK
   - Implement "Mejorar con IA" functionality
   - Auto-generate/improve task descriptions

2. **Sistema de prioridad**
   - Añadir campo de prioridad a las tarjetas (Alta, Media, Baja)
   - Añadir filtro por prioridad en el Dashboard
   - Añadir opción de ordenar por prioridad

### 🟡 Media prioridad
3. **Rediseño de controles de tarjeta**
   - Eliminar el menú de tres puntos (⋯)
   - Reemplazar con botón de papelera (🗑️) para eliminar
   - La edición ya funciona al hacer clic en la tarjeta

4. **Rediseño del FAB (Floating Action Button)**
   - El botón actual de "Nueva tarea" es feo y sticky
   - Mejorar diseño y comportamiento

5. **Mejora visual de etiquetas**
   - La etiqueta en la tarjeta se ve mal con el mismo color de fondo
   - Necesita mejor contraste/diferenciación visual

6. **Sistema de notificaciones**
   - El botón de notificaciones no funciona
   - Implementar sistema completo de notificaciones

7. **Logout accesible**
   - Añadir botón de logout en la zona de Usuario del Sidebar
   - Actualmente no hay forma visible de cerrar sesión

8. **Conectar configuración al backend**
   - La página de Settings está totalmente desconectada
   - Persistir cambios de perfil en la base de datos
   - Guardar preferencias del usuario

### 🟢 Baja prioridad
9. **Modo oscuro**
   - UI existe en Settings pero no funciona
   - Implementar toggle funcional con persistencia

10. **Efectos de sonido**
    - Añadir sonidos para acciones (crear, completar, eliminar)
    - Opción para activar/desactivar en Settings

11. **Otras mejoras**
    - Profile photo upload functionality
    - Search improvements

---

## 📝 Important User Preferences

1. **No documentation/tests unless explicitly requested**
2. **Commit and push after each significant change**
3. **Spanish language for UI**
4. **"IA Sugerencias" page was removed from the project scope**
5. **Social login buttons kept as disabled placeholders**

---

## 🔗 External Resources

- **Logo URL:** `https://res.cloudinary.com/diycpogap/image/upload/v1766428693/logo_e2ytv1.png`
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
4. The AI "Mejorar con IA" button currently only logs to console - needs DeepSeek integration
5. The Settings page has toggles that don't persist - need backend/localStorage implementation
6. The `.env` file must be in the `server/` folder (not project root) for JWT to work
7. User data is isolated - each user only sees their own cards and custom tags
8. Default tags are shared across all users (defined in `server/config/db.js`)

