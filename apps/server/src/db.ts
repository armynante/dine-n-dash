import { Database } from 'diner-utilities';
import 'dotenv/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new Database(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default db;