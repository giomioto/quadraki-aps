import { Stack } from "expo-router";
import { UserProfilesProvider } from "../context/user-profiles-context";
import { Alert, Platform } from "react-native";

// Polyfill Alert.alert for React Native Web
if (Platform.OS === "web") {
  Alert.alert = (title, message, buttons) => {
    const msg = (title ? `${title}\n\n` : "") + (message || "");
    if (buttons && buttons.length > 0) {
      const cancelBtn = buttons.find(b => b.style === "cancel");
      const otherBtn = buttons.find(b => b.style !== "cancel");
      if (otherBtn) {
        const confirmed = window.confirm(msg);
        if (confirmed) {
          if (otherBtn.onPress) otherBtn.onPress();
        } else {
          if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
        }
      } else {
        window.alert(msg);
        const firstBtn = buttons[0];
        if (firstBtn && firstBtn.onPress) firstBtn.onPress();
      }
    } else {
      window.alert(msg);
    }
  };
}

export default function Layout() {
  return (
    <UserProfilesProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Login / Cadastro" }} />
        <Stack.Screen
          name="cadastro"
          options={{ title: "Realizar Cadastro" }}
        />
        <Stack.Screen name="(praticante)" options={{ headerShown: false }} />
        <Stack.Screen name="(proprietario)" options={{ headerShown: false }} />
        <Stack.Screen
          name="reserva"
          options={{ title: "Detalhes da Reserva" }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Editar perfil" }}
        />
      </Stack>
    </UserProfilesProvider>
  );
}
