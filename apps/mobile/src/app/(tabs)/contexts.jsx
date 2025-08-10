import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  InstrumentSans_400Regular,
  InstrumentSans_400Regular_Italic,
  InstrumentSans_600SemiBold,
} from "@expo-google-fonts/instrument-sans";
import {
  Plus,
  Database,
  MoreVertical,
  Clock,
  Code,
  Search,
  Link as LinkIcon,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import SearchField from "@/components/SearchField";

export default function ContextsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [fontsLoaded] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_400Regular_Italic,
    InstrumentSans_600SemiBold,
  });

  // Fetch context profiles data
  const {
    data: contextProfiles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["context-profiles", searchText],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchText.trim()) {
        params.append("search", searchText.trim());
      }

      const response = await fetch(`/api/context-profiles?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch context profiles");
      }
      return response.json();
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["context-profiles"] });
  };

  const formatLastUpdated = (lastUpdated) => {
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) !== 1 ? "s" : ""} ago`;
    }
  };

  const ContextCard = ({ profile }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontFamily: "InstrumentSans_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {profile.name}
          </Text>
        </View>

        <TouchableOpacity>
          <MoreVertical size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontFamily: "InstrumentSans_400Regular",
          fontSize: 14,
          color: theme.colors.textSecondary,
          lineHeight: 20,
          marginBottom: 12,
        }}
        numberOfLines={2}
      >
        {profile.description}
      </Text>

      {/* JSON Preview */}
      <View
        style={{
          backgroundColor: theme.colors.inputBackground,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Code size={14} color={theme.colors.textSecondary} />
          <Text
            style={{
              fontFamily: "InstrumentSans_600SemiBold",
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginLeft: 6,
            }}
          >
            JSON PREVIEW
          </Text>
        </View>
        <Text
          style={{
            fontFamily: "InstrumentSans_400Regular",
            fontSize: 12,
            color: theme.colors.text,
            lineHeight: 16,
          }}
          numberOfLines={3}
        >
          {JSON.stringify(profile.json_data, null, 2)}
        </Text>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Clock size={12} color={theme.colors.textTertiary} />
          <Text
            style={{
              fontFamily: "InstrumentSans_400Regular",
              fontSize: 12,
              color: theme.colors.textTertiary,
              marginLeft: 4,
            }}
          >
            {formatLastUpdated(profile.last_updated)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <LinkIcon size={12} color={theme.colors.textTertiary} />
          <Text
            style={{
              fontFamily: "InstrumentSans_400Regular",
              fontSize: 12,
              color: theme.colors.textTertiary,
              marginLeft: 4,
            }}
          >
            {(parseInt(profile.linked_prompts) || 0) +
              (parseInt(profile.linked_knowledge) || 0)}{" "}
            linked
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => {
    const hasSearch = searchText.trim().length > 0;

    let title, description, icon;

    if (hasSearch) {
      title = "No context profiles found";
      description = `No context profiles match "${searchText}". Try adjusting your search.`;
      icon = <Search size={48} color={theme.colors.textTertiary} />;
    } else {
      title = "No context profiles yet";
      description = "Create your first context profile to get started.";
      icon = <Database size={48} color={theme.colors.textTertiary} />;
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingBottom: 60,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.surfaceElevated,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          {icon}
        </View>

        <Text
          style={{
            fontFamily: "InstrumentSans_600SemiBold",
            fontSize: 18,
            color: theme.colors.text,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontFamily: "InstrumentSans_400Regular",
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          {description}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 21,
          paddingHorizontal: 26,
          paddingBottom: 21,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "InstrumentSans_600SemiBold",
            fontSize: 29,
            color: theme.colors.text,
          }}
        >
          Contexts
        </Text>

        <TouchableOpacity
          style={{
            width: 42,
            height: 42,
            backgroundColor: theme.colors.primary,
            borderRadius: 21,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <SearchField
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search Context Profiles"
        isFocused={isSearchFocused}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        style={{
          marginHorizontal: 26,
          marginBottom: 24,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 26,
          paddingBottom: insets.bottom + 104,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={{ paddingTop: 40 }}>
            <Text
              style={{
                fontFamily: "InstrumentSans_400Regular",
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Loading context profiles...
            </Text>
          </View>
        ) : error ? (
          <View style={{ paddingTop: 40 }}>
            <Text
              style={{
                fontFamily: "InstrumentSans_400Regular",
                fontSize: 16,
                color: "#EF4444",
                textAlign: "center",
              }}
            >
              Failed to load context profiles. Pull to refresh.
            </Text>
          </View>
        ) : contextProfiles.length === 0 ? (
          <EmptyState />
        ) : (
          contextProfiles.map((profile) => (
            <ContextCard key={profile.id} profile={profile} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
