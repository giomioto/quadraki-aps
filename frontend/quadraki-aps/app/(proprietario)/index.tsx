import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import { useUserProfile } from "../../context/user-profiles-context";

export default function MenuProprietarioScreen() {
  const { profile, logout } = useUserProfile("proprietario");
  const idProprietarioActive = profile.id_proprietario;

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    todayReservas: 0,
    todayReceita: 0,
    todayQuadrasUso: 0,
    monthReservas: 0,
    monthReceita: 0,
    monthCanceladas: 0,
    topQuadra: "Nenhuma",
    receitaFutura: 0,
    mediaAvaliacoes: 5.0,
    totalQuadras: 0,
  });

  async function loadMetrics() {
    if (!idProprietarioActive) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // 1. Busca as quadras deste proprietário
      const courts = await apiFetch<any[]>(`quadras/?id_proprietario=${idProprietarioActive}`);
      const courtIds = courts.map(c => c.id_quadra);
      
      if (courtIds.length === 0) {
        setMetrics({
          todayReservas: 0,
          todayReceita: 0,
          todayQuadrasUso: 0,
          monthReservas: 0,
          monthReceita: 0,
          monthCanceladas: 0,
          topQuadra: "Nenhuma",
          receitaFutura: 0,
          mediaAvaliacoes: 5.0,
          totalQuadras: 0,
        });
        return;
      }

      // 2. Busca os agendamentos do sistema
      const bookings = await apiFetch<any[]>("agendamentos");
      
      // Filtra apenas os agendamentos vinculados às quadras deste proprietário
      const ownerBookings = bookings.filter(b => courtIds.includes(b.id_quadra));

      // Filtra apenas os agendamentos que não estão cancelados para as estatísticas ativas
      const activeBookings = ownerBookings.filter(b => b.status !== "Cancelada");

      // 3. Efetua os cálculos
      const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM
      
      const todayBookings = activeBookings.filter(b => b.data_agendamento === todayStr);
      const todayReceita = todayBookings.reduce((sum, b) => sum + parseFloat(b.valor), 0);
      const todayQuadrasUso = new Set(todayBookings.map(b => b.id_quadra)).size;

      const monthBookings = activeBookings.filter(b => b.data_agendamento && b.data_agendamento.startsWith(currentYearMonth));
      const monthReceita = monthBookings.reduce((sum, b) => sum + parseFloat(b.valor), 0);

      // Quantidade de reservas canceladas no mês atual
      const monthCanceladas = ownerBookings.filter(
        b => b.status === "Cancelada" && b.data_agendamento && b.data_agendamento.startsWith(currentYearMonth)
      ).length;

      // Descobre a quadra mais alugada (baseada em agendamentos ativos/concluídos)
      const courtBookingCounts: Record<number, number> = {};
      activeBookings.forEach(b => {
        courtBookingCounts[b.id_quadra] = (courtBookingCounts[b.id_quadra] || 0) + 1;
      });
      let topCourtId = -1;
      let maxBookings = 0;
      Object.entries(courtBookingCounts).forEach(([cId, count]) => {
        if (count > maxBookings) {
          maxBookings = count;
          topCourtId = parseInt(cId, 10);
        }
      });
      const topCourtName = courts.find(c => c.id_quadra === topCourtId)?.nome || "Nenhuma";

      // Receita futura (próximos 7 dias)
      const todayDateObj = new Date(todayStr);
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(todayDateObj.getDate() + 7);
      
      const futureBookings = activeBookings.filter(b => {
        if (!b.data_agendamento) return false;
        const bDate = new Date(b.data_agendamento);
        return bDate > todayDateObj && bDate <= sevenDaysLater;
      });
      const receitaFutura = futureBookings.reduce((sum, b) => sum + parseFloat(b.valor), 0);

      // Média de avaliações das quadras do proprietário
      const evals = await apiFetch<any[]>("avaliacoes");
      const ownerEvals = evals.filter(ev => courtIds.includes(ev.id_quadra));
      const media = ownerEvals.length > 0
        ? ownerEvals.reduce((sum, ev) => sum + ev.nota, 0) / ownerEvals.length
        : 4.8; // padrão se sem avaliações

      setMetrics({
        todayReservas: todayBookings.length,
        todayReceita,
        todayQuadrasUso,
        monthReservas: monthBookings.length,
        monthReceita,
        monthCanceladas,
        topQuadra: topCourtName,
        receitaFutura,
        mediaAvaliacoes: parseFloat(media.toFixed(1)),
        totalQuadras: courts.length,
      });
    } catch (error) {
      console.error("Erro ao carregar métricas do proprietário:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, [idProprietarioActive]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9" }}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, {profile.name}!</Text>
          <Text style={styles.subText}>Painel de Controle</Text>
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

      <Text style={styles.sectionTitle}>Hoje (Baseado em Reservas)</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Ionicons name="calendar-outline" size={24} color="#bbdefb" />
          <Text style={styles.metricValue}>{metrics.todayReservas}</Text>
          <Text style={styles.metricLabel}>Reservas</Text>
        </View>
        <View style={styles.metricCardSecondary}>
          <Ionicons name="cash-outline" size={24} color="#C8E6C9" />
          <Text style={styles.metricValueSecondary}>R$ {metrics.todayReceita.toFixed(0)}</Text>
          <Text style={styles.metricLabelSecondary}>Receita</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="tennisball-outline" size={24} color="#bbdefb" />
          <Text style={styles.metricValue}>{metrics.todayQuadrasUso}</Text>
          <Text style={styles.metricLabel}>Quadras Uso</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mês Atual</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricCardMonth}>
          <Ionicons name="stats-chart-outline" size={24} color="#FFCC80" />
          <Text style={styles.metricValueMonth}>{metrics.monthReservas}</Text>
          <Text style={styles.metricLabelMonth}>Reservas Totais</Text>
        </View>
        <View style={styles.metricCardMonth}>
          <Ionicons name="wallet-outline" size={24} color="#FFCC80" />
          <Text style={styles.metricValueMonth}>R$ {(metrics.monthReceita / 1000).toFixed(1)}k</Text>
          <Text style={styles.metricLabelMonth}>Receita Bruta</Text>
        </View>
        <View style={styles.metricCardMonth}>
          <Ionicons name="close-circle-outline" size={24} color="#FFCC80" />
          <Text style={styles.metricValueMonth}>{metrics.monthCanceladas}</Text>
          <Text style={styles.metricLabelMonth}>Canceladas</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Relatórios do Sistema</Text>
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Quadra + Alugada (Top 1):</Text>
          <Text style={styles.analyticsValue}>{metrics.topQuadra}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Receita Futura (Próx. 7 dias):</Text>
          <Text style={styles.analyticsValueGood}>R$ {metrics.receitaFutura.toFixed(0)}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Média de Avaliações (1 a 5):</Text>
          <Text style={styles.analyticsValue}>{metrics.mediaAvaliacoes.toFixed(1)} / 5.0</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Total de Quadras Cadastradas:</Text>
          <Text style={styles.analyticsValue}>{metrics.totalQuadras}</Text>
        </View>
      </View>

      <View style={styles.marginBottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: 60,
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  welcomeText: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#1565C0", 
    marginBottom: 5 
  },
  subText: { 
    fontSize: 16, 
    color: "#666" 
  },
  logoutBtn: { 
    padding: 8 
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  metricCard: {
    backgroundColor: "#1565C0",
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 20,
    paddingHorizontal: 5,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  metricCardSecondary: {
    backgroundColor: "#2E7D32",
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 20,
    paddingHorizontal: 5,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  metricCardMonth: {
    backgroundColor: "#E65100",
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 20,
    paddingHorizontal: 5,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  metricValue: { fontSize: 20, fontWeight: "bold", color: "#fff", marginTop: 8 },
  metricLabel: { fontSize: 12, color: "#bbdefb", marginTop: 4, textAlign: "center" },
  metricValueSecondary: { fontSize: 18, fontWeight: "bold", color: "#fff", marginTop: 8 },
  metricLabelSecondary: { fontSize: 12, color: "#C8E6C9", marginTop: 4, textAlign: "center" },
  metricValueMonth: { fontSize: 18, fontWeight: "bold", color: "#fff", marginTop: 8 },
  metricLabelMonth: { fontSize: 12, color: "#FFE0B2", marginTop: 4, textAlign: "center" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  analyticsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  analyticsText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1565C0",
    textAlign: "right",
  },
  analyticsValueGood: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "right",
  },
  marginBottomSpacer: {
    height: 40,
  }
});
