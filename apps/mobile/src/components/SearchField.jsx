import React from "react";
import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  isFocused,
  onFocus,
  onBlur,
  style = {},
  fontFamily = "InstrumentSans_400Regular_Italic",
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          paddingHorizontal: 0,
          marginBottom: 12,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: isFocused
            ? theme.colors.inputBackgroundFocused
            : theme.colors.inputBackground,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          height: 52,
          width: "100%",
        }}
      >
        <Search size={24} color={theme.colors.textSecondary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            fontFamily,
            fontSize: 16,
            color: theme.colors.text,
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    </View>
  );
}