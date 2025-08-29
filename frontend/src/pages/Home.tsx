import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCompareResult } from '../api/rest-service'
import type { DiffResponse } from '../api/api-types'

export default function Home() {
  const { userInfo, logout } = useAuth()

  const [compareResult, setCompareResult] = useState<DiffResponse | null>(null)

  useEffect(() => {
    getCompareResult("73848940", "main", "dev").then(setCompareResult).catch(console.error)
  }, [])

  return (
    <div>
      <h1>Home</h1>
      <h1>Added</h1>
      {JSON.stringify(compareResult?.added, null, 2)}
      <h1>Updated</h1>
      {JSON.stringify(compareResult?.updated, null, 2)}
      <h1>Deleted</h1>
      {JSON.stringify(compareResult?.deleted, null, 2)}
      <p>Bienvenue, {userInfo?.preferred_username}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  )
}
