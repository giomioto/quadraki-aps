import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MenuProprietarioScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, Proprietário!</Text>
          <Text style={styles.subText}>Painel de Controle</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => { router.dismissAll(); router.replace("/"); }}>
          <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Hoje (Baseado em Reservas)</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Ionicons name="calendar-outline" size={24} color="#bbdefb" />
          <Text style={styles.metricValue}>8</Text>
          <Text style={styles.metricLabel}>Reservas</Text>
        </View>
        <View style={styles.metricCardSecondary}>
          <Ionicons name="cash-outline" size={24} color="#C8E6C9" />
          <Text style={styles.metricValueSecondary}>R$ 640</Text>
          <Text style={styles.metricLabelSecondary}>Receita</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="tennisball-outline" size={24} color="#bbdefb" />
          <Text style={styles.metricValue}>3</Text>
          <Text style={styles.metricLabel}>Quadras Uso</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mês Atual</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricCardMonth}>
          <Ionicons name="stats-chart-outline" size={24} color="#FFCC80" />
          <Text style={styles.metricValueMonth}>145</Text>
          <Text style={styles.metricLabelMonth}>Reservas Totais</Text>
        </View>
        <View style={styles.metricCardMonth}>
          <Ionicons name="wallet-outline" size={24} color="#FFCC80" />
          <Text style={styles.metricValueMonth}>R$ 11.6k</Text>
          <Text style={styles.metricLabelMonth}>Receita Bruta</Text>
        </View>
        <View style={styles.metricCardMonth}>
          <Ionicons name="close-circle-outline" size={24} color="#FFCC80" />
          <Text style={styles.metricValueMonth}>5</Text>
          <Text style={styles.metricLabelMonth}>Canceladas</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Relatórios do Sistema</Text>
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Quadra + Alugada (Top 1):</Text>
          <Text style={styles.analyticsValue}>Society Principal</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Receita Futura (Próx. 7 dias):</Text>
          <Text style={styles.analyticsValueGood}>R$ 1.250</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Média de Avaliações (1 a 5):</Text>
          <Text style={styles.analyticsValue}>4.8 / 5.0</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsText}>Total de Quadras Cadastradas:</Text>
          <Text style={styles.analyticsValue}>4</Text>
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
