// Create a single supabase client for interacting with your database
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { User } from './types.js';


export class Database {

    client:SupabaseClient;

    constructor(supabaseUrl:string, supabaseKey:string) {
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variable');
        }

        this.client = createClient(supabaseUrl, supabaseKey);
    }

    async getUser(email:string) {
        const { data, error } = await this.client
            .from('user')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error(error.code);
            if (error.code === 'PGRST116') {
                throw new Error('No user found with that email');
            }
            console.error(error);
            throw new Error('An error occurred while fetching user');
        }

        return data;
    }

    async updateUser(user:User, userData:object) {
        const { data, error } = await this.client
            .from('user')
            .update(userData)
            .eq('email', user.email)
            .select()
            .single();

        console.log('data', data);
            

        if (error) {
            throw error;
        }

        return data;
    }
}