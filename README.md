# Authentication System Documentation

## Overview

This documentation describes a JavaScript-based authentication system that provides user management, session handling, and role-based access control. The system uses in-memory storage with Map data structures for user and session management.

## System Architecture

### Components

1. **User Class**: Represents a user with name, hashed password, and role
2. **Session Class**: Manages user sessions with tokens and login state
3. **Auth Class**: Core authentication logic and user management

### Architecture Diagram
![Architecture](./system-design.png)
```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication System                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────────────────────────────────────┐
│    User     │    │              Auth Class                     │
│             │    │                                             │
│ ┌─────────┐ │    │ ┌─────────────────┐  ┌─────────────────────┐ │
│ │  name   │ │    │ │   userTable     │  │   sessionTable      │ │
│ │password │ │────┤ │   (Map)         │  │   (Map)             │ │
│ │  role   │ │    │ │                 │  │                     │ │
│ └─────────┘ │    │ │ email -> User   │  │ email -> Session    │ │
└─────────────┘    │ └─────────────────┘  └─────────────────────┘ │
                   │                                             │
┌─────────────┐    │ ┌─────────────────────────────────────────┐ │
│   Session   │    │ │           Methods                       │ │
│             │    │ │                                         │ │
│ ┌─────────┐ │    │ │ • login(email, password)                │ │
│ │ token   │ │────┤ │ • signup(name, email, password, admin)  │ │
│ │loggedIn │ │    │ │ • changePassword(email, old, new)       │ │
│ └─────────┘ │    │ │ • logout(email)                         │ │
└─────────────┘    │ │ • hashPassword(password)                │ │
                   │ │ • generateToken(length)                 │ │
                   │ └─────────────────────────────────────────┘ │
                   └─────────────────────────────────────────────┘
```

### Data Flow

```
Login Flow:
User → Auth.login() → Validate User → Generate Token → Create Session → Return Success

Signup Flow:
Admin → Auth.signup() → Validate Admin → Check Email → Hash Password → Create User → Return Success

Password Change:
User → Auth.changePassword() → Validate Old Password → Hash New Password → Update User → Return Success

Logout Flow:
User → Auth.logout() → Find Session → Update Session State → Return Success
```

## API Reference

### Classes

#### User Class
```javascript
class User {
  constructor(name, password, role)
}
```

**Properties:**
- `name`: User's display name
- `password`: Hashed password (SHA-256)
- `role`: User role (`USER` or `ADMIN`)

#### Session Class
```javascript
class Session {
  constructor(token, loggedIn)
}
```

**Properties:**
- `token`: Unique session token (32 characters)
- `loggedIn`: Boolean indicating login state

#### Auth Class
```javascript
class Auth {
  constructor()
}
```

**Properties:**
- `userTable`: Map storing email → User mappings
- `sessionTable`: Map storing email → Session mappings

### Methods

#### `login(email, password)`
Authenticates a user and creates a session.

**Parameters:**
- `email`: User's email address
- `password`: Plain text password

**Returns:**
```javascript
// Success
{
  success: true,
  token: "generated_token",
  message: "User logged in!"
}

// Failure
{
  success: false,
  error: "Error message"
}
```

#### `signup(name, email, password, adminEmail)`
Creates a new user account (requires admin authorization).

**Parameters:**
- `name`: User's display name
- `email`: User's email address
- `password`: Plain text password
- `adminEmail`: Admin's email for authorization

**Returns:**
```javascript
// Success
{
  success: true,
  message: "User created",
  email: "user_email",
  data: User_object
}

// Failure
{
  success: false,
  error: "Error message"
}
```

#### `changePassword(email, oldPass, newPass)`
Updates user's password.

**Parameters:**
- `email`: User's email address
- `oldPass`: Current password
- `newPass`: New password

**Returns:**
```javascript
// Success
{
  success: true,
  message: "Password updated successfully"
}

// Failure
{
  success: false,
  error: "Error message"
}
```

#### `logout(email)`
Logs out a user by updating session state.

**Parameters:**
- `email`: User's email address

**Returns:**
```javascript
// Success
{
  success: true,
  message: "User has been logged out"
}

// Failure
{
  success: false,
  error: "Error message"
}
```

## Security Features

### Password Hashing
- Uses SHA-256 algorithm
- Passwords are hashed before storage
- Original passwords are never stored

