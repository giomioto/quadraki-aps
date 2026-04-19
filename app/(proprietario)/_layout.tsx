import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function ProprietarioLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#666",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas-ativas"
        options={{
          title: "Reservas Ativas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gerenciar-catalogo"
        options={{
          title: "Meu Catálogo",
          tabBarIcon: ({ color }) => (
            <Ionicons name="business" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <Ionicons name="time" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
