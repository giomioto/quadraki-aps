import { router } from "expo-router";
import { UserProfileScreen } from "../../components/user-profile-screen";
import { useUserProfile } from "../../context/user-profiles-context";

export default function PerfilPraticanteScreen() {
  const { profile, logout } = useUserProfile("praticante");

  return (
    <UserProfileScreen
      name={profile.name}
      roleLabel="Praticante"
      subtitle="Dados cadastrais do praticante no sistema QuadrAki."
      accentColor="#2E7D32"
      accentSoftColor="#43A047"
      accentLighterColor="#E8F5E9"
      details={[
        {
          label: "Nome completo",
          value: profile.name,
          icon: "person-outline",
        },
        { label: "E-mail", value: profile.email, icon: "mail-outline" },
        { label: "CPF/CNPJ", value: profile.document, icon: "card-outline" },
        {
          label: "Tipo de usuário",
          value: "Praticante",
          icon: "id-card-outline",
        },
      ]}
      editLabel="Editar perfil"
      onEditPress={() =>
        router.push({ pathname: "/modal", params: { role: "praticante" } })
      }
      logoutLabel="Sair da conta"
      onLogoutPress={() => {
        logout();
        router.dismissAll();
        router.replace("/");
      }}
    />
  );
}
