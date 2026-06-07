import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { apiFetch } from "../../services/api";
import { useUserProfile } from "../../context/user-profiles-context";

export default function MinhasReservasScreen() {
  const { profile } = useUserProfile("praticante");
  const idUsuarioLogado = profile.id_usuario;

  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadReservas() {
    if (!idUsuarioLogado) {
      setReservas([]);
      setLoading(false);
      return;
    }
    try {
      const [agendamentos, quadras, rentals, equipments] = await Promise.all([
        apiFetch<any[]>(`agendamentos/?id_usuario=${idUsuarioLogado}`),
        apiFetch<any[]>("quadras"),
        apiFetch<any[]>("aluguel-equipamentos"),
        apiFetch<any[]>("equipamentos"),
      ]);

      const quadraMap = new Map(quadras.map((q) => [q.id_quadra, q]));
      const equipMap = new Map(equipments.map((e) => [e.id_equipamento, e]));

      const mapped = agendamentos
        .filter((ag) => ag.status !== "Cancelada")
        .map((ag) => {
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

          const bookingRentals = rentals.filter((r) => r.id_agendamento === ag.id_agendamento);
          const extraText = bookingRentals
            .map((r) => {
              const eq = equipMap.get(r.id_equipamento);
              return eq ? `${r.quantidade} ${eq.descricao}` : `${r.quantidade}x Equipamento`;
            })
            .join(", ") || "Nenhum";

          return {
            id: String(ag.id_agendamento),
            data: dataFmt,
            horario: `${ag.hora_inicio} - ${ag.hora_fim}`,
            quadra: quadra.nome || "Quadra não identificada",
            esporte: quadra.esporte || "Esporte",
            status: isPast ? "Concluída" : "Ativa",
            isPast,
            extra: extraText,
            valor: ag.valor || 0,
          };
        });

      // Mostra as reservas mais recentes no topo
      setReservas(mapped.reverse());
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservas();
  }, [idUsuarioLogado]);

  const handleCancelar = (idAgendamento: string) => {
    Alert.alert(
      "Cancelar Reserva",
      "Deseja realmente cancelar esta reserva?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar Cancelamento",
          style: "destructive",
          onPress: async () => {
            try {
              // Também podemos deletar pagamentos e aluguel de equipamentos relacionados no banco,
              // mas como estão configurados com ON DELETE / DO NOTHING ou cascade dependendo do DB,
              // o Django irá deletar em cascata se configurado ou a constraint cuidará disso.
              // Vamos deletar o agendamento direto.
              await apiFetch(`agendamentos/${idAgendamento}`, {
                method: "DELETE",
              });
              Alert.alert("Sucesso", "Reserva cancelada com sucesso!");
              loadReservas();
            } catch (err) {
              Alert.alert("Erro", "Falha ao cancelar reserva no servidor.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Reservas</Text>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              Você não possui reservas ativas.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, item.isPast && styles.cardRealizada]}>
              <View style={styles.linhaTopo}>
                <Text style={styles.dataHorario}>
                  {item.data} às {item.horario}
                </Text>
                <Text style={[styles.status, item.isPast && styles.statusRealizada]}>{item.status}</Text>
              </View>
              <Text style={styles.quadra}>{item.quadra}</Text>
              <Text style={styles.esporte}>{item.esporte}</Text>
              <Text style={styles.extra}>⚽ Extras: {item.extra}</Text>
              <Text style={styles.valorTotal}>💵 Valor Total: R$ {parseFloat(String(item.valor)).toFixed(2).replace(".", ",")}</Text>

              {!item.isPast ? (
                <TouchableOpacity
                  style={styles.btnAcao}
                  onPress={() => handleCancelar(item.id)}
                >
                  <Text style={styles.txtBtn}>Cancelar Reserva</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.infoRealizada}>
                  <Text style={styles.txtRealizada}>✓ Concluída (Avaliação disponível no Histórico)</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
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
  esporte: { fontSize: 14, color: "#666", marginBottom: 6 },
  extra: { fontSize: 14, color: "#666", marginBottom: 4, fontWeight: "500" },
  valorTotal: { fontSize: 16, color: "#2E7D32", fontWeight: "bold", marginBottom: 10 },
  btnAcao: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 5,
  },
  txtBtn: { color: "#d32f2f", fontWeight: "bold" },
  cardRealizada: {
    borderLeftColor: "#777",
    backgroundColor: "#fafafa",
  },
  statusRealizada: {
    color: "#777",
  },
  infoRealizada: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  txtRealizada: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
});

