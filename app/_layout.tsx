import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Login / Cadastro" }} />
      <Stack.Screen name="cadastro" options={{ title: "Realizar Cadastro" }} />
      <Stack.Screen name="(praticante)" options={{ headerShown: false }} />
      <Stack.Screen name="(proprietario)" options={{ headerShown: false }} />
      <Stack.Screen name="reserva" options={{ title: "Detalhes da Reserva" }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Detalhes" }}
      />
    </Stack>
  );
}
