import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReservaScreen() {
  const { id, nome, preco, horario } = useLocalSearchParams();

  const [etapa, setEtapa] = useState<1 | 2>(1); // 1: Resumo e Extras (UC008, UC009) | 2: Pagamento (UC010)
  const [qtdBolas, setQtdBolas] = useState(0);
  const [qtdColetes, setQtdColetes] = useState(0);
  const [timer, setTimer] = useState(600); // 10 minutos (Regra RF08)

  const precoBase = parseFloat(
    String(preco)?.replace("R$", "").replace(",", ".") || "0",
  );
  const totalExtras = qtdBolas * 10 + qtdColetes * 5;
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

  const confirmarPagamento = () => {
    Alert.alert(
      "Pagamento Confirmado!",
      "Sua reserva foi concluída com sucesso e o proprietário foi notificado.",
      [{ text: "OK", onPress: () => router.replace("/(praticante)") }],
    );
  };

  const renderResumoExtras = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.tituloSecao}>Confirme sua Reserva (UC008)</Text>
      <View style={styles.card}>
        <Text style={styles.info}>
          <Text style={styles.bold}>Local:</Text> {nome}
        </Text>
        <Text style={styles.info}>
          <Text style={styles.bold}>Horário:</Text> {horario}
        </Text>
        <Text style={styles.info}>
          <Text style={styles.bold}>Valor da Quadra:</Text> R${" "}
          {precoBase.toFixed(2).replace(".", ",")}
        </Text>
      </View>

      <Text style={styles.tituloSecao}>
        Deseja adicionar equipamentos? (UC009)
      </Text>
      <View style={styles.card}>
        <View style={styles.linhaExtra}>
          <Text style={styles.info}>Bolas (R$ 10,00 un)</Text>
          <View style={styles.contador}>
            <TouchableOpacity
              onPress={() => setQtdBolas(Math.max(0, qtdBolas - 1))}
              style={styles.btnContador}
            >
              <Text>-</Text>
            </TouchableOpacity>
            <Text style={styles.txtContador}>{qtdBolas}</Text>
            <TouchableOpacity
              onPress={() => setQtdBolas(qtdBolas + 1)}
              style={styles.btnContador}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.linhaExtra}>
          <Text style={styles.info}>Coletes (R$ 5,00 un)</Text>
          <View style={styles.contador}>
            <TouchableOpacity
              onPress={() => setQtdColetes(Math.max(0, qtdColetes - 1))}
              style={styles.btnContador}
            >
              <Text>-</Text>
            </TouchableOpacity>
            <Text style={styles.txtContador}>{qtdColetes}</Text>
            <TouchableOpacity
              onPress={() => setQtdColetes(qtdColetes + 1)}
              style={styles.btnContador}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>
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
