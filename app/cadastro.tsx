import { router, useLocalSearchParams } from "expo-router";
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
} from "react-native";

export default function CadastroScreen() {
  const { profile } = useLocalSearchParams();
  const isPraticante = profile !== "proprietario";

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState(""); // CPF ou CNPJ
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleCadastro = () => {
    if (senha.length < 8) {
      Alert.alert(
        "Atenção",
        "A senha deve ter no mínimo 8 caracteres.",
      );
      return;
    }
    if (!isPraticante && documento.length < 14) {
      Alert.alert("Atenção", "O proprietário precisa informar um CNPJ válido.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem!");
      return;
    }

    Alert.alert("Sucesso", "Cadastro concluído com sucesso!");
    if (isPraticante) {
      router.replace("/(praticante)");
    } else {
      router.replace("/(proprietario)");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>
          Criar conta {isPraticante ? "Praticante" : "Proprietário"}
        </Text>

        <TextInput
          style={styles.input}
          placeholderTextColor="#666"
          placeholder="Nome Completo"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor="#666"
          placeholder={isPraticante ? "CPF" : "CNPJ"}
          keyboardType="numeric"
          value={documento}
          onChangeText={setDocumento}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor="#666"
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor="#666"
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
        <Text style={styles.helpText}>Mínimo de 8 caracteres</Text>

        <TextInput
          style={styles.input}
          placeholderTextColor="#666"
          placeholder="Confirmar Senha"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={handleCadastro}
        >
          <Text style={styles.textoBotao}>Realizar Cadastro</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  helpText: { fontSize: 12, color: "#888", marginBottom: 15, marginLeft: 5 },
  botaoPrincipal: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
