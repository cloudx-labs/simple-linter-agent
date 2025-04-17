// target_code.js
// A more complex example with different linting issues

// Class with missing semicolons and inconsistent spacing
class UserProfile{
    constructor (name,age,email)
    {
        this.name=name
        this.age = age;
        this.email=email
        this.createdAt = new Date()
    }

    // Method with various linting issues
    getUserSummary () 
    {
      var summary=`Name: ${this.name}, Age: ${this.age}`
      if(this.email != null)
      {
          summary = summary + ", Email: "+this.email;
      }

      return summary
    }

    // Static method with indentation issues
  static validateEmail(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if(!emailRegex.test(email)){
return false
  }
    return true;
  }
}

// Function with spacing and semicolon issues
function createUsers (userData) {
  var users = []
  for(var i=0;i<userData.length;i++) {
      const user = userData[i]
      if (user.age > 18){
        users.push(new UserProfile(user.name,user.age,user.email))
      }
  }
  return users;
}

// Example data with missing trailing comma
const sampleData = [
  { name: "John", age: 25, email: "john@example.com" },
  { name: "Jane", age: 17, email: "jane@example.com" },
  { name: "Bob", age: 30, email: "bob@example.com" }
]

// Variable declarations with inconsistent spacing
const minAge=18;
const maxAge = 65

// Function call without semicolon
const activeUsers = createUsers(sampleData)

// Console log with concatenation instead of template literals
console.log("Found "+activeUsers.length+" active users")
