# dineAR - AR Menu Visualization Platform

A full-stack application for restaurants to create AR-viewable menu items. Built with React, Three.js, Express, and MongoDB.

## Features

- 📱 Mobile-first AR experience (WebXR)
- 🔒 Secure authentication with JWT
- 📸 Camera-based dish capture
- 🔢 QR code generation for AR viewing
- 🛡️ OWASP security best practices
- ⚡ Rate limiting and input validation
- 🎨 Professional, clean design

## Tech Stack

**Frontend:**
- React 18 + Vite
- Three.js + React Three Fiber
- React Three XR (WebXR)
- Axios for API calls
- TailwindCSS

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Bcrypt password hashing
- Express Rate Limit
- Express Validator
- Helmet.js security
- Multer file uploads

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running locally
- Modern browser (Chrome on Android for AR)

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd DineAR
```

### 2. Set up Backend

```bash
cd server
npm install

# Copy environment variables and configure
copy .env.example .env
# Edit .env with your configuration
```

**Important environment variables to configure in `server/.env`:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Strong random secret for JWT (change the default!)
- `ALLOWED_ORIGINS` - Your frontend URL(s)

### 3. Set up Frontend

```bash
cd ..  # Back to project root
npm install

# Copy environment variables
copy .env.example .env
# Edit .env if backend is not on localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# Windows (if MongoDB is installed as service)
net start MongoDB

# Or if running manually
mongod
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`  
The backend API will be available at `http://localhost:5000`

## Development Workflow

1. **Backend Development**
   - Backend files are in `server/` directory
   - Run with `npm run dev` for auto-restart on changes
   - API endpoints documented in `API.md`

2. **Frontend Development**
   - React components in `src/components/`
   - API client in `src/lib/apiClient.js`
   - Styles in `src/index.css`

3. **Testing**
   - Test authentication flow
   - Test dish CRUD operations  
   - Test AR viewing (requires Android device)
   - Check rate limiting behavior

## Security Features

✅ JWT-based authentication  
✅ Password hashing with bcrypt (cost factor 12)  
✅ Rate limiting on all endpoints  
✅ Input validation and sanitization  
✅ CORS configuration  
✅ Helmet.js security headers  
✅ File upload restrictions (images only, 5MB max)  
✅ SQL/NoSQL injection prevention  
✅ XSS prevention  

See `SECURITY.md` for detailed security documentation.

## API Documentation

See `API.md` for complete API documentation with request/response examples.

## Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in environment
2. Use a strong `JWT_SECRET`
3. Configure MongoDB connection string for production
4. Set up proper CORS origins
5. Consider using a reverse proxy (nginx)

### Frontend Deployment

1. Build the frontend: `npm run build`
2. Deploy the `dist/` folder to your hosting
3. Update `VITE_API_URL` to point to production backend
4. Ensure HTTPS for production (required for camera access)

### Database

- Use MongoDB Atlas for cloud hosting
- Set up indexes for performance
- Regular backups recommended

## Project Structure

```
DineAR/
├── server/                 # Backend API
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, validation, rate limiting
│   ├── server.js          # Main server file
│   └── package.json
├── src/                   # Frontend React app
│   ├── components/        # React components
│   ├── lib/              # API client, utilities
│   ├── App.jsx           # Main app component
│   └── index.css         # Global styles
├── public/               # Static files
└── package.json          # Frontend dependencies
```

## Troubleshooting

**MongoDB connection failed:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

**Authentication not working:**
- Clear localStorage and try again
- Check backend logs for errors
- Verify JWT_SECRET is set

**Camera not working:**
- HTTPS required in production
- Check browser permissions
- Use Chrome on Android for best AR support

**Rate limit hit:**
- Wait 15 minutes for limits to reset
- Adjust limits in `server/.env` for development

## Contributing

1. Create feature branch
2. Follow existing code style
3. Test thoroughly
4. Submit pull request

## License

ISC
