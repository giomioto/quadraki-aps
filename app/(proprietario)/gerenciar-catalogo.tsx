import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function GerenciarCatalogoScreen() {
  const [quadras] = useState([
    {
      id: "1",
      nome: "Quadra Society 1",
      esporte: "Futebol",
      valor: "R$ 150/h",
      endereco: "Rua das Quadras, 123",
      tipoPiso: "Sintético",
      idUsuario: "1",
    },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu Catálogo (UC006)</Text>

      <FlatList
        data={quadras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text>
              {item.esporte} | {item.valor}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(proprietario)/editar-quadra",
                    params: {
                      id: item.id,
                      nome: item.nome,
                      esporte: item.esporte,
                      valor: item.valor,
                      endereco: item.endereco,
                      tipoPiso: item.tipoPiso,
                      idUsuario: item.idUsuario,
                    },
                  })
                }
              >
                <Text style={styles.btnEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Alert.alert("Excluir", "Confirma exclusão?")}
              >
                <Text style={styles.btnExcluir}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.botaoPrincipal}
        onPress={() => router.push("/(proprietario)/nova-quadra")}
      >
        <Text style={styles.textoBotao}>+ Adicionar Nova Quadra</Text>
      </TouchableOpacity>
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
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 15,
  },
  nome: { fontSize: 18, fontWeight: "bold" },
  actions: { flexDirection: "row", marginTop: 10, justifyContent: "flex-end" },
  btnEditar: { color: "#1565C0", marginRight: 15, fontWeight: "bold" },
  btnExcluir: { color: "#d32f2f", fontWeight: "bold" },
  botaoPrincipal: {
    backgroundColor: "#1565C0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotao: { color: "#fff", fontWeight: "bold" },
});
