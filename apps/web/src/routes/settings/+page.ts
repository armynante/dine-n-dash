export const ssr = false
const HOST = process.env.HOST;
export const load = async ({ fetch }) => {
  const token = localStorage.getItem('jwt') || '';
  const res = await fetch(`${HOST}/users`, {
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

