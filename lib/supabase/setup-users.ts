import { supabase } from './config';
import bcrypt from 'bcrypt';

async function registerUser(email: string, username: string, password: string, role: string) {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into the database
  const { error: insertError } = await supabase
    .from('users')
    .insert([{ email, username, password: hashedPassword, role }]);

  if (insertError) {
    console.error('Error registering user:', insertError);
    return;
  }

  console.log('User registered successfully.');
}

// Example usage
registerUser('admin@example.com', 'admin', 'adminpassword', 'admin');
registerUser('user@example.com', 'user', 'userpassword', 'user');
