import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { userInfo, logout } = useAuth()

  return (
    <div>
      <h1>Home</h1>
      <p>Bienvenue, {userInfo?.preferred_username}</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  )
}
