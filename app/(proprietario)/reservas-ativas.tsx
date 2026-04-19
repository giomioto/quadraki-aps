import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReservasAtivasScreen() {
  const reservas = [
    {
      id: "1",
      cliente: "João Silva",
      quadra: "Society 1",
      horario: "19:00 - 20:00",
      extra: "2 Bolas, 10 Coletes",
    },
    {
      id: "2",
      cliente: "Maria Pereira",
      quadra: "Tênis Saibro",
      horario: "21:00 - 22:00",
      extra: "Nenhum",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Reservas de Hoje (UC012)</Text>

      <FlatList
        data={reservas}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.linhaTopo}>
              <Text style={styles.horario}>{item.horario}</Text>
              <Text style={styles.quadra}>{item.quadra}</Text>
            </View>
            <Text style={styles.cliente}>👤 {item.cliente}</Text>
            <Text style={styles.extra}>⚽ Extras: {item.extra}</Text>

            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() =>
                Alert.alert("Atenção", "Cancelar reserva. Confirmar?")
              }
            >
              <Text style={styles.txtBtn}>
                Cancelar Reserva por Força Maior
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    paddingTop: 60,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1565C0",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#1565C0",
  },
  linhaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  horario: { fontSize: 16, fontWeight: "bold" },
  quadra: { fontSize: 16, color: "#666" },
  cliente: { fontSize: 18, color: "#333", marginBottom: 5 },
  extra: { fontSize: 14, color: "#888", marginBottom: 15 },
  btnCancelar: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 5,
  },
  txtBtn: { color: "#d32f2f", fontWeight: "bold" },
});
