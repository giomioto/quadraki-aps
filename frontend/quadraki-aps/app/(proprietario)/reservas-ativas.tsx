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

export default function ReservasAtivasScreen() {
  const { profile } = useUserProfile("proprietario");
  const idProprietarioActive = profile.id_proprietario;

  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadReservas() {
    try {
      setLoading(true);
      
      // 1. Busca as quadras deste proprietário
      const courts = await apiFetch<any[]>(`quadras/?id_proprietario=${idProprietarioActive}`);
      const courtIds = courts.map(c => c.id_quadra);
      
      if (courtIds.length === 0) {
        setReservas([]);
        return;
      }
      const courtMap = new Map(courts.map(c => [c.id_quadra, c]));

      // 2. Busca os agendamentos do sistema
      const bookings = await apiFetch<any[]>("agendamentos");
      
      // Filtra apenas agendamentos de hoje, não cancelados, das quadras do proprietário
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const ownerTodayBookings = bookings.filter(
        b => courtIds.includes(b.id_quadra) && b.data_agendamento === todayStr && b.status !== "Cancelada"
      );

      if (ownerTodayBookings.length === 0) {
        setReservas([]);
        return;
      }

      // 3. Busca usuários, aluguel de equipamentos e equipamentos para mapeamento dos detalhes
      const [users, rentals, equipments] = await Promise.all([
        apiFetch<any[]>("usuarios"),
        apiFetch<any[]>("aluguel-equipamentos"),
        apiFetch<any[]>("equipamentos"),
      ]);

      const userMap = new Map(users.map(u => [u.id_usuario, u]));
      const equipMap = new Map(equipments.map(e => [e.id_equipamento, e]));

      const mapped = ownerTodayBookings.map((b) => {
        const court = courtMap.get(b.id_quadra) || {};
        const client = userMap.get(b.id_usuario) || {};
        
        const bookingRentals = rentals.filter(r => r.id_agendamento === b.id_agendamento);
        const extraText = bookingRentals
          .map((r) => {
            const eq = equipMap.get(r.id_equipamento);
            return eq ? `${r.quantidade} ${eq.descricao}` : `${r.quantidade}x Equipamento`;
          })
          .join(", ") || "Nenhum";

        let dataFmt = b.data_agendamento;
        if (b.data_agendamento) {
          const parts = b.data_agendamento.split("-");
          if (parts.length === 3) {
            dataFmt = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }

        return {
          id: String(b.id_agendamento),
          data: dataFmt,
          cliente: client.nome || "Cliente Desconhecido",
          clienteEmail: client.email || "Não informado",
          clienteCpf: client.cpf || "Não informado",
          quadra: court.nome || "Quadra não identificada",
          horario: `${b.hora_inicio} - ${b.hora_fim}`,
          extra: extraText,
          valor: b.valor || 0,
        };
      });

      setReservas(mapped);
    } catch (error) {
      console.error("Erro ao carregar reservas de hoje:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservas();
  }, [idProprietarioActive]);

  const handleCancelar = (idAgendamento: string) => {
    Alert.alert(
      "Cancelar Reserva",
      "Deseja realmente cancelar esta reserva por força maior? Esta ação não pode ser desfeita.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar Cancelamento",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`agendamentos/${idAgendamento}`, {
                method: "DELETE",
              });
              Alert.alert("Sucesso", "Reserva cancelada com sucesso!");
              loadReservas();
            } catch (error) {
              console.error("Erro ao cancelar reserva:", error);
              Alert.alert("Erro", "Falha ao cancelar reserva no servidor.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Reservas de Hoje (UC012)</Text>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#1565C0" />
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              Nenhuma reserva agendada para hoje.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.linhaTopo}>
                <Text style={styles.horario}>🕒 {item.horario}</Text>
                <Text style={styles.quadra}>🏟️ {item.quadra}</Text>
              </View>
              <Text style={styles.dataLabel}>📅 Data: {item.data}</Text>
              <Text style={styles.cliente}>👤 Cliente: {item.cliente}</Text>
              <Text style={styles.contato}>✉️ E-mail: {item.clienteEmail}</Text>
              <Text style={styles.contato}>📄 CPF: {item.clienteCpf}</Text>
              <Text style={styles.extra}>⚽ Extras: {item.extra}</Text>
              <Text style={styles.valorLabel}>
                💵 Valor Pago: R$ {parseFloat(String(item.valor)).toFixed(2).replace(".", ",")}
              </Text>

              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => handleCancelar(item.id)}
              >
                <Text style={styles.txtBtn}>
                  Cancelar Reserva por Força Maior
                </Text>
              </TouchableOpacity>
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
  horario: { fontSize: 16, fontWeight: "bold", color: "#333" },
  quadra: { fontSize: 16, color: "#666" },
  dataLabel: { fontSize: 14, color: "#555", marginBottom: 6, fontWeight: "600" },
  cliente: { fontSize: 16, color: "#333", marginBottom: 4, fontWeight: "600" },
  contato: { fontSize: 14, color: "#666", marginBottom: 3 },
  extra: { fontSize: 14, color: "#666", marginBottom: 8, fontWeight: "500" },
  valorLabel: { fontSize: 16, color: "#2E7D32", fontWeight: "bold", marginBottom: 12 },
  btnCancelar: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 5,
  },
  txtBtn: { color: "#d32f2f", fontWeight: "bold" },
});
