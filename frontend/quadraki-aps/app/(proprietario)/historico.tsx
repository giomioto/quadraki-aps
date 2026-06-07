import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { apiFetch } from "../../services/api";
import { useUserProfile } from "../../context/user-profiles-context";

export default function HistoricoProprietarioScreen() {
  const { profile } = useUserProfile("proprietario");
  const idProprietarioActive = profile.id_proprietario;

  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState<any[]>([]);

  async function loadHistorico() {
    if (!idProprietarioActive) {
      setHistorico([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      
      // 1. Busca as quadras deste proprietário
      const courts = await apiFetch<any[]>(`quadras/?id_proprietario=${idProprietarioActive}`);
      const courtIds = courts.map(c => c.id_quadra);
      
      if (courtIds.length === 0) {
        setHistorico([]);
        return;
      }
      const courtMap = new Map(courts.map(c => [c.id_quadra, c]));

      // 2. Busca os agendamentos do sistema
      const [bookings, rentals, equipments] = await Promise.all([
        apiFetch<any[]>("agendamentos"),
        apiFetch<any[]>("aluguel-equipamentos"),
        apiFetch<any[]>("equipamentos"),
      ]);
      const equipMap = new Map(equipments.map(e => [e.id_equipamento, e]));
      
      // Filtra agendamentos das quadras do proprietário
      const ownerBookings = bookings.filter(b => courtIds.includes(b.id_quadra));

      const mapped = ownerBookings.map((b) => {
        const court = courtMap.get(b.id_quadra) || {};
        
        // Formata data
        let dataFmt = b.data_agendamento;
        if (b.data_agendamento) {
          const parts = b.data_agendamento.split("-");
          if (parts.length === 3) {
            dataFmt = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }

        let isPast = false;
        if (b.data_agendamento) {
          const startTime = b.hora_inicio || "00:00";
          const bookingDate = new Date(`${b.data_agendamento}T${startTime}:00`);
          isPast = bookingDate < new Date();
        }

        let displayStatus = "Concluído";
        if (b.status === "Cancelada") {
          displayStatus = "Cancelado";
        } else if (!isPast) {
          displayStatus = "Agendado";
        }

        const bookingRentals = rentals.filter((r) => r.id_agendamento === b.id_agendamento);
        const extraText = bookingRentals
          .map((r) => {
            const eq = equipMap.get(r.id_equipamento);
            return eq ? `${r.quantidade} ${eq.descricao}` : `${r.quantidade}x Equipamento`;
          })
          .join(", ") || "Nenhum";

        return {
          id: String(b.id_agendamento),
          data: dataFmt,
          quadra: court.nome || "Quadra não identificada",
          valor: `R$ ${parseFloat(b.valor).toFixed(2).replace(".", ",")}`,
          status: displayStatus,
          extra: extraText,
        };
      });

      // Mostra os agendamentos mais recentes primeiro
      setHistorico(mapped.reverse());
    } catch (error) {
      console.error("Erro ao carregar histórico do proprietário:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistorico();
  }, [idProprietarioActive]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.titulo}>Histórico de Reservas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 20 }} />
      ) : historico.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
          Nenhuma reserva registrada no histórico.
        </Text>
      ) : (
        historico.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.quadra}>{item.quadra}</Text>
            <Text style={styles.info}>📅 Data: {item.data}</Text>
            <Text style={styles.info}>⚽ Extras: {item.extra}</Text>
            <Text style={styles.info}>💵 Valor: {item.valor}</Text>
            <Text
              style={[
                styles.status,
                item.status === "Concluído" && styles.statusConcluido,
                item.status === "Cancelado" && styles.statusCancelado,
                item.status === "Agendado" && styles.statusAgendado,
              ]}
            >
              {item.status}
            </Text>
          </View>
        ))
      )}
      <View style={{ height: 40 }} />
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
  statusAgendado: {
    color: "#1976D2",
  },
});
