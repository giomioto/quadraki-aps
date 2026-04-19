import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const handleSelectProfile = (profile: "praticante" | "proprietario") => {
    // Redireciona para a tela de login passando o perfil escolhido
    router.push({ pathname: "/login", params: { profile } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>QuadrAki</Text>
      <Text style={styles.subtitulo}>Conectando você ao esporte</Text>

      <Text style={styles.instrucao}>Como você deseja acessar?</Text>

      <TouchableOpacity
        style={styles.botaoPrincipal}
        onPress={() => handleSelectProfile("praticante")}
      >
        <Text style={styles.textoBotao}>Sou Praticante</Text>
        <Text style={styles.textoBotaoSub}>
          Quero encontrar e agendar quadras
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => handleSelectProfile("proprietario")}
      >
        <Text style={styles.textoBotaoSecundario}>Sou Proprietário</Text>
        <Text style={styles.textoBotaoSecundarioSub}>
          Quero gerenciar meu complexo esportivo
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  instrucao: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    color: "#333",
  },
  botaoPrincipal: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  textoBotaoSub: { color: "#e8f5e9", fontSize: 12, marginTop: 4 },
  botaoSecundario: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2E7D32",
    elevation: 1,
  },
  textoBotaoSecundario: { color: "#2E7D32", fontWeight: "bold", fontSize: 18 },
  textoBotaoSecundarioSub: { color: "#666", fontSize: 12, marginTop: 4 },
});

