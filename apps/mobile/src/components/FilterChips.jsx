import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function FilterChips({
  filters,
  activeFilter,
  onFilterPress,
  style = {},
}) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[
        {
          flexGrow: 0,
        },
        style,
      ]}
    >
      {filters.map((filter, index) => (
        <TouchableOpacity
          key={filter}
          onPress={() => onFilterPress(filter)}
          style={{
            backgroundColor:
              activeFilter === filter
                ? theme.colors.primary
                : theme.colors.buttonSecondary,
            paddingHorizontal: 16,
            height: "100%",
            justifyContent: "center",
            marginRight: index === filters.length - 1 ? 0 : 8,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              color:
                activeFilter === filter
                  ? "#FFFFFF"
                  : theme.colors.textSecondary,
              fontFamily: "InstrumentSans_600SemiBold",
              fontSize: 14,
            }}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}