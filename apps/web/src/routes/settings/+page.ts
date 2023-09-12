export const ssr = false
import { PUBLIC_HOST } from '$env/static/public'
export const load = async ({ fetch }) => {
  const token = localStorage.getItem('jwt') || '';
  const res = await fetch(`${PUBLIC_HOST}/users`, {
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

