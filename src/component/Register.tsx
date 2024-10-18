import React, { useState } from "react";
import axios from "axios";
import { startRegistration } from "@simplewebauthn/browser";
import { useUserContext } from "../context/UserContext";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {setToken }=useUserContext();
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Step 1: Register the user traditionally (username, email, password)
      const userRegistrationResponse = await axios.post(
        "http://localhost:7080/auth/register",
        {
          username,
          email,
          password,
        }
      );
      console.log(userRegistrationResponse);
      const user = userRegistrationResponse.data;

      if (!user) {
        console.error("User registration failed");
        return;
      }

      // Step 2: Fetch WebAuthn registration options from the server
      const optionsResponse = await axios.post(
        "http://localhost:7080/auth/generate-registration-options",
        {
          email, // Use the email as the identifier
        }
      );

      const options = optionsResponse.data;
      console.log("WebAuthn Registration Options:", options);

      // Step 3: Use WebAuthn to create a new credential
      if (!options.challenge) {
        throw new Error("Challenge is missing from the registration options.");
      }
      const credential = await startRegistration(options);
      console.log("WebAuthn Credential:", credential);

      // Step 4: Send the credential to the server for verification
      const verifyResponse = await fetch(
        `http://localhost:7080/auth/verify-registration-response`,
        {
          // credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, credential: credential }),
        }
      );

      // const verifyResponse = await axios.post('http://localhost:7080/auth/verify-registration-response', {
      //   email,
      //   credential,
      // });
      const {token} = await verifyResponse.json();
       setToken(token);
       localStorage.setItem("token", JSON.stringify(token));
      if (token) {
        console.log("Registration successful with WebAuthn", token);
      } else {
        console.error("WebAuthn registration failed", token);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
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
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
