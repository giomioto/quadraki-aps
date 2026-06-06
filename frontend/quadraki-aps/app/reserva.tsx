import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiFetch } from "../services/api";
import { useUserProfile } from "../context/user-profiles-context";

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

export default function ReservaScreen() {
  const { id, nome, preco, horario, data } = useLocalSearchParams();
  const { profile } = useUserProfile("praticante");
  const idUsuarioLogado = profile.id_usuario;

  const [etapa, setEtapa] = useState<1 | 2>(1); // 1: Resumo e Extras (UC008, UC009) | 2: Pagamento (UC010)
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [timer, setTimer] = useState(600); // 10 minutos (Regra RF08)
  
  const [dataAgendamento, setDataAgendamento] = useState<Date>(() => {
    if (typeof data === "string" && data) {
      const parts = data.split("-");
      if (parts.length === 3) {
        const yyyy = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10) - 1;
        const dd = parseInt(parts[2], 10);
        return new Date(yyyy, mm, dd, 12, 0, 0, 0);
      }
    }
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const initialHorario = typeof horario === "string" 
    ? (horario.includes(" - ") ? horario : `${horario} - ${parseInt(horario.split(":")[0]) + 1}:00`)
    : "19:00 - 20:00";
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>(initialHorario);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dataAgendamento;
    setShowDatePicker(Platform.OS === 'ios' || Platform.OS === 'web');
    setDataAgendamento(currentDate);
  };

  const precoBase = parseFloat(
    String(preco)?.replace("R$", "").replace(",", ".").replace("/h", "").trim() || "0",
  );

  useEffect(() => {
    async function loadEquipamentos() {
      try {
        const data = await apiFetch<any[]>(`equipamentos/?id_quadra=${id}`);
        setEquipamentos(data);
        const initialQuantities: Record<number, number> = {};
        data.forEach((eq) => {
          initialQuantities[eq.id_equipamento] = 0;
        });
        setQuantidades(initialQuantities);
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
      }
    }
    if (id) {
      loadEquipamentos();
    }
  }, [id]);

  const totalExtras = equipamentos.reduce((sum, eq) => {
    const qty = quantidades[eq.id_equipamento] || 0;
    return sum + qty * parseFloat(eq.valor);
  }, 0);

  const total = precoBase + totalExtras;

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>;
    if (etapa === 2 && timer > 0) {
      intervalo = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      Alert.alert(
        "Tempo Esgotado",
        "O tempo de 10 minutos expirou. A reserva foi cancelada.",
      );
      router.back();
    }
    return () => clearInterval(intervalo);
  }, [etapa, timer]);

  const updateQuantidade = (idEquipamento: number, diff: number) => {
    setQuantidades((prev) => {
      const current = prev[idEquipamento] || 0;
      const next = Math.max(0, current + diff);
      return { ...prev, [idEquipamento]: next };
    });
  };

  const confirmarPagamento = async () => {
    try {
      const today = getLocalDateString(new Date()); // YYYY-MM-DD
      
      // 1. Criar o agendamento
      const formattedDate = getLocalDateString(dataAgendamento); // YYYY-MM-DD
      const agendamento = await apiFetch<any>("agendamentos", {
        method: "POST",
        body: JSON.stringify({
          id_usuario: idUsuarioLogado,
          id_quadra: parseInt(String(id), 10),
          data_agendamento: formattedDate,
          hora_inicio: String(horarioSelecionado).split(" - ")[0] || "19:00",
          hora_fim: String(horarioSelecionado).split(" - ")[1] || "20:00",
          valor: total,
        }),
      });

      const id_agendamento = agendamento.id_agendamento;

      // 2. Registrar cada equipamento alugado
      for (const eq of equipamentos) {
        const qty = quantidades[eq.id_equipamento] || 0;
        if (qty > 0) {
          await apiFetch<any>("aluguel-equipamentos", {
            method: "POST",
            body: JSON.stringify({
              id_agendamento: id_agendamento,
              id_equipamento: eq.id_equipamento,
              quantidade: qty,
              valor: parseFloat(eq.valor) * qty,
            }),
          });
        }
      }

      // 3. Registrar o pagamento
      await apiFetch<any>("pagamentos", {
        method: "POST",
        body: JSON.stringify({
          id_agendamento: id_agendamento,
          data_pagamento: today,
          valor: total,
          forma_pagamento: etapa === 2 ? "PIX" : "Cartão de Crédito",
        }),
      });

      Alert.alert(
        "Pagamento Confirmado!",
        "Sua reserva foi concluída com sucesso e registrada no banco de dados.",
        [{ text: "OK", onPress: () => router.replace("/(praticante)") }],
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Ocorreu um erro ao registrar sua reserva.");
    }
  };

  const renderResumoExtras = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.tituloSecao}>Confirme sua Reserva (UC008)</Text>
      <View style={styles.card}>
        <Text style={styles.info}>
          <Text style={styles.bold}>Local:</Text> {nome}
        </Text>
        <Text style={styles.info}>
          <Text style={styles.bold}>Horário:</Text> {horarioSelecionado}
        </Text>
        <Text style={styles.info}>
          <Text style={styles.bold}>Valor da Quadra:</Text> R${" "}
          {precoBase.toFixed(2).replace(".", ",")}
        </Text>
      </View>

      <Text style={styles.tituloSecao}>Selecione a Data do Agendamento</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {getNext14Days().map((item) => {
          const isSelected = dataAgendamento.toDateString() === item.dateObj.toDateString();
          return (
            <TouchableOpacity
              key={item.formatted}
              style={[
                styles.dateCard,
                isSelected && styles.dateCardSelected,
              ]}
              onPress={() => setDataAgendamento(item.dateObj)}
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

      <Text style={styles.tituloSecao}>Selecione o Horário do Agendamento</Text>
      <View style={styles.slotsContainer}>
        {SLOTS_HORARIOS.map((slot) => {
          const isSelected = horarioSelecionado === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotCard,
                isSelected && styles.slotCardSelected,
              ]}
              onPress={() => setHorarioSelecionado(slot)}
            >
              <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.tituloSecao}>
        Deseja adicionar equipamentos? (UC009)
      </Text>
      <View style={styles.card}>
        {equipamentos.length === 0 ? (
          <Text style={{ color: "#666", textAlign: "center", paddingVertical: 10 }}>
            Sem equipamentos adicionais disponíveis para esta quadra.
          </Text>
        ) : (
          equipamentos.map((eq) => {
            const qty = quantidades[eq.id_equipamento] || 0;
            return (
              <View key={eq.id_equipamento} style={styles.linhaExtra}>
                <Text style={[styles.info, { flex: 1, paddingRight: 10 }]}>
                  {eq.descricao} (R$ {parseFloat(eq.valor).toFixed(2).replace(".", ",")} un)
                </Text>
                <View style={styles.contador}>
                  <TouchableOpacity
                    onPress={() => updateQuantidade(eq.id_equipamento, -1)}
                    style={styles.btnContador}
                  >
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.txtContador}>{qty}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantidade(eq.id_equipamento, 1)}
                    style={styles.btnContador}
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      <Text style={styles.valorTotal}>
        Total a Pagar: R$ {total.toFixed(2).replace(".", ",")}
      </Text>

      <TouchableOpacity
        style={styles.botaoPrincipal}
        onPress={() => setEtapa(2)}
      >
        <Text style={styles.textoBotao}>Avançar para Pagamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPagamento = () => {
    const minutos = Math.floor(timer / 60);
    const segundos = timer % 60;

    return (
      <View style={styles.scroll}>
        <Text style={styles.tituloSecao}>Pagamento (UC010)</Text>
        <Text style={styles.timer}>
          Tempo restante: {minutos.toString().padStart(2, "0")}:
          {segundos.toString().padStart(2, "0")}
        </Text>

        <View style={styles.card}>
          <Text style={styles.valorTotal}>
            Total: R$ {total.toFixed(2).replace(".", ",")}
          </Text>
          <Text style={styles.infoCenter}>Selecione a forma de pagamento:</Text>

          <TouchableOpacity
            style={styles.botaoPix}
            onPress={confirmarPagamento}
          >
            <Text style={styles.textoBotaoPix}>Pagar com PIX</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoCartao}
            onPress={confirmarPagamento}
          >
            <Text style={styles.textoBotaoCartao}>
              Pagar com Cartão de Crédito
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {etapa === 1 ? renderResumoExtras() : renderPagamento()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scroll: { padding: 20, paddingTop: 40 },
  tituloSecao: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eee",
  },
  info: { fontSize: 16, marginBottom: 8, color: "#444" },
  bold: { fontWeight: "bold" },
  linhaExtra: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  contador: { flexDirection: "row", alignItems: "center" },
  btnContador: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5,
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
  slotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 20,
    marginTop: 10,
  },
  slotCard: {
    width: "48%",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  slotCardSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  slotText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  slotTextSelected: {
    color: "#fff",
  },
  txtContador: { marginHorizontal: 15, fontSize: 16, fontWeight: "bold" },
  valorTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginVertical: 15,
    textAlign: "center",
  },
  botaoPrincipal: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  timer: {
    fontSize: 18,
    color: "#d32f2f",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  infoCenter: { textAlign: "center", marginBottom: 20, color: "#666" },
  botaoPix: {
    backgroundColor: "#32bcad",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  textoBotaoPix: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botaoCartao: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  textoBotaoCartao: { color: "#333", fontWeight: "bold", fontSize: 16 },
});
