class User {
  constructor(name, password, role) {
    this.name = name;
    this.password = password;
    this.role = role;
  }
}

class Session {
  constructor(token, loggedIn) {
    this.token = token;
    this.loggedIn = loggedIn;
  }
}

class Auth {
  constructor() {
    this.userTable = new Map();
    this.sessionTable = new Map();
  }

  generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async login(email, password) {
    if (!this.userTable.has(email)) {
      return { success: false, error: "Email does not exist" };
    }

    const user = this.userTable.get(email);
    const hashedInput = await this.hashPassword(password);

    if (user.password !== hashedInput) {
      return { success: false, error: "Wrong password" };
    }

    const token = this.generateToken();
    const session = new Session(token, true);
    this.sessionTable.set(email, session);

    return {
      success: true,
      token: token,
      message: "User logged in!"
    };
  }

  async signup(name, email, password, adminEmail) {
    if (!this.userTable.has(adminEmail)) {
      return { success: false, error: "Admin does not exist" };
    }

    const admin = this.userTable.get(adminEmail);
    if (admin.role !== 'ADMIN') {
      return { success: false, error: "You are not authorized to do that!" };
    }

    if (this.userTable.has(email)) {
      return { success: false, error: "User with this email already exists" };
    }

    const hashedPassword = await this.hashPassword(password);
    const user = new User(name, hashedPassword, 'USER');
    this.userTable.set(email, user);

    return {
      success: true,
      message: "User created",
      email: email,
      data: user
    };
  }

  async changePassword(email, oldPass, newPass) {
    if (!this.userTable.has(email)) {
      return { success: false, error: "User does not exist" };
    }

    const user = this.userTable.get(email);
    const oldHashed = await this.hashPassword(oldPass);
    if (oldHashed !== user.password) {
      return { success: false, error: "Old password does not match" };
    }

    const newHashed = await this.hashPassword(newPass);
    const updatedUser = new User(user.name, newHashed, user.role);
    this.userTable.set(email, updatedUser);

    return { success: true, message: "Password updated successfully" };
  }

  logout(email) {
    if (!this.sessionTable.has(email)) {
      return { success: false, error: "User is not logged in" };
    }

    const loggedUser = this.sessionTable.get(email);
    if (!loggedUser.loggedIn) {
      return { success: false, error: "User is already logged out" };
    }

    loggedUser.loggedIn = false;

    return { success: true, message: "User has been logged out" };
  }
}



const auth = new Auth();

(async () => {
  const adminEmail = "admin@example.com";
  const adminUser = new User("Admin", await auth.hashPassword("admin123"), "ADMIN");
  auth.userTable.set(adminEmail, adminUser);
  console.log("[Test 1] Admin user registered manually.");

  const result2 = await auth.signup("John Doe", "john@example.com", "password123", "admin@example.com");
  console.log("[Test 2] Signup result:", result2);

  const result3 = await auth.signup("John Doe", "john@example.com", "password123", "admin@example.com");
  console.log("[Test 3] Duplicate signup result:", result3);

  const result4 = await auth.login("john@example.com", "password123");
  console.log("[Test 4] Login success:", result4);

  const result5 = await auth.login("john@example.com", "wrongpass");
  console.log("[Test 5] Login with wrong password:", result5);

  const result6 = await auth.changePassword("john@example.com", "password123", "newpass456");
  console.log("[Test 6] Change password result:", result6);

  const result7 = await auth.login("john@example.com", "newpass456");
  console.log("[Test 7] Login after password change:", result7);

  const result8 = auth.logout("john@example.com");
  console.log("[Test 8] Logout result:", result8);

  const result9 = auth.logout("john@example.com");
  console.log("[Test 9] Logout again result:", result9);

  const result10 = await auth.signup("Fake", "fake@example.com", "1234", "john@example.com");
  console.log("[Test 10] Unauthorized signup result:", result10);
})();
