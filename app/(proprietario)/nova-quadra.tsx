import { router } from "expo-router";
import { useState } from "react";
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
} from "react-native";

export default function NovaQuadraScreen() {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [valor, setValor] = useState("");
  const [tipoPiso, setTipoPiso] = useState("");

  // No prototipo o id do proprietario e fixo; no backend viria do usuario autenticado.
  const idUsuario = "1";

  const handleSalvar = () => {
    if (!nome.trim() || !endereco.trim() || !valor.trim() || !tipoPiso.trim()) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha nome, endereço, valor e tipo de piso.",
      );
      return;
    }

    router.replace("/(proprietario)/gerenciar-catalogo");
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
        <Text style={styles.titulo}>Adicionar Nova Quadra</Text>
        <Text style={styles.subtitulo}>
          Cadastro baseado no dicionário de Quadras
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>id_quadra</Text>
          <TextInput
            style={styles.inputDisabled}
            value="Gerado automaticamente"
            editable={false}
          />

          <Text style={styles.label}>nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Quadra Society 2"
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

          <Text style={styles.label}>tipo_piso</Text>
          <TextInput
            style={styles.input}
            value={tipoPiso}
            onChangeText={setTipoPiso}
            placeholder="Ex: Sintético"
          />

          <Text style={styles.label}>id_usuario (proprietário)</Text>
          <TextInput
            style={styles.inputDisabled}
            value={idUsuario}
            editable={false}
          />
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Text style={styles.textoBotao}>Salvar Quadra</Text>
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
});
