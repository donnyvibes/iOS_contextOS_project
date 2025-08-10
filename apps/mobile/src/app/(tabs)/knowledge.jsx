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
  BookOpen,
  MoreVertical,
  Clock,
  Tag,
  Search,
  FileText,
  Link as LinkIcon,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import SearchField from "@/components/SearchField";
import FilterChips from "@/components/FilterChips";

export default function KnowledgeScreen() {
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

  // Fetch knowledge bases data
  const {
    data: knowledgeBases = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["knowledge-bases", activeFilter, searchText],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== "All") {
        params.append("category", activeFilter);
      }
      if (searchText.trim()) {
        params.append("search", searchText.trim());
      }

      const response = await fetch(`/api/knowledge-bases?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch knowledge bases");
      }
      return response.json();
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
  };

  const filters = [
    "All",
    "Technical",
    "Research",
    "Reference",
    "Documentation",
  ];

  const getCategoryColor = (category) => {
    const colors = {
      Technical: "#10B981",
      Research: "#8B5CF6",
      Reference: "#F59E0B",
      Documentation: "#3B82F6",
    };
    return colors[category] || theme.colors.textSecondary;
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

  const KnowledgeCard = ({ knowledgeBase, isCompact = false }) => (
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
            {knowledgeBase.title}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: getCategoryColor(knowledgeBase.category) + "20",
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
                color: getCategoryColor(knowledgeBase.category),
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {knowledgeBase.category}
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
        {knowledgeBase.description}
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
            {formatLastUpdated(knowledgeBase.last_updated)}
          </Text>
        </View>

        {knowledgeBase.linked_contexts &&
          knowledgeBase.linked_contexts.length > 0 && (
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
                {knowledgeBase.linked_contexts.length} context
                {knowledgeBase.linked_contexts.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => {
    const hasSearch = searchText.trim().length > 0;
    const hasFilter = activeFilter !== "All";

    let title, description, icon;

    if (hasSearch) {
      title = "No knowledge bases found";
      description = `No knowledge bases match "${searchText}". Try adjusting your search.`;
      icon = <Search size={48} color={theme.colors.textTertiary} />;
    } else if (hasFilter) {
      title = `No ${activeFilter.toLowerCase()} knowledge bases`;
      description = `You don't have any ${activeFilter.toLowerCase()} knowledge bases yet.`;
      icon = <Tag size={48} color={theme.colors.textTertiary} />;
    } else {
      title = "No knowledge bases yet";
      description = "Create your first knowledge base to get started.";
      icon = <BookOpen size={48} color={theme.colors.textTertiary} />;
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
          Knowledge
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
        placeholder="Search Knowledge Bases"
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
              Loading knowledge bases...
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
              Failed to load knowledge bases. Pull to refresh.
            </Text>
          </View>
        ) : knowledgeBases.length === 0 ? (
          <EmptyState />
        ) : (
          knowledgeBases.map((knowledgeBase) => (
            <KnowledgeCard
              key={knowledgeBase.id}
              knowledgeBase={knowledgeBase}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
