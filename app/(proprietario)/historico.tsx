import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HistoricoProprietarioScreen() {
  const historico = [
    {
      id: "1",
      data: "10/05/2026",
      quadra: "Quadra Society 1",
      valor: "R$ 150,00",
      status: "Concluído",
    },
    {
      id: "2",
      data: "10/05/2026",
      quadra: "Quadra Poliesportiva",
      valor: "R$ 120,00",
      status: "Cancelado",
    },
    {
      id: "3",
      data: "09/05/2026",
      quadra: "Quadra Society 2",
      valor: "R$ 180,00",
      status: "Concluído",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Histórico de Reservas (UC007)</Text>

      {historico.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.quadra}>{item.quadra}</Text>
          <Text style={styles.info}>Data: {item.data}</Text>
          <Text style={styles.info}>Valor: {item.valor}</Text>
          <Text
            style={[
              styles.status,
              item.status === "Concluído"
                ? styles.statusConcluido
                : styles.statusCancelado,
            ]}
          >
            {item.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
    paddingTop: 60,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1565C0",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
  },
  quadra: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  statusConcluido: {
    color: "#2E7D32",
  },
  statusCancelado: {
    color: "#d32f2f",
  },
});

