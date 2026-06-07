import { router } from "expo-router";
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

export default function GerenciarCatalogoScreen() {
  const { profile } = useUserProfile("proprietario");
  const idProprietarioActive = profile.id_proprietario;

  const [quadras, setQuadras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadQuadras() {
    if (!idProprietarioActive) {
      setQuadras([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiFetch<any[]>(`quadras/?id_proprietario=${idProprietarioActive}`);
      const mapped = data.map((item) => ({
        id: String(item.id_quadra),
        nome: item.nome,
        esporte: item.esporte,
        valor: `R$ ${parseFloat(item.valor).toFixed(2).replace(".", ",")}/h`,
        endereco: item.endereco,
        tipoPiso: item.esporte || "Sintético", 
        idUsuario: String(item.id_proprietario),
        cnpj: item.cnpj ? String(item.cnpj) : "",
      }));
      setQuadras(mapped);
    } catch (error) {
      console.error("Erro ao carregar catálogo:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuadras();
  }, [idProprietarioActive]);

  const handleExcluir = (idQuadra: string) => {
    Alert.alert(
      "Remover Quadra",
      "Deseja realmente excluir esta quadra do seu catálogo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Exclusão",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`quadras/${idQuadra}`, {
                method: "DELETE",
              });
              Alert.alert("Sucesso", "Quadra removida com sucesso!");
              loadQuadras();
            } catch (err) {
              Alert.alert("Erro", "Falha ao remover quadra do servidor.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu Catálogo</Text>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#1565C0" />
        </View>
      ) : (
        <FlatList
          data={quadras}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
              Nenhuma quadra cadastrada no catálogo.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={{ color: "#555", marginTop: 4 }}>
                {item.esporte} | {item.valor}
              </Text>
              <Text style={{ color: "#777", fontSize: 13, marginTop: 4 }}>
                Endereço: {item.endereco}
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
                        valor: item.valor.replace("R$", "").replace("/h", "").replace(",", ".").trim(),
                        endereco: item.endereco,
                        tipoPiso: item.tipoPiso,
                        idUsuario: item.idUsuario,
                        cnpj: item.cnpj,
                      },
                    })
                  }
                >
                  <Text style={styles.btnEditar}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleExcluir(item.id)}
                >
                  <Text style={styles.btnExcluir}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

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
