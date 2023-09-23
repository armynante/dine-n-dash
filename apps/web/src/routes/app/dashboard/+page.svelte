<script>
	import Watcher from "$lib/watcher.svelte";
	import Detail from "./detail.svelte";
</script>

<main class="lg:pr-96 -ml-6 -mt-10">
  <header class="flex items-center justify-between border-b border-slate/5 py-4 sm:py-6">
    <h1 class="px-6 text-base font-semibold leading-7 text-slate-500">Current watchers</h1> 
  </header>

  <!-- Deployment list -->
  <ul role="list" class="divide-y divide-slate-200">
    <Watcher />
    <Watcher />
    <Watcher />
    <Watcher />
    <Watcher />
 
    <!-- More deployments... -->
  </ul>
</main>
<Detail/>
