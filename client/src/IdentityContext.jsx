import React, { createContext, useContext, useEffect, useState } from "react";

const IdentityContext = createContext(null);

export function IdentityProvider({ children }) {
  const [name, setName] = useState(() => localStorage.getItem("campusexpress:name") || "");

  useEffect(() => {
    localStorage.setItem("campusexpress:name", name);
  }, [name]);

  return (
    <IdentityContext.Provider value={{ name, setName }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  return useContext(IdentityContext);
}
