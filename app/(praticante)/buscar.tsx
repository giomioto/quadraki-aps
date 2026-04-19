import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const ESPORTES_DISPONIVEIS = [
  "Futebol Society",
  "Futsal",
  "Vôlei de Areia",
  "Basquete",
  "Tênis",
  "Beach Tennis",
];

const RAIO_OPCOES = ["5 km", "10 km", "15 km", "Qualquer"];

const QUADRAS_MOCK = [
  {
    id: "1",
    nome: "Arena Sports Curitiba",
    esporte: "Futebol Society",
    distancia: "2",
    preco: "R$ 150,00",
    disponibilidade: "19:00 - 20:00",
  },
  {
    id: "2",
    nome: "Clube do Vôlei",
    esporte: "Vôlei de Areia",
    distancia: "7",
    preco: "R$ 80,00",
    disponibilidade: "20:00 - 21:00",
  },
  {
    id: "3",
    nome: "Quadra Mágica Basquete",
    esporte: "Basquete",
    distancia: "12",
    preco: "R$ 100,00",
    disponibilidade: "18:00 - 19:30",
  },
  {
    id: "4",
    nome: "Complexo de Tênis Ace",
    esporte: "Tênis",
    distancia: "4",
    preco: "R$ 120,00",
    disponibilidade: "17:00 - 18:00",
  },
  {
    id: "5",
    nome: "Beach Tennis Paradise",
    esporte: "Beach Tennis",
    distancia: "16",
    preco: "R$ 90,00",
    disponibilidade: "16:00 - 17:30",
  },
  {
    id: "6",
    nome: "Futsal Show",
    esporte: "Futsal",
    distancia: "3",
    preco: "R$ 110,00",
    disponibilidade: "21:00 - 22:00",
  }
];

export default function BuscarScreen() {
  const [esportesSelecionados, setEsportesSelecionados] = useState<string[]>([]);
  const [data, setData] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [raioSelecionado, setRaioSelecionado] = useState("Qualquer");

  const toggleEsporte = (esporte: string) => {
    setEsportesSelecionados((prev) =>
      prev.includes(esporte)
        ? prev.filter((e) => e !== esporte)
        : [...prev, esporte]
    );
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || data;
    // Ocultar modal após selecionar no Android
    setShowDatePicker(Platform.OS === 'ios' || Platform.OS === 'web');
    setData(currentDate);
  };

  // Filtragem conjunta (Esporte + Raio)
  const resultados = QUADRAS_MOCK.filter(q => {
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
      <Text style={styles.titulo}>Encontrar Quadras (UC004)</Text>

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
      {Platform.OS === 'android' && (
        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {data.toLocaleDateString("pt-BR")} 📅
          </Text>
        </TouchableOpacity>
      )}
      {(showDatePicker || Platform.OS !== 'android') && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          style={styles.datePickerNative}
          onChange={onChangeDate}
        />
      )}

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

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={<Text style={styles.emptyTxt}>Nenhuma quadra encontrada nestes filtros.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardResult}
            onPress={() =>
              router.push({
                pathname: "/reserva",
                params: {
                  id: item.id,
                  nome: item.nome,
                  preco: item.preco,
                  horario: item.disponibilidade,
                },
              })
            }
          >
            <View>
              <Text style={styles.nomeQuadra}>{item.nome}</Text>
              <Text style={styles.infoQuadra}>
                {item.esporte} • {item.distancia} km
              </Text>
              <Text style={styles.infoDisponivel}>
                Livre Hoje: {item.disponibilidade}
              </Text>
            </View>
            <View style={styles.rightCard}>
              <Text style={styles.precoQuadra}>{item.preco}/h</Text>
              <Text style={styles.agendarTxt}>Agendar</Text>
            </View>
          </TouchableOpacity>
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
  dateInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
  },
  datePickerNative: {
    marginBottom: 10,
    alignSelf: 'flex-start'
  },
  dateText: {
    color: "#333",
    fontSize: 16,
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
