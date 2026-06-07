import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { apiFetch } from "../../services/api";
import { useUserProfile } from "../../context/user-profiles-context";

export default function MenuPraticanteScreen() {
  const { logout } = useUserProfile("praticante");
  const [quadras, setQuadras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuadras() {
      try {
        const data = await apiFetch<any[]>("quadras");
        setQuadras(data);
      } catch (error) {
        console.error("Erro ao carregar quadras:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuadras();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/reserva",
          params: {
            id: String(item.id_quadra),
            nome: item.nome,
            preco: `R$ ${item.valor}`,
            horario: "19:00",
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>
      </View>
      <Text style={styles.cardSport}>{item.esporte}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDistance} numberOfLines={1}>
          <Ionicons name="location-outline" size={14} color="#666" />{" "}
          {item.endereco || "Sem endereço"}
        </Text>
        <Text style={styles.cardPrice}>R$ {parseFloat(item.valor).toFixed(2).replace(".", ",")}/h</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, Praticante!</Text>
          <Text style={styles.subText}>Quadras perto de você</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={quadras}
          keyExtractor={(item) => String(item.id_quadra)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              Nenhuma quadra disponível no momento.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  subText: { fontSize: 16, color: "#666" },
  logoutBtn: { padding: 8 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333", flex: 1 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 4, fontWeight: "bold", color: "#555" },
  cardSport: { fontSize: 14, color: "#777", marginBottom: 10 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  cardDistance: { fontSize: 14, color: "#666" },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: "#2E7D32" },
});
