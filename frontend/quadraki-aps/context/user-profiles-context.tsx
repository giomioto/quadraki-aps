import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, Platform } from "react-native";
import { router } from "expo-router";

export type UserRole = "praticante" | "proprietario";

export type UserProfileData = {
  id_usuario?: number;
  id_proprietario?: number;
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
  activeRole: UserRole | null;
  updateProfile: (role: UserRole, updates: UpdateProfileInput) => void;
  logout: (role: UserRole) => void;
};

const initialProfiles: UserProfilesState = {
  praticante: {
    id_usuario: 1,
    name: "Carlos Henrique Souza",
    email: "carlos@email.com",
    phone: "(11) 99999-1234",
    document: "123.456.789-00",
    password: "teste",
  },
  proprietario: {
    id_proprietario: 1,
    name: "Mariana Costa Lima",
    email: "mariana@quadra.com",
    phone: "(11) 98888-4321",
    document: "12.345.678/0001-99",
    password: "teste",
  },
};

const emptyProfile = {
  id_usuario: undefined,
  id_proprietario: undefined,
  name: "",
  email: "",
  phone: "",
  document: "",
  password: "",
};

const UserProfilesContext = createContext<UserProfilesContextValue | null>(
  null,
);

export function UserProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfilesState>(initialProfiles);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedProfiles() {
      try {
        const stored = await AsyncStorage.getItem("@UserProfiles");
        if (stored) {
          setProfiles(JSON.parse(stored));
        }
        const storedRole = await AsyncStorage.getItem("@ActiveRole");
        if (storedRole) {
          setActiveRole(storedRole as UserRole);
        }
      } catch (e) {
        console.error("Erro ao carregar perfis salvos:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSavedProfiles();
  }, []);

  const value = useMemo<UserProfilesContextValue>(
    () => ({
      profiles,
      activeRole,
      updateProfile: (role, updates) => {
        setProfiles((current) => {
          const next = {
            ...current,
            [role]: {
              ...current[role],
              ...updates,
            },
          };
          AsyncStorage.setItem("@UserProfiles", JSON.stringify(next)).catch(err => {
            console.error("Erro ao salvar perfis:", err);
          });
          return next;
        });
        setActiveRole(role);
        AsyncStorage.setItem("@ActiveRole", role).catch(err => {
          console.error("Erro ao salvar activeRole:", err);
        });
      },
      logout: (role) => {
        setProfiles((current) => {
          const next = {
            ...current,
            [role]: { ...emptyProfile },
          };
          return next;
        });
        setActiveRole(null);

        const nextProfiles = {
          ...profiles,
          [role]: { ...emptyProfile },
        };

        if (Platform.OS === "web") {
          try {
            localStorage.setItem("@UserProfiles", JSON.stringify(nextProfiles));
            localStorage.removeItem("@ActiveRole");
          } catch (e) {
            console.error("Erro ao salvar perfis no localStorage:", e);
          }
          window.location.href = "/";
        } else {
          AsyncStorage.setItem("@UserProfiles", JSON.stringify(nextProfiles)).catch(err => {
            console.error("Erro ao salvar perfis ao deslogar:", err);
          });
          AsyncStorage.removeItem("@ActiveRole")
            .then(() => {
              router.replace("/");
            })
            .catch(err => {
              console.error("Erro ao remover activeRole:", err);
              router.replace("/");
            });
        }
      },
    }),
    [profiles, activeRole],
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

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
  const { profiles, updateProfile, logout } = useUserProfiles();

  return {
    profile: profiles[role],
    updateProfile: (updates: UpdateProfileInput) =>
      updateProfile(role, updates),
    logout: () => logout(role),
  };
}
