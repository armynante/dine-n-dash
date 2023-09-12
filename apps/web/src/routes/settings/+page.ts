export const ssr = false

/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
  const token = localStorage.getItem('jwt');
  const res = await fetch('http://localhost:4000/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
  })

  const  { user } = await res.json()
  return {
    user
  }
}

