# AI Shopping Agent - Frontend

Complete Next.js 16 frontend for a multi-role AI shopping assistant platform with buyer and seller dashboards, real-time chat, checkout, and order management.

## 🏗 Architecture

### Route Structure
```
/                           → Redirect (authenticated users) → /buyer/chat or /seller
/auth/login                 → Email + Password + Google OAuth
/auth/signup                → Email + Password registration
/auth/create-password       → First-time Google login password setup

/buyer/chat                 → AI shopping chat shell with sidebar + threads
/buyer/chat/[threadId]      → Active conversation with agent, products, external items
/buyer/orders               → Order history with status badges
/buyer/orders/[orderId]     → Order detail with items, address, timeline
/buyer/profile              → Account info + saved addresses management

/seller                     → Dashboard with stats, recent orders, product overview
/seller/products            → Product catalog CRUD
/seller/orders              → Order management and fulfillment
/seller/orders/[orderId]    → Order detail with buyer info and items
/seller/account             → Shop profile and settings
```

### Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4 with design tokens
- **State**: Zustand (auth, checkout) + React Query (data fetching)
- **Forms**: react-hook-form + Zod validation
- **Auth**: Custom JWT + Google OAuth (via @react-oauth/google)
- **HTTP**: Axios with interceptors
- **Notifications**: sonner (toast)
- **Date/Time**: native Intl API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Backend API running (default: http://localhost:8000)
- Google OAuth Client ID (for Google sign-in)

### Installation

1. **Extract and install**:
```bash
tar -xzf AI_Shopping_Agent_Frontend_Complete.tar.gz
cd AI_Shopping_Agent_Frontend
pnpm install
```

2. **Configure environment**:
```bash
# .env.development.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

3. **Run dev server**:
```bash
pnpm dev
# Open http://localhost:3000
```

4. **Build for production**:
```bash
pnpm build
pnpm start
```

## 📁 Project Structure

### `/app` - Route Pages & Layouts
- **Auth routes** - Login, signup, password creation
- **Buyer routes** - Chat, orders, profile
- **Seller routes** - Dashboard, products, orders, account

### `/components`
- **`/address`** - Address form modal, picker modal
- **`/auth`** - Google button, seller upsell modal, route guard
- **`/chat`** - Message bubble, product card, message list, cart sheet, sidebar, buyer shell
- **`/checkout`** - Order confirmation modal, Razorpay payment integration
- **`/orders`** - Order status badge
- **`/providers`** - App providers (React Query, auth)
- **`/ui`** - shadcn components (button, card, dialog, input, tabs, etc.)

### `/hooks`
- **`useAuth`** - Auth state and methods (login, signup, logout, refresh)
- **`useOnboarding`** - Post-auth flow (upsell modal, routing)
- **`useThreads`** - Chat threads CRUD
- **`useSearch`** - Agent search API with cache management
- **`useCart`** - Cart operations
- **`useCheckout`** - Checkout state machine (address, payment)
- **`usePayment`** - Razorpay integration
- **`useAddresses`** - Address CRUD
- **`useOrders`** - Buyer orders
- **`useSellerProducts`** - Seller product management
- **`useSellerOrders`** - Seller order management
- **`useFeedback`** - Product feedback (like/dislike)

### `/stores`
- **`useAuthStore`** - User, token, role (Zustand)
- **`useCheckoutStore`** - Checkout state machine (address, payment, razorpay order)

### `/services`
- **`apiClient.ts`** - Axios instance with interceptors, token refresh
- **`authService.ts`** - Login, signup, Google auth, me
- **`threadService.ts`** - Thread CRUD
- **`searchService.ts`** - Agent search
- **`cartService.ts`** - Add/remove items
- **`checkoutService.ts`** - Cart → checkout conversion
- **`paymentService.ts`** - Razorpay integration
- **`orderService.ts`** - Buyer orders
- **`sellerService.ts`** - Seller orders, products, profile
- **`feedbackService.ts`** - Product feedback

### `/lib`
- **`queryClient.ts`** - React Query client config
- **`storage.ts`** - LocalStorage helpers (seller upsell flag)
- **`format.ts`** - Formatters (price, date, initials)
- **`schemas.ts`** - Zod schemas (login, signup, addresses, products)
- **`utils.ts`** - Tailwind `cn()` utility

### `/types`
- **`api.ts`** - TypeScript interfaces for all API responses and requests

## 🔐 Authentication Flow

1. **Email/Password Signup** → Token saved to localStorage → User redirected to buyer chat
2. **Email/Password Login** → Token saved → Redirected based on role (buyer/seller)
3. **Google OAuth (first-time)** → Token saved → Redirected to create-password → Then buyer chat
4. **Google OAuth (returning)** → Token saved → Seller upsell modal or direct to buyer chat
5. **Session Recovery** → On mount, check localStorage token → Fetch `/auth/me` to refresh user state

## 🛍 Buyer Experience

### Chat & Product Discovery
- New chat automatically creates a thread on the backend
- Message input sends query to AI agent (`/search`)
- Agent response includes product recommendations + external links
- Product cards show image, name, price, seller, buy button
- Add to cart → CartSheet shows cart state + checkout button

### Checkout (Razorpay)
1. Address selection/creation modal
2. Review order (items, subtotal, shipping, total)
3. Razorpay payment gateway (modal)
4. On success → Order confirmation modal + redirect to /buyer/orders
5. On failure → Error toast, stay on checkout

### Orders & Profile
- Orders page shows all orders with status, date, total
- Order detail page displays items, address, timeline, seller info
- Profile page shows account info + saved addresses CRUD
- Can add, edit, delete, set default address

### Seller Upsell
- After signup, shown modal: "Become a Seller?"
- If yes → Become seller flow → Redirect to /seller dashboard
- If no → Mark flag → Continue as buyer
- Flag prevents re-showing (stored in localStorage)

## 🏪 Seller Dashboard

### Dashboard
- Stats: total products, orders, pending orders, estimated revenue
- Recent orders table
- Product grid (4 most recent)

### Products
- Full CRUD: add, edit, delete products
- Search/filter by name or description
- Table view with name, description, price, stock, actions

### Orders
- List all orders for seller's products
- Filter by order ID or buyer email
- Order detail shows buyer info, items, timeline, shipping address

### Account
- Shop profile: name, description, phone, address
- Email cannot be changed
- Member since date
- Logout button

## 🎨 Design System

### Colors (OKLch)
- **Primary**: `oklch(0.56 0.13 162)` - Teal/cyan brand color
- **Background**: Off-white
- **Foreground**: Dark teal
- **Muted**: Light grays
- **Destructive**: Red

### Typography
- **Heading Font**: System font (from layout)
- **Body Font**: System font (from layout)
- Line-height: 1.5-1.6

### Components
- Buttons, cards, inputs from shadcn/ui
- Modal dialogs for forms
- Toast notifications for feedback
- Badges for status

## 🔄 State Management

### Global State (Zustand)
- **Auth**: user, role, token, isLoading → `useAuth()` hook
- **Checkout**: cart, address, payment status → `useCheckoutStore`

### Server State (React Query)
- Threads, messages, orders, addresses, products
- Auto-refresh on mutation
- Cache tags for invalidation

### Local State (useState)
- Form inputs, modals, UI toggles

## 🔌 API Integration

All requests go through `/services/apiClient.ts`:
- **Base URL**: `process.env.NEXT_PUBLIC_API_BASE_URL`
- **Auth header**: `Authorization: Bearer {token}`
- **Auto token refresh**: On 401, calls `/auth/refresh` → retries request
- **Error handling**: Extracts error message from API response

### Endpoints Used
```
POST   /auth/signup             → Create account
POST   /auth/login              → Get token
POST   /auth/google             → Google OAuth
GET    /auth/me                 → Get current user
GET    /threads                 → List threads
POST   /threads                 → Create thread
GET    /search                  → AI agent search
POST   /cart/items              → Add item
DELETE /cart/items/{id}         → Remove item
POST   /checkout                → Create checkout
POST   /payment/razorpay        → Create Razorpay order
GET    /orders                  → Buyer orders
GET    /addresses               → User addresses
POST   /addresses               → Create address
PUT    /addresses/{id}          → Update address
POST   /seller/products         → Create product
GET    /seller/orders           → Seller orders
GET    /feedback                → Submit product feedback
```

## 📦 Dependencies

### Core
- `next@16` - React framework
- `react@19` - UI library
- `typescript` - Type safety

### UI
- `@radix-ui/*` - Headless components
- `shadcn/ui` - Styled components
- `tailwindcss@4` - Styling
- `lucide-react` - Icons

### Data & State
- `zustand` - State management
- `@tanstack/react-query` - Server state
- `axios` - HTTP client
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@hookform/resolvers` - Form validation adapter

### Auth & OAuth
- `@react-oauth/google` - Google sign-in

### Payments
- `razorpay` - Payment gateway

### UX
- `sonner` - Toast notifications
- `date-fns` - Date utilities

## 🚨 Common Issues & Solutions

### 401 Unauthorized
- Token expired → Auto-refreshed via interceptor
- Check if `/auth/refresh` endpoint works
- Ensure token is saved in localStorage

### API not found
- Backend not running on `localhost:8000`
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.development.local`

### Cart not updating
- Check React Query dev tools (invalid cache key?)
- Verify `PATCH /cart/{id}` endpoint returns updated cart

### Google OAuth not working
- Wrong client ID in `.env.development.local`
- Ensure origin is whitelisted in Google Cloud console
- Check network tab for CORS errors

### Payment gateway errors
- Razorpay key missing in `.env`
- Check payment order creation endpoint
- Verify order amount matches expected total

## 🧪 Testing

No test suite included (use Vitest + React Testing Library):
```bash
# Example test structure
pnpm install -D vitest @testing-library/react @testing-library/jest-dom
```

## 📝 Environment Variables

```env
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id

# Optional
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

## 🎯 Key Features Implemented

✅ Multi-role authentication (buyer/seller)  
✅ Email + password + Google OAuth  
✅ AI-powered chat with product recommendations  
✅ Shopping cart with checkout flow  
✅ Razorpay payment integration  
✅ Order management (buyer & seller)  
✅ Address management  
✅ Seller dashboard with products/orders  
✅ Product feedback (like/dislike)  
✅ Responsive mobile + desktop design  
✅ Real-time notifications (sonner)  
✅ Automatic session recovery  
✅ Seller upsell modal  
✅ Type-safe throughout (TypeScript)  
✅ Error handling & retry logic  

## 📞 Support

For issues:
1. Check backend API is running
2. Verify environment variables
3. Check browser console for errors
4. Check React Query DevTools (`@tanstack/react-query-devtools`)
5. Check Vercel Toolbar in production (if deployed to Vercel)

---

**Built with ❤️ using Next.js 16, shadcn/ui, and Tailwind CSS**
