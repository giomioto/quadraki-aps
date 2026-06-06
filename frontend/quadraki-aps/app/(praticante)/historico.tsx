import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { apiFetch } from "../../services/api";
import { useUserProfile } from "../../context/user-profiles-context";

export default function HistoricoPraticanteScreen() {
  const { profile } = useUserProfile("praticante");
  const idUsuarioLogado = profile.id_usuario;

  const [modalVisivel, setModalVisivel] = useState(false);
  const [quadraSelecionada, setQuadraSelecionada] = useState<string | null>(null);
  const [selectedQuadraId, setSelectedQuadraId] = useState<number | null>(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadHistorico() {
    try {
      const [agendamentos, quadras, rentals, equipments] = await Promise.all([
        apiFetch<any[]>(`agendamentos/?id_usuario=${idUsuarioLogado}`),
        apiFetch<any[]>("quadras"),
        apiFetch<any[]>("aluguel-equipamentos"),
        apiFetch<any[]>("equipamentos"),
      ]);

      const quadraMap = new Map(quadras.map(q => [q.id_quadra, q]));
      const equipMap = new Map(equipments.map(e => [e.id_equipamento, e]));
      
      const mapped = agendamentos.map((ag) => {
        const quadra = quadraMap.get(ag.id_quadra) || {};
        let dataFmt = ag.data_agendamento;
        if (ag.data_agendamento) {
          const parts = ag.data_agendamento.split("-");
          if (parts.length === 3) {
            dataFmt = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
        let isPast = false;
        if (ag.data_agendamento) {
          const startTime = ag.hora_inicio || "00:00";
          const bookingDate = new Date(`${ag.data_agendamento}T${startTime}:00`);
          isPast = bookingDate < new Date();
        }

        let displayStatus = ag.status;
        if (displayStatus !== "Cancelada") {
          displayStatus = isPast ? "Concluída" : "Ativa";
        }

        const bookingRentals = rentals.filter((r) => r.id_agendamento === ag.id_agendamento);
        const extraText = bookingRentals
          .map((r) => {
            const eq = equipMap.get(r.id_equipamento);
            return eq ? `${r.quantidade} ${eq.descricao}` : `${r.quantidade}x Equipamento`;
          })
          .join(", ") || "Nenhum";

        return {
          id: String(ag.id_agendamento),
          id_quadra: ag.id_quadra,
          data: dataFmt,
          quadra: quadra.nome || "Quadra não identificada",
          esporte: quadra.esporte || "Esporte",
          status: displayStatus,
          isPast,
          extra: extraText,
          valor: ag.valor || 0,
        };
      });

      setHistorico(mapped.reverse());
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistorico();
  }, [idUsuarioLogado]);

  const handleEnviarAvaliacao = async () => {
    if (nota === 0) {
      Alert.alert("Erro", "Por favor, escolha uma nota de 1 a 5 estrelas!");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      await apiFetch("avaliacoes", {
        method: "POST",
        body: JSON.stringify({
          id_usuario: idUsuarioLogado,
          id_quadra: selectedQuadraId,
          nota: nota,
          comentario: comentario.trim(),
          data_avaliacao: today,
        }),
      });

      Alert.alert("Sucesso", "Avaliação enviada com sucesso!");
      setModalVisivel(false);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      Alert.alert("Erro", "Falha ao enviar avaliação ao servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu Histórico (UC007)</Text>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              Você ainda não possui histórico de reservas.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                item.status === "Cancelada" && styles.cardCancelada,
                item.status === "Ativa" && styles.cardAtiva,
              ]}
            >
              <View style={styles.linhaTopo}>
                <Text style={styles.data}>{item.data}</Text>
                <Text
                  style={[
                    styles.status,
                    item.status === "Cancelada" && styles.txtCancelado,
                    item.status === "Concluída" && styles.txtConcluida,
                    item.status === "Ativa" && styles.txtAtiva,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <Text style={styles.quadra}>{item.quadra}</Text>
              <Text style={styles.esporte}>{item.esporte}</Text>
              <Text style={styles.info}>⚽ Extras: {item.extra}</Text>
              <Text style={styles.valorTotal}>💵 Valor Total: R$ {parseFloat(String(item.valor)).toFixed(2).replace(".", ",")}</Text>

              {item.status === "Concluída" && (
                <TouchableOpacity
                  style={styles.btnAvaliar}
                  onPress={() => {
                    setQuadraSelecionada(item.quadra);
                    setSelectedQuadraId(item.id_quadra);
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
      )}

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
                onPress={handleEnviarAvaliacao}
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
  cardAtiva: { borderLeftColor: "#1976D2" },
  linhaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  data: { fontSize: 16, fontWeight: "bold" },
  status: { fontSize: 14, fontWeight: "bold" },
  txtConcluida: { color: "#2E7D32" },
  txtCancelado: { color: "#d32f2f" },
  txtAtiva: { color: "#1976D2" },
  quadra: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 5 },
  esporte: { fontSize: 14, color: "#666", marginBottom: 6 },
  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  valorTotal: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "bold",
    marginBottom: 10,
  },
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
