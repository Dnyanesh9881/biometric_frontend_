import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useUserContext } from '../context/UserContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useBiometric, setUseBiometric] = useState(false); // State to track login method
  const {setToken }=useUserContext();
  const handleBiometricLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Fetch authentication options from the server
    const optionsResponse = await fetch('http://localhost:7080/auth/generate-authentication-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }),
    });

    const options = await optionsResponse.json();
     console.log(options);
    // Step 2: Use WebAuthn to authenticate
    const credential = await startAuthentication(options);
      console.log(credential);
    // Step 3: Send the credential to the server for verification
    const verifyResponse = await fetch('http://localhost:7080/auth/verify-authentication-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, credential }),
    });

    const {token} = await verifyResponse.json();
    setToken(token);
    localStorage.setItem("token", JSON.stringify(token));
    if (token) {
      console.log('Login successful', token);
    } else {
      console.error('Login failed', token);
    }
    // console.log("all good");
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('http://localhost:7080/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const {token} = await response.json();
    setToken(token);
    localStorage.setItem("token", JSON.stringify(token));
    if (token) {
      console.log('Login successful', token);
    } else {
      console.error('Login failed', token);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <label>
        <input
          type="checkbox"
          checked={useBiometric}
          onChange={() => setUseBiometric(!useBiometric)}
        />
        Use Biometric Authentication
      </label>

      {useBiometric ? (
        <form onSubmit={handleBiometricLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <button type="submit">Login with WebAuthn</button>
        </form>
      ) : (
        <form onSubmit={handleEmailPasswordLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login with Email/Password</button>
        </form>
      )}
    </div>
  );
};

export default Login;
