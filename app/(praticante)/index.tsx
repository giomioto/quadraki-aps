import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const QUADRAS_MOCK = [
  {
    id: "1",
    nome: "Arena Futebol 7",
    esporte: "Futebol Society",
    distancia: "1.2 km",
    preco: "R$ 150,00/h",
    avaliacao: 4.8,
  },
  {
    id: "2",
    nome: "Smash Padel & Tênis",
    esporte: "Padel e Tênis",
    distancia: "2.5 km",
    preco: "R$ 120,00/h",
    avaliacao: 4.9,
  },
  {
    id: "3",
    nome: "Poliesportiva Central",
    esporte: "Futsal / Basquete",
    distancia: "3.1 km",
    preco: "R$ 80,00/h",
    avaliacao: 4.5,
  },
  {
    id: "4",
    nome: "Beach Sports Areia",
    esporte: "Beach Tennis",
    distancia: "4.0 km",
    preco: "R$ 100,00/h",
    avaliacao: 4.7,
  },
  {
    id: "5",
    nome: "Clube do Vôlei",
    esporte: "Voleibol",
    distancia: "5.5 km",
    preco: "R$ 90,00/h",
    avaliacao: 4.6,
  },
];

export default function MenuPraticanteScreen() {
  const renderItem = ({ item }: { item: (typeof QUADRAS_MOCK)[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/reserva",
          params: {
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            horario: "19:00",
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.avaliacao}</Text>
        </View>
      </View>
      <Text style={styles.cardSport}>{item.esporte}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDistance}>
          <Ionicons name="location-outline" size={14} color="#666" />{" "}
          {item.distancia}
        </Text>
        <Text style={styles.cardPrice}>{item.preco}</Text>
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
            router.dismissAll();
            router.replace("/");
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={QUADRAS_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
