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

import { apiFetch } from "../services/api";
import { useUserProfiles } from "../context/user-profiles-context";

export default function CadastroScreen() {
  const { profile } = useLocalSearchParams();
  const isPraticante = profile !== "proprietario";
  const { updateProfile } = useUserProfiles();

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState(""); // CPF
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleCadastro = async () => {
    const missingFields: string[] = [];
    if (!nome.trim()) missingFields.push("Nome Completo");
    if (!documento.trim()) missingFields.push("CPF");
    if (!isPraticante && !telefone.trim()) missingFields.push("Telefone");
    if (!email.trim()) missingFields.push("E-mail");
    if (!senha) missingFields.push("Senha");
    if (!confirmarSenha) missingFields.push("Confirmar Senha");

    if (missingFields.length > 0) {
      Alert.alert(
        "Atenção",
        `Os seguintes campos estão faltando:\n- ${missingFields.join("\n- ")}`
      );
      return;
    }

    if (senha.length < 8) {
      Alert.alert(
        "Atenção",
        "A senha deve ter no mínimo 8 caracteres.",
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem!");
      return;
    }

    try {
      const docCleaned = documento.replace(/\D/g, "");
      if (!docCleaned || docCleaned.length !== 11) {
        Alert.alert("Atenção", "O CPF deve conter exatamente 11 dígitos.");
        return;
      }

      if (isPraticante) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const user = await apiFetch<any>("usuarios", {
          method: "POST",
          body: JSON.stringify({
            nome: nome.trim(),
            email: email.trim(),
            data_cadastro: today,
            senha: senha,
            cpf: docCleaned,
          }),
        });

        updateProfile("praticante", {
          id_usuario: user.id_usuario,
          name: user.nome,
          email: user.email,
          document: user.cpf || "",
        });

        Alert.alert("Sucesso", "Cadastro de praticante concluído com sucesso!");
        router.replace("/(praticante)");
      } else {
        const owner = await apiFetch<any>("proprietarios", {
          method: "POST",
          body: JSON.stringify({
            nome: nome.trim(),
            email: email.trim(),
            cpf: docCleaned,
            telefone: telefone.trim(),
            senha: senha,
          }),
        });

        updateProfile("proprietario", {
          id_proprietario: owner.id_proprietario,
          name: owner.nome,
          email: owner.email,
          document: owner.cpf || "",
          phone: owner.telefone || "",
        });

        Alert.alert("Sucesso", "Cadastro de proprietário concluído com sucesso!");
        router.replace("/(proprietario)");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Falha ao realizar cadastro. Tente novamente.";
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
          placeholder="CPF"
          keyboardType="numeric"
          value={documento}
          onChangeText={(text) => setDocumento(text.replace(/\D/g, ""))}
        />

        {!isPraticante && (
          <TextInput
            style={styles.input}
            placeholderTextColor="#666"
            placeholder="Telefone"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />
        )}

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
