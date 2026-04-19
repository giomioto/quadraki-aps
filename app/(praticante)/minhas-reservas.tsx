import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MinhasReservasScreen() {
  const reservas = [
    {
      id: "1",
      data: "19/04/2026",
      horario: "19:00 - 20:00",
      quadra: "Arena Sports Curitiba",
      esporte: "Futebol Society",
      status: "Confirmada",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Reservas</Text>

      <FlatList
        data={reservas}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.linhaTopo}>
              <Text style={styles.dataHorario}>
                {item.data} às {item.horario}
              </Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.quadra}>{item.quadra}</Text>
            <Text style={styles.esporte}>{item.esporte}</Text>

            <TouchableOpacity
              style={styles.btnAcao}
              onPress={() =>
                Alert.alert("Cancelar", "Deseja cancelar esta reserva?")
              }
            >
              <Text style={styles.txtBtn}>Cancelar Reserva</Text>
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
    color: "#2E7D32",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  linhaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dataHorario: { fontSize: 16, fontWeight: "bold" },
  status: { fontSize: 14, fontWeight: "bold", color: "#2E7D32" },
  quadra: { fontSize: 18, color: "#333", marginBottom: 5 },
  esporte: { fontSize: 14, color: "#666", marginBottom: 15 },
  btnAcao: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 5,
  },
  txtBtn: { color: "#d32f2f", fontWeight: "bold" },
});

