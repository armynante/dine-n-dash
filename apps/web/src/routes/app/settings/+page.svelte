<script lang="ts">
	import { PUBLIC_HOST } from '$env/static/public';
	import { onMount } from 'svelte';
	import MaskInput from 'svelte-input-mask/MaskInput.svelte';

	let jwt: string | null = '';
	export let data;
	let error = '';
	let loading = false;
	let resyLoading = false;
	let resyError = '';
	let resySuccessMessage = '';
	let saved = false;
	let phoneNumberUpdates = data.user?.phoneUpdates;
	let phoneNumber = data.user?.phoneNumber;
	let resyEmail = data.user?.resyEmail;
	let resyPassword: string;
	let resyResponse;

	async function handleResyAuth() {
		resyLoading = true;
		const response = await fetch(`${PUBLIC_HOST}/resy/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: jwt || ''
			},
			body: JSON.stringify({ email: resyEmail, password: resyPassword })
		});

		if (response.ok) {
			const data = await response.json();
			resyResponse = data;
			resySuccessMessage = data.message;
			resyError = '';
			localStorage.setItem('jwt', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
      console.log(data);
		} else {
			// parse error in response body
			const { message } = await response.json();
			resyError = message;
		}
		resyLoading = false;
	}

	async function handleSave() {
		loading = true;
		saved = false;
		const response = await fetch(`${PUBLIC_HOST}/users`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: jwt || ''
			},
			body: JSON.stringify({ phoneNumber, phoneUpdates: phoneNumberUpdates })
		});

		if (response.ok) {
			const data = await response.json();
			resyResponse = data;
			resySuccessMessage = data.message;
			saved = true;
			error = '';
			localStorage.setItem('user', JSON.stringify(data.user));
		} else {
			// parse error in response body
			const { message } = await response.json();
			saved = false;
			error = message;
		}
		loading = false;
	}

	onMount(() => {
		jwt = localStorage.getItem('jwt');
		if (!jwt) {
			window.location.href = '/login';
		}
	});
</script>

<div class="space-y-10 divide-y divide-gray-900/10">
  <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
    <div class="px-4 sm:px-0">
      <h2 class="text-base font-semibold leading-7 text-gray-900">Account Details</h2>
      <p class="mt-1 text-sm leading-6 text-gray-600">Basic settings </p>
        {#if saved && !loading && !error}
          <p class="mt-2 text-sm leading-6 text-green-600">Saved</p>
        {/if}
        {#if error}
          <p class="mt-2 text-sm leading-6 text-red-600">{error}</p>
        {/if}
    </div>

    <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div class="px-4 py-6 sm:p-8">
        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div class="sm:col-span-4">
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
            <div class="mt-2">
              <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <input
                  type="text"
                  name="email"
                  id="email"
                  class="block flex-1 border-0 bg-transparent py-1.5 pl-5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  readonly
                  value={data?.user?.email}
							  />
              </div>
              <div class="mt-2">
                <a href="#" class="text-sm font-medium leading-6 text-blue-500 hover:text-gray-900"
                  >Reset password</a
                >
              </div>

              <label for="phoneNumber" class="mt-4 mb-4 block text-sm font-medium leading-6 text-gray-900">
                Phone Number
              </label>
  
              <div
							  class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
						  >
							<MaskInput
								bind:value={phoneNumber}
								type="tel"
								name="phoneNumber"
								id="phoneNumber"
								class="block flex-1 border-0 bg-transparent py-1.5 pl-5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
								alwaysShowMask
								mask="+1 (000) 000-0000"
								maskChar="_"
							/>
						</div>
						<div class="relative flex items-start mt-6">
							<div class="flex h-6 items-center">
								<input
									bind:checked={phoneNumberUpdates}
									id="phoneUpdates"
									aria-describedby="phoneUpdates-description"
									name="phoneUpdates"
									type="checkbox"
									class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
								/>
							</div>
							<div class="ml-3 text-sm leading-6">
								<label for="phoneUpdates" class="font-medium text-gray-900">Activate</label>
								<span id="phoneUpdates" class="text-gray-500">
                  <span class="sr-only">
                    Activate
                  </span>
                  text updates on bookings.
                </span>
							</div>
						</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        
        <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
        <button
          type="submit"
          disabled={loading}
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          on:click={handleSave}
        >
          Save
        </button>
      </div>
    </form>
  </div>

  <div class="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
    <div class="px-4 sm:px-0">
      <h2 class="text-base font-semibold leading-7 text-gray-900">Resy Account Details</h2>
      <p class="mt-1 text-sm leading-6 text-gray-600">Authenticate with Resy so you can start booking restaurant reservations. We don;t store your password. We use this to grab an API token.</p>
      {#if resySuccessMessage && !resyLoading && !resyError}
        <p class="mt-2 text-sm leading-6 text-green-600">{resySuccessMessage}</p>
      {/if}
      {#if data?.user?.resyToken && !resyLoading && !resyError}
        <p class="mt-2 text-sm leading-6 text-green-600">Authenticated</p>
      {/if}

      {#if resyError}
        <p class="mt-2 text-sm leading-6 text-red-600">{resyError}</p>
      {/if}
    </div>

    <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div class="px-4 py-6 sm:p-8">
        <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        

          <div class="sm:col-span-4">
            <label for="resyEmail" class="block text-sm font-medium leading-6 text-gray-900">Resy email</label>
            <div class="mt-2">
              <input
                id="resyEmail"
                name="resyEmail"
                type="email"
                class="pl-5 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                bind:value={resyEmail}
              >
            </div>
          </div>
          
          <div class="sm:col-span-4">
            <label for="resyPassword" class="block text-sm font-medium leading-6 text-gray-900">Resy password</label>
            <div class="mt-2">
              <input
                id="resyPassword"
                name="resyPassword"
                type="password"
                class="pl-5 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                bind:value={resyPassword}
              >
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button 
          type="button"
          class="text-sm font-semibold leading-6 text-gray-900"
        >
            Reset
        </button>
        <button
          type="submit"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          on:click|preventDefault={handleResyAuth}
        >
            Authenticate
        </button>
      </div>
    </form>
  </div>
</div>
