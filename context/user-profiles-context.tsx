import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type UserRole = "praticante" | "proprietario";

export type UserProfileData = {
  name: string;
  email: string;
  phone: string;
  document: string;
  password: string;
};

type UserProfilesState = Record<UserRole, UserProfileData>;

type UpdateProfileInput = Partial<UserProfileData>;

type UserProfilesContextValue = {
  profiles: UserProfilesState;
  updateProfile: (role: UserRole, updates: UpdateProfileInput) => void;
};

const initialProfiles: UserProfilesState = {
  praticante: {
    name: "Carlos Henrique Souza",
    email: "carlos@email.com",
    phone: "(11) 99999-1234",
    document: "123.456.789-00",
    password: "teste",
  },
  proprietario: {
    name: "Mariana Costa Lima",
    email: "mariana@quadra.com",
    phone: "(11) 98888-4321",
    document: "12.345.678/0001-99",
    password: "teste",
  },
};

const UserProfilesContext = createContext<UserProfilesContextValue | null>(
  null,
);

export function UserProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfilesState>(initialProfiles);

  const value = useMemo<UserProfilesContextValue>(
    () => ({
      profiles,
      updateProfile: (role, updates) => {
        setProfiles((current) => ({
          ...current,
          [role]: {
            ...current[role],
            ...updates,
          },
        }));
      },
    }),
    [profiles],
  );

  return (
    <UserProfilesContext.Provider value={value}>
      {children}
    </UserProfilesContext.Provider>
  );
}

export function useUserProfiles() {
  const context = useContext(UserProfilesContext);

  if (!context) {
    throw new Error("useUserProfiles must be used within UserProfilesProvider");
  }

  return context;
}

export function useUserProfile(role: UserRole) {
  const { profiles, updateProfile } = useUserProfiles();

  return {
    profile: profiles[role],
    updateProfile: (updates: UpdateProfileInput) =>
      updateProfile(role, updates),
  };
}
