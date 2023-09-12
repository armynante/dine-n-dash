<script lang="ts">
  export let data;
  let loading = false;
  let error = "";
  let successMessage = "";
  let email:string;
  let password:string;
  let confirmPassword:string;
  let response;


  async function handleSave() {
    loading = true; 
    error = "";
    const resp = await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email, password})
    });
    
    if (resp.ok) {
      const data = await resp.json();
      response = data;
      successMessage = data.message;
      error = "";
    } else {
      // parse error in response body
      const { message } = await resp.json();
      successMessage = "";
      error = message;
    }
    loading = false;
  }
</script>
<form class="mt-16">
  <div class="space-y-12">
    <div class="border-b border-gray-900/10 pb-12">
      <h2 class="text-base font-semibold leading-7 text-gray-900">User Settings</h2>

      <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div class="sm:col-span-4">
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
              <input type="text" name="email" id="email" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" bind:value={email}>
            </div>
          </div>
        </div>

        <div class="sm:col-span-4">
          <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
              <input type="password" name="password" id="password" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" bind:value={password}>
            </div>
          </div>
        </div> 

        <div class="sm:col-span-4">
          <label for="confirmPassword" class="block text-sm font-medium leading-6 text-gray-900">Confirm Password</label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
              <input type="password" name="confirmPassword" id="confirmPassword" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" bind:value={confirmPassword}>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-start gap-x-6">
            <button type="submit" on:click={handleSave} disabled={loading} class={`rounded-md ${ !loading ? "bg-amber-600" : "bg-slate-400"} px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600`}>Save</button>
          </div>
          { #if !loading && !error && successMessage }
            <p class="mt-2 text-sm leading-6 text-green-600">{successMessage}</p>
          {/if}
          { #if error }
            <p class="mt-2 text-sm leading-6 text-red-600">{error}</p>
          {/if}
          </div>
        </div>
       
       
          
        </div>
        
      </div>
      
</form>