import { Database } from 'diner-utilities';
import 'dotenv/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default new Database(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!) as any;