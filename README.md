# Tupalle - Code Sharing Platform

Tupalle is a modern code sharing and social platform where developers can share code snippets, images, and descriptions with the community. Think of it as a combination of GitHub Gists and social media for developers.

## Features

### Backend (Spring Boot)
- **Authentication System**: Session-based authentication with login/register
- **Share Management**: Create, view, like, and search shares
- **User Profiles**: Manage user shares and profile information
- **Search Functionality**: Search shares by title with case-insensitive matching
- **Sorting Options**: View shares by recent or most-liked
- **Database**: MySQL with JPA/Hibernate
- **Session Storage**: Redis for scalable session management
- **Security**: Spring Security with BCrypt password encoding

### Frontend (React + TypeScript)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Authentication**: Login/register forms with validation
- **Main Feed**: View and interact with shared content
- **Search**: Real-time search functionality
- **Profile Management**: View personal shares and liked content
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.5.5
- Spring Security
- Spring Data JPA
- MySQL 8.0
- Redis
- Maven

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React (Icons)

## Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Redis

### Backend Setup

1. **Database Setup**
   ```sql
   CREATE DATABASE Tupalle;
   ```

2. **Redis Setup**
   - Install and start Redis server on localhost:6379

3. **Configuration**
   - Update `src/main/resources/application.properties` with your database credentials

4. **Run the Application**
   ```bash
   cd tupalle
   ./mvnw spring-boot:run
   ```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd tupalle-frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Shares
- `GET /shares` - Get shares (with sorting: recent, most-liked)
- `GET /shares/search` - Search shares by title
- `GET /shares/{id}` - Get specific share
- `POST /shares` - Create new share
- `POST /shares/{id}/like` - Like a share
- `DELETE /shares/{id}/like` - Unlike a share

### Users
- `GET /users/me/shares` - Get current user's shares
- `GET /users/{username}/shares` - Get user's shares by username

## Default Users

The application creates default users on startup:
- **Admin**: username: `admin`, password: `admin123`
- **Test User**: username: `testuser`, password: `test123`

## Project Structure

```
tupalle/
├── src/main/java/com/tpl/tupalle/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST controllers
│   ├── entity/          # JPA entities and DTOs
│   ├── repositories/    # Data repositories
│   ├── services/        # Business logic
│   └── security/        # Security configuration
└── src/main/resources/
    └── application.properties

tupalle-frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   └── hooks/          # Custom React hooks
└── public/
```

## Features Overview

### Main Screen
- Displays most liked or recent shares
- Search functionality
- Like/unlike shares
- Pagination support

### Profile Screen
- View personal shares
- Manage liked content (future feature)
- User statistics

### Authentication
- Secure session-based authentication
- User registration and login
- Automatic session management with Redis

## Future Enhancements

- [ ] Create share functionality
- [ ] User profile customization
- [ ] Comments system
- [ ] Follow/unfollow users
- [ ] Categories and tags
- [ ] File upload for images
- [ ] Code syntax highlighting
- [ ] Share editing and deletion
- [ ] Advanced search filters
- [ ] Real-time notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

