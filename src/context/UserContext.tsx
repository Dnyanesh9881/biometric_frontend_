import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
} from "react";

// Define the shape of the context state
interface UserContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

// Create the context with default values
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    // Initialize the token from Cookies or set it to null if undefined
    return localStorage.getItem("token") ?? null;
  });

  useEffect(() => {
    // getData();

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Memoize the value to avoid unnecessary re-renders
  const value = useMemo(() => ({ token, setToken }), [token]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook for using the user context
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
