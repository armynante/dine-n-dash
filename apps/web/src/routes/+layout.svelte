<script>
  import "../app.css";
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <div class="mx-auto max-w-3xl">

<header>
  <nav class="mx-auto flex max-w-7xl pt-6 pb-6" aria-label="Global">
    <div class="flex items-center gap-x-12">
          <a href="/" class="-m-1.5 p-1.5">
            <span class="sr-only">Dine-N-Dash</span>
            <img class="h-8 w-auto rounded-full" src="/logo.jpg" alt="" />
          </a>
          <div class="hidden space-x-10 sm:flex sm:ml-10">
            <a href="/login" class="font-medium text-gray-500 hover:text-gray-900">
              Login
            </a>
            <a href="#" class="font-medium text-gray-500 hover:text-gray-900">
              Register
            </a>
            <a href="#" class="font-medium text-gray-500 hover:text-gray-900">
              Features
            </a>
            <a href="#" class="font-medium text-gray-500 hover:text-gray-900">
              Docs
            </a>
          </div>
        </div>
  </nav>
</header>
    <slot />
  </div>
</div>