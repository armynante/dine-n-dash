<script lang="ts">
  import { PUBLIC_HOST } from '$env/static/public'
  let email = "";
  let password = "";
  let error = "";
  let loading = false;
  let resp = {};
  let successMessage = "";

  
  async function handleSubmit() {    
    const response = await fetch(`${PUBLIC_HOST}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({email, password})
    });
    
    if (response.ok) {
      const data = await response.json();
      resp = data;
      successMessage = data.message;
      error = "";
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      // parse error in response body
      const { message } = await response.json();
      error = message;
    }
  }
</script>

<div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <img
      class="mx-auto h-36 w-auto rounded-full"
      src="/logo.jpg"
      alt="Your Company"
    />
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
      Sign in to your account
    </h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
      <div>
        <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
          Email address
        </label>
        <div class="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            bind:value={email}
            autoComplete="email"
            required
            class="block w-full px-5 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
            Password
          </label>
          <div class="text-sm">
            <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>
        </div>
        <div class="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            bind:value={password}
            autoComplete="current-password"
            required
            class="block w-full rounded-md border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign in
        </button>
      </div>
    </form>

    <p class="mt-10 text-center text-sm text-gray-500">
      Not registered?{' '}
      <a href="#" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
        Sign up here
      </a>
    </p>
    <p class="mt-10 text-center text-sm text-gray-500">
      {#if error}
        <p class="text-red-500">{error}</p>
      {/if}
      {#if successMessage}
        <p class="text-green-500">{successMessage}</p>
      {/if}
    </p>
  </div>
</div>