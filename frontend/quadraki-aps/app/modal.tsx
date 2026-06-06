import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
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
import { UserRole, useUserProfile } from "../context/user-profiles-context";
import { apiFetch } from "../services/api";

export default function ModalScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const role = useMemo<UserRole>(() => {
    const value = Array.isArray(params.role) ? params.role[0] : params.role;
    return value === "proprietario" ? "proprietario" : "praticante";
  }, [params.role]);

  const { profile, updateProfile } = useUserProfile(role);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || "");
  const [document, setDocument] = useState(profile.document || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const goToProfile = () => {
    if (role === "proprietario") {
      router.replace("/(proprietario)/perfil");
      return;
    }

    router.replace("/(praticante)/perfil");
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Erro", "Preencha nome e e-mail.");
      return;
    }

    const cleanedCpf = document.replace(/\D/g, "");
    if (!cleanedCpf || cleanedCpf.length !== 11) {
      Alert.alert("Erro", "O CPF deve conter exatamente 11 dígitos.");
      return;
    }

    if (role === "proprietario" && !phone.trim()) {
      Alert.alert("Erro", "Preencha o telefone.");
      return;
    }

    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        Alert.alert("Erro", "Informe e confirme a nova senha.");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Erro", "As senhas informadas não coincidem.");
        return;
      }
    }

    try {
      // 1. Enviar atualização ao backend
      const endpoint = role === "proprietario"
        ? `proprietarios/${profile.id_proprietario}`
        : `usuarios/${profile.id_usuario}`;

      const body: any = {
        nome: name.trim(),
        email: email.trim(),
        cpf: cleanedCpf,
      };

      if (role === "proprietario") {
        body.telefone = phone.trim();
      }

      if (password) {
        body.senha = password;
      }

      await apiFetch<any>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      // 2. Atualizar o contexto local
      updateProfile({
        name: name.trim(),
        email: email.trim(),
        document: cleanedCpf,
        phone: role === "proprietario" ? phone.trim() : "",
        ...(password ? { password } : {}),
      });

      // 3. Exibir popup de sucesso e retornar
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => goToProfile() }
      ]);
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", error.message || "Não foi possível atualizar o perfil no servidor.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: role === "proprietario" ? "#1565C0" : "#2E7D32" }]}>Editar perfil</Text>
            <Text style={styles.subtitle}>
              Atualize os dados do{" "}
              {role === "praticante" ? "praticante" : "proprietário"}.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome completo"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="nome@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={document}
            onChangeText={(text) => setDocument(text.replace(/\D/g, ""))}
            placeholder="Apenas os 11 dígitos do CPF"
            keyboardType="numeric"
          />

          {role === "proprietario" && (
            <>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ex: (11) 98888-4321"
                keyboardType="phone-pad"
              />
            </>
          )}

          <Text style={styles.label}>Nova senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Digite uma nova senha"
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar nova senha</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repita a nova senha"
            secureTextEntry
          />

          <Text style={styles.helperText}>
            Se quiser manter a senha atual, deixe os dois campos de senha em
            branco.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: role === "proprietario" ? "#1565C0" : "#2E7D32" }]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar alterações</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f7fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#111827",
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: "#6b7280",
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: "#2E7D32",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
