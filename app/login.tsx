import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from "react-native";

export default function LoginScreen() {
  const { profile } = useLocalSearchParams();
  const isPraticante = profile !== "proprietario";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos!");
      return;
    }

    if (email === "teste@teste.com" && senha === "teste") {
      if (isPraticante) {
        router.replace("/(praticante)");
      } else {
        router.replace("/(proprietario)");
      }
    } else {
      Alert.alert("Erro", "Credenciais inválidas");
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
          Login {isPraticante ? "Praticante" : "Proprietário"}
        </Text>

        <TextInput
          style={styles.input}
          placeholderTextColor="#666"
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
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

        <TouchableOpacity style={styles.botaoPrincipal} onPress={handleLogin}>
          <Text style={styles.textoBotao}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoLink}
          onPress={() =>
            router.push({ pathname: "/cadastro", params: { profile } })
          }
        >
          <Text style={styles.textoLink}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
  },
  botaoPrincipal: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botaoLink: { alignItems: "center" },
  textoLink: {
    color: "#2E7D32",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
