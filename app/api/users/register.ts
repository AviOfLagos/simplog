import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from 'lib/supabase/config';
import bcryptjs from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, username, password } = req.body;

    // Check if the username already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: 'Error checking username' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Insert user into the database
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ email, username, password: hashedPassword, role: 'user' }]);

    if (insertError) {
      return res.status(500).json({ error: 'Registration failed' });
    }

    return res.status(200).json({ message: 'Registration successful' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
