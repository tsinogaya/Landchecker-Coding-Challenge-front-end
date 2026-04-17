import { AuthForm } from './components/AuthForm';
import { useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { PropertySearchPage } from './pages/PropertySearchPage';

export default function App() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <main className="centered">
        <AuthForm />
      </main>
    );
  }

  return (
    <WatchlistProvider>
      <main className="container">
        <header className="topbar">
          <div>
            <h1>Property Search</h1>
            <p>{user.email}</p>
          </div>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </header>
        <PropertySearchPage />
      </main>
    </WatchlistProvider>
  );
}
