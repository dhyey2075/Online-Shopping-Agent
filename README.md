# AI Shopping Agent

AI Shopping Agent is a full-stack shopping assistant that helps people discover products through conversation, manage a cart, and complete checkout. It also includes a seller workspace for managing products and orders.

The project combines a Next.js frontend with a FastAPI backend. Shopping requests are handled by a LangGraph workflow, while MongoDB stores users, conversations, products, carts, and orders.

## What you can do

- Ask for products in natural language and refine recommendations
- Sign in with email and password or Google
- Save products to a cart and check out with Razorpay
- View orders and manage delivery addresses
- Create and manage products as a seller
- Track and update seller orders
- Choose between OpenAI, Gemini, Anthropic, or a local Ollama model
- Use mock product and payment flows while developing without external API keys

## Tech stack

**Frontend**

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- TanStack Query and Zustand
- React Hook Form and Zod

**Backend**

- FastAPI and Pydantic
- LangGraph and LangChain
- MongoDB with Motor
- JWT authentication
- eBay Finding API and Razorpay

## Project structure

```text
.
├── backend/               FastAPI application and agent workflow
│   ├── app/
│   │   ├── api/           API routes
│   │   ├── graph/         LangGraph nodes and workflow
│   │   ├── models/        Database models
│   │   ├── services/      Application services
│   │   └── main.py        Backend entry point
│   ├── tests/
│   └── requirements.txt
└── frontend/              Next.js application
    ├── app/               Buyer, seller, and authentication pages
    ├── components/        Shared UI components
    ├── hooks/             Data and feature hooks
    ├── services/          Backend API clients
    └── stores/            Client-side state
```

## Getting started

### Prerequisites

Install the following before running the project:

- Python 3.10 or newer
- Node.js 18 or newer
- MongoDB, running locally or through MongoDB Atlas

### 1. Start the backend

From the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```bash
# macOS or Linux
source .venv/bin/activate
```

Install the dependencies and create your local environment file:

```bash
pip install -r requirements.txt
cp .env.example .env
```

On Windows Command Prompt, use `copy .env.example .env` instead.

At minimum, review these values in `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=shopping_agent
JWT_SECRET_KEY=replace-this-with-a-long-random-value

LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
```

You can use Gemini, Anthropic, or Ollama instead of OpenAI. The available settings are documented in `backend/.env.example`. eBay and Razorpay keys are optional during local development because the application includes mock fallbacks.

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend is now available at `http://localhost:8000`. You can check it at:

- Health check: `http://localhost:8000/api/v1/health`
- Interactive API docs: `http://localhost:8000/docs`

### 2. Start the frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key
```

Only the API URL is needed for the basic email/password flow. Google and Razorpay values are required when testing those integrations.

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Useful commands

```bash
# Frontend
npm run dev
npm run lint
npm run build

# Backend (run inside backend/)
pytest
uvicorn app.main:app --reload
```

## How the shopping assistant works

When a buyer sends a message, the backend first interprets the request and checks whether more information is needed. It then routes the request through the LangGraph workflow, searches available product sources, filters and ranks the results, and returns a conversational response with product recommendations. Conversation state is saved so the buyer can continue refining the same search.

## Notes for development

- Keep `.env` files out of version control and never commit real API secrets.
- Use Razorpay test credentials while developing.
- API routes are grouped under `/api/v1`.
- MongoDB must be reachable before the backend starts because database indexes are created during startup.
- More detailed component-level documentation is available in `backend/README.md` and `frontend/FRONTEND_README.md`.

## License

No license has been added to this repository yet. Add one before distributing or reusing the project publicly.
