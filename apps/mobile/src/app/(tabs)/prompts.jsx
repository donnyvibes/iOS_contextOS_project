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
import { Link } from "expo-router";
import {
  useFonts,
  InstrumentSans_400Regular,
  InstrumentSans_400Regular_Italic,
  InstrumentSans_600SemiBold,
} from "@expo-google-fonts/instrument-sans";
import {
  Plus,
  Star,
  MoreVertical,
  Clock,
  Tag,
  FileText,
  Search,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import SearchField from "@/components/SearchField";
import FilterChips from "@/components/FilterChips";

export default function PromptsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [fontsLoaded] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_400Regular_Italic,
    InstrumentSans_600SemiBold,
  });

  // Fetch prompts data
  const {
    data: allPrompts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["prompts", activeFilter, searchText],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== "All") {
        params.append("category", activeFilter);
      }
      if (searchText.trim()) {
        params.append("search", searchText.trim());
      }

      const response = await fetch(`/api/prompts?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prompts");
      }
      return response.json();
    },
  });

  // Fetch recent prompts
  const { data: recentPrompts = [] } = useQuery({
    queryKey: ["prompts", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/prompts?recent=true");
      if (!response.ok) {
        throw new Error("Failed to fetch recent prompts");
      }
      return response.json();
    },
    enabled: !searchText && activeFilter === "All",
  });

  // Fetch favorited prompts
  const { data: favoritedPrompts = [] } = useQuery({
    queryKey: ["prompts", "favorites"],
    queryFn: async () => {
      const response = await fetch("/api/prompts?favorites=true");
      if (!response.ok) {
        throw new Error("Failed to fetch favorited prompts");
      }
      return response.json();
    },
    enabled: !searchText && activeFilter === "All",
  });

  if (!fontsLoaded) {
    return null;
  }

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["prompts"] });
  };

  const filters = ["All", "Writing", "Code", "Creative", "Business"];

  const getCategoryColor = (category) => {
    const colors = {
      Code: "#10B981",
      Creative: "#8B5CF6",
      Business: "#F59E0B",
      Writing: "#3B82F6",
    };
    return colors[category] || theme.colors.textSecondary;
  };

  const formatLastUsed = (lastUsed) => {
    const date = new Date(lastUsed);
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

  const PromptCard = ({ prompt, isCompact = false }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        borderRadius: 16,
        padding: isCompact ? 16 : 20,
        marginBottom: 12,
        width: isCompact ? 280 : "100%",
        marginRight: isCompact ? 16 : 0,
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
              fontSize: isCompact ? 16 : 18,
              color: theme.colors.text,
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {prompt.title}
          </Text>
          {prompt.is_favorited && (
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: getCategoryColor(prompt.category) + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "InstrumentSans_600SemiBold",
                fontSize: 10,
                color: getCategoryColor(prompt.category),
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {prompt.category}
            </Text>
          </View>

          <TouchableOpacity>
            <MoreVertical size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={{
          fontFamily: "InstrumentSans_400Regular",
          fontSize: 14,
          color: theme.colors.textSecondary,
          lineHeight: 20,
          marginBottom: 12,
        }}
        numberOfLines={isCompact ? 2 : 3}
      >
        {prompt.description}
      </Text>

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
            {formatLastUsed(prompt.last_used)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => {
    const hasSearch = searchText.trim().length > 0;
    const hasFilter = activeFilter !== "All";

    let title, description, icon;

    if (hasSearch) {
      title = "No prompts found";
      description = `No prompts match "${searchText}". Try adjusting your search.`;
      icon = <Search size={48} color={theme.colors.textTertiary} />;
    } else if (hasFilter) {
      title = `No ${activeFilter.toLowerCase()} prompts`;
      description = `You don't have any ${activeFilter.toLowerCase()} prompts yet.`;
      icon = <Tag size={48} color={theme.colors.textTertiary} />;
    } else {
      title = "No prompts yet";
      description = "Create your first prompt to get started.";
      icon = <FileText size={48} color={theme.colors.textTertiary} />;
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
          Prompts
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
        placeholder="Search Prompts"
        isFocused={isSearchFocused}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        style={{
          marginHorizontal: 26,
          marginBottom: 16,
        }}
      />

      <FilterChips
        filters={filters}
        activeFilter={activeFilter}
        onFilterPress={setActiveFilter}
        style={{
          marginHorizontal: 26,
          marginBottom: 24,
          height: 42,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
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
        {!searchText && activeFilter === "All" && (
          <>
            {/* Recently Used Section */}
            {recentPrompts.length > 0 && (
              <View style={{ marginBottom: 32 }}>
                <View style={{ paddingHorizontal: 26, marginBottom: 16 }}>
                  <Text
                    style={{
                      fontFamily: "InstrumentSans_600SemiBold",
                      fontSize: 18,
                      color: theme.colors.text,
                    }}
                  >
                    Recently Used
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 26 }}
                >
                  {recentPrompts.map((prompt) => (
                    <PromptCard
                      key={`recent-${prompt.id}`}
                      prompt={prompt}
                      isCompact
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Favorites Section */}
            {favoritedPrompts.length > 0 && (
              <View style={{ marginBottom: 32 }}>
                <View style={{ paddingHorizontal: 26, marginBottom: 16 }}>
                  <Text
                    style={{
                      fontFamily: "InstrumentSans_600SemiBold",
                      fontSize: 18,
                      color: theme.colors.text,
                    }}
                  >
                    Favorites
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 26 }}
                >
                  {favoritedPrompts.map((prompt) => (
                    <PromptCard
                      key={`favorite-${prompt.id}`}
                      prompt={prompt}
                      isCompact
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* All Prompts Section */}
            <View style={{ paddingHorizontal: 26, marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: "InstrumentSans_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                All Prompts
              </Text>
            </View>
          </>
        )}

        <View style={{ paddingHorizontal: 26 }}>
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
                Loading prompts...
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
                Failed to load prompts. Pull to refresh.
              </Text>
            </View>
          ) : allPrompts.length === 0 ? (
            <EmptyState />
          ) : (
            allPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
