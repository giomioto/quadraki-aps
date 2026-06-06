import { Ionicons } from "@expo/vector-icons";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ProfileItem = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type UserProfileScreenProps = {
  name: string;
  roleLabel: string;
  subtitle: string;
  accentColor: string;
  accentSoftColor: string;
  accentLighterColor: string;
  details: ProfileItem[];
  editLabel: string;
  onEditPress: () => void;
  logoutLabel: string;
  onLogoutPress: () => void;
};

export function UserProfileScreen({
  name,
  roleLabel,
  subtitle,
  accentColor,
  accentSoftColor,
  accentLighterColor,
  details,
  editLabel,
  onEditPress,
  logoutLabel,
  onLogoutPress,
}: UserProfileScreenProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { backgroundColor: accentColor }]}>
        <View style={[styles.avatar, { backgroundColor: accentSoftColor }]}>
          <Ionicons name="person" size={44} color="#fff" />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{roleLabel}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados da conta</Text>
        <View style={styles.card}>
          {details.map((item) => (
            <View key={item.label} style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.rowIcon,
                    { backgroundColor: accentLighterColor },
                  ]}
                >
                  <Ionicons name={item.icon} size={18} color={accentColor} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: accentColor }]}
          onPress={onEditPress}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editButtonText}>{editLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
          <Ionicons name="log-out-outline" size={18} color="#d32f2f" />
          <Text style={styles.logoutButtonText}>{logoutLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  hero: {
    paddingTop: 64,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: "center",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  role: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: "rgba(255,255,255,0.88)",
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 21,
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: "#374151",
    flexShrink: 1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutButtonText: {
    color: "#d32f2f",
    fontSize: 15,
    fontWeight: "700",
  },
  bottomSpacer: {
    height: 24,
  },
});
