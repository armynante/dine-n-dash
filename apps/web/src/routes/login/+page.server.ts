import { login } from '$lib/auth';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions :Actions= {
  default: async (event) => {
    console.log('Handling login request');
    const formData = Object.fromEntries(await event.request.formData());
    // Verify that we have an email and a password
    if (!formData.email || !formData.password) {
      return fail(400, {
        error: 'Missing email or password'
      });
    }

    const { email, password } = formData as { email: string; password: string };

    try {
      const user = await login(email, password);

      // If the user was found, return a valid response
      return { success: true, user: user };
    } catch (error) {
      console.error(error);
      const err = error as Error;
      return fail(500, {
        error: err.message || 'An error occurred while processing the login request'
      });
    }

    
    // throw redirect(302, '/');
  }
};