import { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HistoricoPraticanteScreen() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [quadraSelecionada, setQuadraSelecionada] = useState<string | null>(
    null,
  );
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const historico = [
    {
      id: "1",
      data: "12/03/2026",
      quadra: "Arena Sports Curitiba",
      esporte: "Futebol Society",
      status: "Concluída",
    },
    {
      id: "2",
      data: "05/03/2026",
      quadra: "Clube do Vôlei",
      esporte: "Vôlei de Areia",
      status: "Concluída",
    },
    {
      id: "3",
      data: "28/02/2026",
      quadra: "Arena Sports Curitiba",
      esporte: "Futebol Society",
      status: "Cancelada",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu Histórico (UC007)</Text>

      <FlatList
        data={historico}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.status === "Cancelada" && styles.cardCancelada,
            ]}
          >
            <View style={styles.linhaTopo}>
              <Text style={styles.data}>{item.data}</Text>
              <Text
                style={[
                  styles.status,
                  item.status === "Cancelada"
                    ? styles.txtCancelado
                    : styles.txtConcluida,
                ]}
              >
                {item.status}
              </Text>
            </View>
            <Text style={styles.quadra}>{item.quadra}</Text>
            <Text style={styles.esporte}>{item.esporte}</Text>

            {item.status === "Concluída" && (
              <TouchableOpacity
                style={styles.btnAvaliar}
                onPress={() => {
                  setQuadraSelecionada(item.quadra);
                  setNota(0);
                  setComentario("");
                  setModalVisivel(true);
                }}
              >
                <Text style={styles.txtBtn}>⭐ Avaliar Local (UC011)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Modal de Avaliação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Avaliar {quadraSelecionada}</Text>
            <Text style={styles.modalSubtitle}>Como foi sua experiência?</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNota(star)}>
                  <Text
                    style={
                      star <= nota ? styles.starSelected : styles.starUnselected
                    }
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Deixe um comentário (opcional)"
              placeholderTextColor="#999"
              multiline
              value={comentario}
              onChangeText={setComentario}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonSubmit}
                onPress={() => {
                  Alert.alert("Sucesso", "Avaliação enviada com sucesso!");
                  setModalVisivel(false);
                }}
              >
                <Text style={styles.modalButtonTextSubmit}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cardCancelada: { borderLeftColor: "#d32f2f", opacity: 0.8 },
  linhaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  data: { fontSize: 16, fontWeight: "bold" },
  status: { fontSize: 14, fontWeight: "bold" },
  txtConcluida: { color: "#2E7D32" },
  txtCancelado: { color: "#d32f2f" },
  quadra: { fontSize: 18, color: "#333", marginBottom: 5 },
  esporte: { fontSize: 14, color: "#666", marginBottom: 15 },
  btnAvaliar: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#fff3e0",
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffa000",
  },
  txtBtn: { color: "#f57c00", fontWeight: "bold" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "center",
  },
  starUnselected: { fontSize: 40, color: "#ccc", marginHorizontal: 5 },
  starSelected: { fontSize: 40, color: "#ffa000", marginHorizontal: 5 },
  modalInput: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlignVertical: "top",
    minHeight: 80,
    marginBottom: 20,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  modalButtonTextCancel: { color: "#333", fontWeight: "bold" },
  modalButtonSubmit: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  modalButtonTextSubmit: { color: "#fff", fontWeight: "bold" },
});
