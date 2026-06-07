import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { apiFetch } from "../../services/api";

const ESPORTES_DISPONIVEIS = [
  "Futebol Society",
  "Futsal",
  "Vôlei de Areia",
  "Basquete",
  "Tênis",
  "Beach Tennis",
  "Padel e Tênis",
];

const RAIO_OPCOES = ["5 km", "10 km", "15 km", "Qualquer"];

const SLOTS_HORARIOS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00"
];

const getLocalDateString = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getNext14Days = () => {
  const dates = [];
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(12, 0, 0, 0);
    dates.push({
      dateObj: d,
      dayName: i === 0 ? "Hoje" : daysOfWeek[d.getDay()],
      dayNum: d.getDate().toString().padStart(2, "0"),
      monthName: months[d.getMonth()],
      formatted: getLocalDateString(d),
    });
  }
  return dates;
};

export default function BuscarScreen() {
  const [quadras, setQuadras] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [esportesSelecionados, setEsportesSelecionados] = useState<string[]>([]);
  const [data, setData] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [raioSelecionado, setRaioSelecionado] = useState("Qualquer");

  useEffect(() => {
    async function loadQuadrasEAgendamentos() {
      try {
        const [resQuadras, resAgendamentos] = await Promise.all([
          apiFetch<any[]>("quadras"),
          apiFetch<any[]>("agendamentos"),
        ]);
        setQuadras(resQuadras);
        setAgendamentos(resAgendamentos);
      } catch (error) {
        console.error("Erro ao carregar quadras na busca:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuadrasEAgendamentos();
  }, []);

  const toggleEsporte = (esporte: string) => {
    setEsportesSelecionados((prev) =>
      prev.includes(esporte)
        ? prev.filter((e) => e !== esporte)
        : [...prev, esporte]
    );
  };

  // Filtragem conjunta (Esporte + Raio) com dados do backend
  const resultados = quadras.map((q) => {
    // Gera uma distância determinística baseada no ID
    const distNum = (q.id_quadra * 3.7) % 14 + 1;

    // Filtra os horários livres reais no dia selecionado
    const formattedDate = getLocalDateString(data);
    const courtBookings = agendamentos.filter(
      (b) => b.id_quadra === q.id_quadra && b.data_agendamento === formattedDate && b.status !== "Cancelada"
    );
    const bookedSlots = courtBookings.map((b) => `${b.hora_inicio} - ${b.hora_fim}`);

    const isToday = formattedDate === getLocalDateString(new Date());
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const availableSlots = SLOTS_HORARIOS.filter((slot) => {
      if (bookedSlots.includes(slot)) return false;
      if (isToday) {
        const [horaInicio] = slot.split(" - ");
        const [h, m] = horaInicio.split(":").map(Number);
        if (h < currentHour) return false;
        if (h === currentHour && m < currentMinute) return false;
      }
      return true;
    });

    return {
      id: String(q.id_quadra),
      nome: q.nome,
      esporte: q.esporte,
      distancia: distNum.toFixed(1),
      preco: `R$ ${parseFloat(q.valor).toFixed(2).replace(".", ",")}`,
      disponibilidade: availableSlots,
    };
  }).filter(q => {
    // Filtro Esporte
    if (esportesSelecionados.length > 0 && !esportesSelecionados.includes(q.esporte)) {
      return false;
    }
    // Filtro Raio
    if (raioSelecionado !== "Qualquer") {
      const qDistancia = parseFloat(q.distancia);
      const limiteKm = parseFloat(raioSelecionado.replace(" km", ""));
      if (qDistancia > limiteKm) return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Encontrar Quadras</Text>

      <Text style={styles.label}>Esportes de interesse:</Text>
      <View style={styles.esportesContainer}>
        {ESPORTES_DISPONIVEIS.map((esporte) => {
          const isSelected = esportesSelecionados.includes(esporte);
          return (
            <TouchableOpacity
              key={esporte}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleEsporte(esporte)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {esporte}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <Text style={styles.label}>Data da reserva:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {getNext14Days().map((item) => {
          const isSelected = data.toDateString() === item.dateObj.toDateString();
          return (
            <TouchableOpacity
              key={item.formatted}
              style={[
                styles.dateCard,
                isSelected && styles.dateCardSelected,
              ]}
              onPress={() => setData(item.dateObj)}
            >
              <Text style={[styles.dateCardDayName, isSelected && styles.dateCardTextSelected]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dateCardDayNum, isSelected && styles.dateCardTextSelected]}>
                {item.dayNum}
              </Text>
              <Text style={[styles.dateCardMonth, isSelected && styles.dateCardTextSelected]}>
                {item.monthName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.labelMargin}>Distância máxima (Raio):</Text>
      <View style={styles.raioContainer}>
        {RAIO_OPCOES.map((raio) => (
          <TouchableOpacity
            key={raio}
            style={[styles.raioBtn, raioSelecionado === raio && styles.raioBtnAtivo]}
            onPress={() => setRaioSelecionado(raio)}
          >
            <Text style={[styles.raioTxt, raioSelecionado === raio && styles.raioTxtAtivo]}>
              {raio}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={<Text style={styles.emptyTxt}>Nenhuma quadra encontrada nestes filtros.</Text>}
          renderItem={({ item }) => {
            const hasAvailable = item.disponibilidade.length > 0;
            const displaySchedules = hasAvailable
              ? item.disponibilidade.map((s: string) => s.split(" - ")[0]).join(", ")
              : "Sem horários";

            return (
              <TouchableOpacity
                style={styles.cardResult}
                onPress={() =>
                  router.push({
                    pathname: "/reserva",
                    params: {
                      id: item.id,
                      nome: item.nome,
                      preco: item.preco,
                      horario: hasAvailable ? item.disponibilidade[0] : "19:00 - 20:00",
                      data: getLocalDateString(data),
                    },
                  })
                }
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.nomeQuadra}>{item.nome}</Text>
                  <Text style={styles.infoQuadra}>
                    {item.esporte} • {item.distancia} km
                  </Text>
                  <Text style={[styles.infoDisponivel, !hasAvailable && { color: "#d32f2f" }]}>
                    Disponíveis: {displaySchedules}
                  </Text>
                </View>
                <View style={styles.rightCard}>
                  <Text style={styles.precoQuadra}>{item.preco}/h</Text>
                  <Text style={styles.agendarTxt}>Agendar</Text>
                </View>
              </TouchableOpacity>
            );
          }}
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
  titulo: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", color: "#444", marginBottom: 10 },
  labelMargin: { fontSize: 16, fontWeight: "bold", color: "#444", marginTop: 15, marginBottom: 10 },
  esportesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  chip: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#2E7D32",
  },
  chipText: {
    color: "#333",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  datesContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  dateCard: {
    width: 65,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateCardSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  dateCardDayName: {
    fontSize: 10,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 2,
  },
  dateCardDayNum: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  dateCardMonth: {
    fontSize: 9,
    color: "#666",
    fontWeight: "500",
  },
  dateCardTextSelected: {
    color: "#fff",
  },
  raioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  raioBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  raioBtnAtivo: {
    backgroundColor: "#f57c00",
  },
  raioTxt: {
    color: "#444",
    fontWeight: "bold",
  },
  raioTxtAtivo: {
    color: "#fff",
  },
  listPadding: {
    paddingBottom: 20,
  },
  emptyTxt: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontStyle: "italic",
  },
  cardResult: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#2E7D32",
    elevation: 2,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nomeQuadra: { fontSize: 18, fontWeight: "bold", color: "#333" },
  infoQuadra: { fontSize: 14, color: "#666", marginTop: 4 },
  infoDisponivel: {
    fontSize: 14,
    color: "#f57c00",
    fontWeight: "bold",
    marginTop: 4,
  },
  rightCard: {
    alignItems: "flex-end",
  },
  precoQuadra: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  agendarTxt: {
    color: "#2E7D32",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
