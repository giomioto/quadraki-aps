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

import { apiFetch } from "../services/api";
import { useUserProfiles } from "../context/user-profiles-context";

export default function LoginScreen() {
  const { profile } = useLocalSearchParams();
  const isPraticante = profile !== "proprietario";
  const { updateProfile } = useUserProfiles();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos!");
      return;
    }

    try {
      if (isPraticante) {
        // Envia requisição POST para validar email e senha
        const user = await apiFetch<any>("usuarios/login", {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), senha }),
        });
        updateProfile("praticante", {
          id_usuario: user.id_usuario,
          name: user.nome,
          email: user.email,
          document: user.cpf || "",
        });
        router.replace("/(praticante)");
      } else {
        // Envia requisição POST para validar email e senha do proprietário
        const owner = await apiFetch<any>("proprietarios/login", {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), senha }),
        });
        updateProfile("proprietario", {
          id_proprietario: owner.id_proprietario,
          name: owner.nome,
          email: owner.email,
          document: owner.cpf || "",
          phone: owner.telefone || "",
        });
        router.replace("/(proprietario)");
      }
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : "E-mail ou senha incorretos.";
      Alert.alert("Erro", msg);
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
