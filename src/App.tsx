import './App.css';
import { useState } from 'react';
import { TutorialBattle } from './components/TutorialBattle';

type Screen = 'menu' | 'login' | 'register' | 'tutorial';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    setLoggedInUser(trimmedUsername);
    setUsername('');
    setPassword('');
    setCurrentScreen('menu');
  };

  return (
    <div className="app-container">
      {/* MAIN MENU */}
      {currentScreen === 'menu' && (
        <div className="screen-stack">
          <h1>27 Chambers of Sin</h1>

          {loggedInUser && (
            <p className="welcome-message">
              Welcome back, <strong>{loggedInUser}</strong>!
            </p>
          )}

          <button type="button" onClick={() => setCurrentScreen('tutorial')}>
            New Game
          </button>

          {!loggedInUser ? (
            <>
              <button type="button" onClick={() => setCurrentScreen('login')}>
                Login
              </button>
              <button
                type="button"
                onClick={() => setCurrentScreen('register')}
              >
                Create New Account
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setLoggedInUser(null)}>
              Logout
            </button>
          )}
        </div>
      )}

      {/* LOGIN SCREEN */}
      {currentScreen === 'login' && (
        <form onSubmit={handleAuthSubmit} className="screen-stack">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
          <button type="button" onClick={() => setCurrentScreen('menu')}>
            Back to Menu
          </button>
        </form>
      )}

      {/* CREATE NEW ACCOUNT SCREEN */}
      {currentScreen === 'register' && (
        <form onSubmit={handleAuthSubmit} className="screen-stack">
          <h2>Create New Account</h2>
          <input
            type="text"
            placeholder="Choose a Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Choose a Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Create Account</button>
          <button type="button" onClick={() => setCurrentScreen('menu')}>
            Back to Menu
          </button>
        </form>
      )}

      {/* NEW GAME / TUTORIAL SCREEN */}
      {currentScreen === 'tutorial' && (
        <TutorialBattle onExit={() => setCurrentScreen('menu')} />
      )}
    </div>
  );
}