### Token Generation
- 32-character random tokens
- Uses alphanumeric characters (A-Z, a-z, 0-9)
- Cryptographically secure random generation

### Role-Based Access Control
- `ADMIN` role: Can create new users
- `USER` role: Standard user permissions
- Authorization checks for sensitive operations

## Test Results

The system has been thoroughly tested with the following scenarios:

### Test 1: Admin Registration
```
[Test 1] Admin user registered manually.
```
✅ **Status**: Success - Admin user created with proper role

### Test 2: User Signup
```
[Test 2] Signup result:
{
  data: {
    name: "John Doe",
    password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
    role: "USER"
  },
  email: "john@example.com",
  message: "User created",
  success: true
}
```
✅ **Status**: Success - User created with hashed password

### Test 3: Duplicate Signup Prevention
```
[Test 3] Duplicate signup result:
{
  error: "User with this email already exists",
  success: false
}
```
✅ **Status**: Success - Duplicate email properly rejected

### Test 4: Successful Login
```
[Test 4] Login success:
{
  message: "User logged in!",
  success: true,
  token: "12j1PoKVYCx7fJQPnT5B7mhDQ4kOIPJb"
}
```
✅ **Status**: Success - Login with valid credentials

### Test 5: Invalid Password
```
[Test 5] Login with wrong password:
{
  error: "Wrong password",
  success: false
}
```
✅ **Status**: Success - Invalid password properly rejected

### Test 6: Password Change
```
[Test 6] Change password result:
{
  message: "Password updated successfully",
  success: true
}
```
✅ **Status**: Success - Password updated successfully

### Test 7: Login After Password Change
```
[Test 7] Login after password change:
{
  message: "User logged in!",
  success: true,
  token: "jefSsVJUyoq7aTOecfGZfxfc3u6MZDkZ"
}
```
✅ **Status**: Success - Login works with new password

### Test 8: User Logout
```
[Test 8] Logout result:
{
  message: "User has been logged out",
  success: true
}
```
✅ **Status**: Success - User logged out successfully

### Test 9: Double Logout Prevention
```
[Test 9] Logout again result:
{
  error: "User is already logged out",
  success: false
}
```
✅ **Status**: Success - Double logout properly handled

### Test 10: Unauthorized Signup
```
[Test 10] Unauthorized signup result:
{
  error: "You are not authorized to do that!",
  success: false
}
```
✅ **Status**: Success - Non-admin user cannot create accounts

## Error Handling

The system provides comprehensive error handling for:

- **Email validation**: Checking if email exists in system
- **Password validation**: Verifying password correctness
- **Role authorization**: Ensuring only admins can create users
- **Session management**: Handling login/logout states
- **Duplicate prevention**: Preventing duplicate email registrations

## Limitations

### Current Implementation
- **In-memory storage**: Data is lost when application restarts
- **No persistence**: No database integration
- **Basic token management**: No token expiration or refresh mechanism
- **Limited scalability**: Single-instance memory storage

### Recommended Improvements
1. **Database Integration**: Add persistent storage (MongoDB, PostgreSQL)
2. **JWT Tokens**: Implement JSON Web Tokens with expiration
3. **Password Policies**: Add password strength requirements
4. **Rate Limiting**: Implement login attempt limitations
5. **Email Verification**: Add email verification for new accounts
6. **Session Persistence**: Store sessions in database or Redis
7. **Audit Logging**: Add comprehensive logging for security events

## Usage Example

```javascript
// Initialize the auth system
const auth = new Auth();

// Create admin user
const adminUser = new User("Admin", await auth.hashPassword("admin123"), "ADMIN");
auth.userTable.set("admin@example.com", adminUser);

// Create a new user (requires admin)
const signupResult = await auth.signup(
  "John Doe", 
  "john@example.com", 
  "password123", 
  "admin@example.com"
);

// Login user
const loginResult = await auth.login("john@example.com", "password123");

// Change password
const changeResult = await auth.changePassword(
  "john@example.com", 
  "password123", 
  "newPassword456"
);

// Logout user
const logoutResult = auth.logout("john@example.com");
```

## Conclusion

This authentication system provides a solid foundation for user management with proper security measures including password hashing, role-based access control, and session management. While suitable for development and testing purposes, production deployment would require the recommended improvements for enhanced security and scalability.
