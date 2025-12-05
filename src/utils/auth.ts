import { User } from '@/types';

// Simulated authentication service
export class AuthService {
  private static readonly USERS: User[] = [
    {
      emp_id: 1,
      email_id: 'manager@transport.com',
      first_name: 'John',
      last_name: 'Manager',
      role_id: 1,
      role_name: 'Manager',
      profile_picture_name: '',
      emp_email: 'manager@transport.com',
      emp_name: 'John Manager',
      emp_role: 'Manager',
      profile_image: ''
    },
    {
      emp_id: 2,
      email_id: 'incharge@transport.com',
      first_name: 'Sarah',
      last_name: 'Incharge',
      role_id: 2,
      role_name: 'Admin',
      profile_picture_name: '',
      emp_email: 'incharge@transport.com',
      emp_name: 'Sarah Incharge',
      emp_role: 'Admin',
      profile_image: ''
    },
    {
      emp_id: 3,
      email_id: 'driver@transport.com',
      first_name: 'Mike',
      last_name: 'Driver',
      role_id: 3,
      role_name: 'Driver',
      profile_picture_name: '',
      emp_email: 'driver@transport.com',
      emp_name: 'Mike Driver',
      emp_role: 'Driver',
      profile_image: ''
    }
  ];

  static async login(email: string, password: string): Promise<User | null> {
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email
    const user = this.USERS.find(u => u.emp_email === email);
    
    if (user && password === 'password') {
      return user;
    }
    
    return null;
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  static logout(): void {
    localStorage.removeItem('currentUser');
  }
}