import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

type QuadraParams = {
  id?: string;
  nome?: string;
  esporte?: string;
  valor?: string;
  endereco?: string;
  idUsuario?: string;
  cnpj?: string;
};

import { apiFetch } from "../../services/api";

export default function EditarQuadraScreen() {
  const params = useLocalSearchParams<QuadraParams>();

  const quadraInicial = useMemo(
    () => ({
      id: params.id ?? "1",
      nome: params.nome ?? "Quadra Society 1",
      esporte: params.esporte ?? "Futebol",
      valor: params.valor ?? "150.00",
      endereco: params.endereco ?? "Rua das Quadras, 123",
      idUsuario: params.idUsuario ?? "1",
      cnpj: params.cnpj ?? "",
    }),
    [params],
  );

  const [nome, setNome] = useState(quadraInicial.nome);
  const [esporte, setEsporte] = useState(quadraInicial.esporte);
  const [valor, setValor] = useState(quadraInicial.valor);
  const [endereco, setEndereco] = useState(quadraInicial.endereco);
  const [cnpj, setCnpj] = useState(quadraInicial.cnpj);

  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loadingEquips, setLoadingEquips] = useState(false);
  const [novoEquipDescricao, setNovoEquipDescricao] = useState("");
  const [novoEquipValor, setNovoEquipValor] = useState("");

  async function loadEquipamentos() {
    try {
      setLoadingEquips(true);
      const data = await apiFetch<any[]>(`equipamentos/?id_quadra=${quadraInicial.id}`);
      setEquipamentos(data);
    } catch (err) {
      console.error("Erro ao carregar equipamentos:", err);
    } finally {
      setLoadingEquips(false);
    }
  }

  useEffect(() => {
    loadEquipamentos();
  }, [quadraInicial.id]);

  const handleAdicionarEquipamento = async () => {
    if (!novoEquipDescricao.trim() || !novoEquipValor.trim()) {
      Alert.alert("Erro", "Preencha a descrição e o valor do equipamento.");
      return;
    }
    const valFloat = parseFloat(novoEquipValor.replace(",", "."));
    if (isNaN(valFloat)) {
      Alert.alert("Erro", "Insira um valor válido.");
      return;
    }

    try {
      await apiFetch("equipamentos", {
        method: "POST",
        body: JSON.stringify({
          id_quadra: parseInt(quadraInicial.id, 10),
          descricao: novoEquipDescricao.trim(),
          valor: valFloat,
        }),
      });
      setNovoEquipDescricao("");
      setNovoEquipValor("");
      loadEquipamentos();
      Alert.alert("Sucesso", "Equipamento adicionado com sucesso!");
    } catch (err) {
      console.error("Erro ao adicionar equipamento:", err);
      Alert.alert("Erro", "Falha ao salvar equipamento.");
    }
  };

  const handleRemoverEquipamento = async (idEquip: number) => {
    Alert.alert(
      "Remover Equipamento",
      "Deseja realmente remover este equipamento?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`equipamentos/${idEquip}`, {
                method: "DELETE",
              });
              loadEquipamentos();
            } catch (err) {
              console.error("Erro ao remover equipamento:", err);
              Alert.alert("Erro", "Falha ao remover equipamento.");
            }
          },
        },
      ]
    );
  };

  const handleSalvar = async () => {
    if (
      !nome.trim() ||
      !esporte.trim() ||
      !valor.trim() ||
      !endereco.trim() ||
      !cnpj.trim()
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha nome, esporte, valor, endereço e CNPJ.",
      );
      return;
    }

    const valorFloat = parseFloat(valor.replace(",", "."));
    if (isNaN(valorFloat)) {
      Alert.alert("Erro", "O valor inserido não é válido.");
      return;
    }

    const cnpjCleaned = cnpj.replace(/\D/g, "");
    if (!cnpjCleaned || cnpjCleaned.length !== 14) {
      Alert.alert("Erro", "O CNPJ inserido deve ter exatamente 14 dígitos.");
      return;
    }
    const cnpjInt = parseInt(cnpjCleaned, 10);

    try {
      await apiFetch(`quadras/${quadraInicial.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nome: nome.trim(),
          esporte: esporte.trim(),
          valor: valorFloat,
          endereco: endereco.trim(),
          cnpj: cnpjInt,
        }),
      });

      Alert.alert("Sucesso", "Quadra alterada com sucesso!");
      router.replace("/(proprietario)/gerenciar-catalogo");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao editar quadra no servidor.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Editar Quadra</Text>
        <Text style={styles.subtitulo}>
          Alteração baseada no dicionário de Quadras
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Quadra Society 1"
          />

          <Text style={styles.label}>Esporte</Text>
          <TextInput
            style={styles.input}
            value={esporte}
            onChangeText={setEsporte}
            placeholder="Ex: Futebol"
          />

          <Text style={styles.label}>endereco</Text>
          <TextInput
            style={styles.input}
            value={endereco}
            onChangeText={setEndereco}
            placeholder="Ex: Rua das Quadras, 123 - Curitiba"
          />

          <Text style={styles.label}>valor (por hora)</Text>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="Ex: 150.00"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>CNPJ da Quadra</Text>
          <TextInput
            style={styles.input}
            value={cnpj}
            onChangeText={(text) => setCnpj(text.replace(/\D/g, ""))}
            placeholder="Ex: 12.345.678/0001-99"
            keyboardType="numeric"
          />
        </View>

        {/* Seção de Equipamentos Extras (UC009) */}
        <Text style={styles.secaoTitulo}>Equipamentos Extras</Text>
        <View style={styles.card}>
          {loadingEquips ? (
            <ActivityIndicator size="small" color="#1565C0" style={{ marginVertical: 10 }} />
          ) : equipamentos.length === 0 ? (
            <Text style={styles.semEquipamentos}>Nenhum equipamento cadastrado para esta quadra.</Text>
          ) : (
            equipamentos.map((eq) => (
              <View key={eq.id_equipamento} style={styles.equipItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.equipDesc}>⚽ {eq.descricao}</Text>
                  <Text style={styles.equipValor}>R$ {parseFloat(eq.valor).toFixed(2).replace(".", ",")} por hora</Text>
                </View>
                <TouchableOpacity
                  style={styles.btnRemoverEquip}
                  onPress={() => handleRemoverEquipamento(eq.id_equipamento)}
                >
                  <Text style={styles.txtRemoverEquip}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <Text style={styles.subtituloSecao}>Adicionar Novo Equipamento</Text>
          
          <Text style={styles.label}>Descrição do Equipamento</Text>
          <TextInput
            style={styles.input}
            value={novoEquipDescricao}
            onChangeText={setNovoEquipDescricao}
            placeholder="Ex: Colete de treino, Bola Oficial"
          />

          <Text style={styles.label}>Valor (por hora)</Text>
          <TextInput
            style={styles.input}
            value={novoEquipValor}
            onChangeText={setNovoEquipValor}
            placeholder="Ex: 10.00"
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={styles.btnAdicionarEquip}
            onPress={handleAdicionarEquipamento}
          >
            <Text style={styles.txtAdicionarEquip}>+ Adicionar Equipamento</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Text style={styles.textoBotao}>Salvar Alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => router.replace("/(proprietario)/gerenciar-catalogo")}
        >
          <Text style={styles.textoCancelar}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#f5f7fb",
    flexGrow: 1,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1565C0",
  },
  subtitulo: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 15,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe3ef",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    color: "#64748b",
  },
  botaoSalvar: {
    marginTop: 18,
    backgroundColor: "#1565C0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  botaoCancelar: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  textoCancelar: {
    color: "#475569",
    fontWeight: "600",
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1565C0",
    marginTop: 24,
    marginBottom: 10,
  },
  subtituloSecao: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 18,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
  semEquipamentos: {
    textAlign: "center",
    color: "#64748b",
    marginVertical: 10,
    fontStyle: "italic",
  },
  equipItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  equipDesc: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  equipValor: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
    marginTop: 2,
  },
  btnRemoverEquip: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  txtRemoverEquip: {
    color: "#d32f2f",
    fontWeight: "700",
    fontSize: 12,
  },
  btnAdicionarEquip: {
    marginTop: 15,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  txtAdicionarEquip: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
