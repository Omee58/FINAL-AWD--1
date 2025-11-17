# ShadiSeva Frontend

A modern React application for the ShadiSeva wedding services platform. This frontend provides a user-friendly interface for clients to browse, book, and manage wedding services.

## Features

### Client Features
- **Dashboard**: View all bookings with status tracking and cancellation options
- **Profile Management**: Update personal information and change password
- **Service Discovery**: Browse and filter wedding services by category, location, and price
- **Booking System**: Book services with date selection and payment details
- **Real-time Updates**: Live status updates for bookings

### Technical Features
- **Role-based Access**: Secure authentication and authorization
- **Responsive Design**: Mobile-first approach with Bootstrap
- **Modern UI/UX**: Professional design with smooth animations
- **API Integration**: Full integration with backend REST APIs
- **State Management**: Context API for global state management

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Bootstrap 5** - UI framework
- **Axios** - HTTP client for API calls
- **Context API** - State management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd FE
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Client dashboard
│   ├── Login.jsx        # Login form
│   ├── Navbar.jsx       # Navigation bar
│   ├── Profile.jsx      # User profile management
│   ├── ProtectedRoute.jsx # Route protection
│   ├── Register.jsx     # Registration form
│   └── Services.jsx     # Service discovery and booking
├── context/             # React context
│   └── AuthContext.jsx  # Authentication context
├── services/            # API services
│   └── api.js          # API configuration and functions
├── App.jsx             # Main application component
├── App.css             # Custom styles
├── index.css           # Global styles
└── main.jsx            # Application entry point
```

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password

### Client Operations
- `GET /api/client/bookings` - Get user bookings
- `PATCH /api/client/bookings/:id/cancel` - Cancel booking
- `GET /api/client/services` - Get available services
- `POST /api/client/book-service` - Book a service

## Key Components

### Dashboard
- Displays all user bookings in a table format
- Shows booking status with color-coded badges
- Allows cancellation of pending bookings
- Provides quick statistics

### Services
- Advanced filtering by category, location, and price
- Search functionality
- Service cards with images and details
- Booking modal with date and amount selection

### Profile
- Update personal information (name, phone)
- Change password with validation
- Email display (read-only for security)

## Authentication Flow

1. **Login/Register**: Users authenticate through forms
2. **Token Storage**: JWT tokens stored in localStorage
3. **Protected Routes**: Routes protected by authentication status
4. **Auto-logout**: Automatic logout on token expiration
5. **Role-based Access**: Different dashboards for different user roles

## Styling

- **Bootstrap 5**: Primary UI framework
- **Custom CSS**: Additional styling for enhanced UX
- **Responsive Design**: Mobile-first approach
- **Hover Effects**: Smooth transitions and animations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Upload the `dist` folder to your hosting service
3. Configure your hosting service to handle client-side routing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
