import { router } from "expo-router";
import { UserProfileScreen } from "../../components/user-profile-screen";
import { useUserProfile } from "../../context/user-profiles-context";

export default function PerfilProprietarioScreen() {
  const { profile, logout } = useUserProfile("proprietario");

  return (
    <UserProfileScreen
      name={profile.name}
      roleLabel="Proprietária"
      subtitle="Dados cadastrais do proprietário no sistema QuadrAki."
      accentColor="#1565C0"
      accentSoftColor="#1976D2"
      accentLighterColor="#E3F2FD"
      details={[
        {
          label: "Nome completo / Razão social",
          value: profile.name,
          icon: "person-outline",
        },
        { label: "E-mail", value: profile.email, icon: "mail-outline" },
        { label: "Telefone", value: profile.phone, icon: "call-outline" },
        {
          label: "CPF/CNPJ",
          value: profile.document,
          icon: "card-outline",
        },
        {
          label: "Tipo de usuário",
          value: "Proprietário",
          icon: "id-card-outline",
        },
      ]}
      editLabel="Editar perfil"
      onEditPress={() =>
        router.push({ pathname: "/modal", params: { role: "proprietario" } })
      }
      logoutLabel="Sair da conta"
      onLogoutPress={() => {
        logout();
      }}
    />
  );
}
