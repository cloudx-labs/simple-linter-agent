class UserProfile {
  constructor(name, age, email) {
    this.name = name;
    this.age = age;
    this.email = email;
    this.createdAt = new Date();
  }
  
  getUserSummary() {
    let summary = `Name: ${this.name}, Age: ${this.age}`;
    if (this.email != null) {
      summary = summary + `, Email: ${this.email}`;
    }
    return summary;
  }
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    return true;
  }
}

function createUsers(userData) {
  const users = [];
  for (let i = 0; i < userData.length; i++) {
    const user = userData[i];
    if (user.age > 18) {
      users.push(new UserProfile(user.name, user.age, user.email));
    }
  }
  return users;
}

const sampleData = [
  { name: "John", age: 25, email: "john@example.com" },
  { name: "Jane", age: 17, email: "jane@example.com" },
  { name: "Bob", age: 30, email: "bob@example.com" },
];

const minAge = 18;
const maxAge = 65;

const activeUsers = createUsers(sampleData);

console.log(`Found ${activeUsers.length} active users`);