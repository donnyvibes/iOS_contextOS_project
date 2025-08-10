import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  InstrumentSans_400Regular,
  InstrumentSans_600SemiBold,
} from "@expo-google-fonts/instrument-sans";
import {
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  FileText,
  Share,
  HelpCircle,
  ChevronRight,
  Shield,
} from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState(theme.isDark);

  const [fontsLoaded] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleExportData = () => {
    Alert.alert("Export Data", "Choose what to export:", [
      { text: "All Data", onPress: () => exportData("all") },
      { text: "Prompts Only", onPress: () => exportData("prompts") },
      { text: "Context Profiles Only", onPress: () => exportData("contexts") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const exportData = async (type) => {
    try {
      const response = await fetch(`/api/data/export?type=${type}`);
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      // In a real app, you would handle file download here
      // For now, we'll just show a success message
      Alert.alert(
        "Export Complete",
        `${type} data has been exported successfully.`,
      );
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Export Failed", "Failed to export data. Please try again.");
    }
  };

  const handleImportData = () => {
    Alert.alert(
      "Import Data",
      "This will import and merge data with your existing collection. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Import", onPress: () => importData() },
      ],
    );
  };

  const importData = () => {
    // Import functionality would be implemented here
    Alert.alert("Import Complete", "Data has been imported successfully.");
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your prompts, knowledge bases, and context profiles. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => resetData(),
        },
      ],
    );
  };

  const resetData = async () => {
    try {
      const response = await fetch("/api/data/reset", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to reset data");
      }

      Alert.alert("Data Reset", "All data has been permanently deleted.");

      // Invalidate all queries to refresh the UI
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Reset error:", error);
      Alert.alert("Reset Failed", "Failed to reset data. Please try again.");
    }
  };

  const toggleDarkMode = (value) => {
    setIsDarkMode(value);
    // Dark mode toggle functionality would be implemented here
  };

  const SettingSection = ({ title, children }) => (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontFamily: "InstrumentSans_600SemiBold",
          fontSize: 16,
          color: theme.colors.text,
          marginBottom: 16,
          paddingHorizontal: 26,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );

  const SettingItem = ({
    icon,
    title,
    description,
    onPress,
    showChevron = true,
    destructive = false,
    rightElement = null,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        marginHorizontal: 26,
        marginBottom: 8,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: destructive
            ? "rgba(239, 68, 68, 0.1)"
            : theme.colors.inputBackground,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        {React.cloneElement(icon, {
          size: 20,
          color: destructive ? "#EF4444" : theme.colors.textSecondary,
        })}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "InstrumentSans_600SemiBold",
            fontSize: 16,
            color: destructive ? "#EF4444" : theme.colors.text,
            marginBottom: description ? 4 : 0,
          }}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={{
              fontFamily: "InstrumentSans_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
              lineHeight: 18,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {rightElement ||
        (showChevron && (
          <ChevronRight size={16} color={theme.colors.textSecondary} />
        ))}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 21,
          paddingHorizontal: 26,
          paddingBottom: 21,
        }}
      >
        <Text
          style={{
            fontFamily: "InstrumentSans_600SemiBold",
            fontSize: 29,
            color: theme.colors.text,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 104,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SettingSection title="Appearance">
          <SettingItem
            icon={<Moon />}
            title="Dark Mode"
            description="Switch between light and dark themes"
            onPress={() => {}}
            showChevron={false}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{
                  false: theme.colors.inputBackground,
                  true: theme.colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SettingSection>

        {/* Data Management */}
        <SettingSection title="Data Management">
          <SettingItem
            icon={<Download />}
            title="Export Data"
            description="Export your prompts and context profiles"
            onPress={handleExportData}
          />
          <SettingItem
            icon={<Upload />}
            title="Import Data"
            description="Import prompts and context profiles from file"
            onPress={handleImportData}
          />
          <SettingItem
            icon={<Share />}
            title="Share Backup"
            description="Share your data backup with other devices"
            onPress={() =>
              Alert.alert("Share Backup", "Backup sharing feature coming soon.")
            }
          />
        </SettingSection>

        {/* Support */}
        <SettingSection title="Support">
          <SettingItem
            icon={<FileText />}
            title="Documentation"
            description="Learn how to use AI Prompt Manager effectively"
            onPress={() =>
              Alert.alert("Documentation", "Opening documentation...")
            }
          />
          <SettingItem
            icon={<HelpCircle />}
            title="Help & Support"
            description="Get help and contact support"
            onPress={() =>
              Alert.alert("Help & Support", "Opening support center...")
            }
          />
          <SettingItem
            icon={<Shield />}
            title="Privacy Policy"
            description="View our privacy policy and terms"
            onPress={() =>
              Alert.alert("Privacy Policy", "Opening privacy policy...")
            }
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Danger Zone">
          <SettingItem
            icon={<Trash2 />}
            title="Reset All Data"
            description="Permanently delete all prompts, knowledge bases, and contexts"
            onPress={handleResetData}
            destructive={true}
          />
        </SettingSection>

        {/* App Info */}
        <View
          style={{ paddingHorizontal: 26, paddingTop: 16, paddingBottom: 32 }}
        >
          <Text
            style={{
              fontFamily: "InstrumentSans_400Regular",
              fontSize: 14,
              color: theme.colors.textTertiary,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            AI Prompt Manager v1.0.0{"\n"}
            Built for AI power users
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
