import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Appbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "react-native-paper";

const reportsData = [
  {
    category: "Customer Reports",
    icon: "people-outline",
    reports: [
      {
        title: "Active Customers Report",
        description: "List of all active customers with details like name, phone, and balance.",
        route: "/reports/customer/active",
      },
      {
        title: "Dormant Customers Report",
        description: "List of all dormant customers with last activity date.",
        route: "/reports/customer/dormant",
      },
      {
        title: "Age Analysis Report",
        description: "Pending payments grouped by months overdue.",
        route: "/reports/customer/age-analysis",
      },
      {
        title: "Garbage Collection Day Report",
        description: "Customers grouped by garbage collection day.",
        route: "/reports/customer/collection-day",
      },
      {
        title: "Customer Balance Report",
        description: "Customers grouped by closing balance range.",
        route: "/reports/customer/balance",
      },
    ],
  },
  {
    category: "Financial Reports",
    icon: "cash-outline",
    reports: [
      {
        title: "Monthly Invoice Report",
        description: "Invoices generated in a specific month.",
        route: "/reports/financial/monthly-invoice",
      },
      {
        title: "Payment Report",
        description: "List of all payments with details.",
        route: "/reports/financial/payment",
      },
      {
        title: "Outstanding Balances Report",
        description: "Customers grouped by balance range.",
        route: "/reports/financial/outstanding-balances",
      },
      {
        title: "Receipt Report",
        description: "Receipts issued during a specific period.",
        route: "/reports/financial/receipt",
      },
    ],
  },
  {
    category: "Garbage Collection Reports",
    icon: "trash-outline",
    reports: [
      {
        title: "Garbage Collection History Report",
        description: "All garbage collections by date and status.",
        route: "/reports/garbage/history",
      },
      {
        title: "Garbage Collection Day Summary",
        description: "Collections grouped by the day of the week.",
        route: "/reports/garbage/day-summary",
      },
    ],
  },
];

const ReportsPage = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const router = useRouter();
  const theme = useTheme();

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.reportItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(item.route)}
    >
      <Text style={[styles.reportTitle, { color: theme.colors.primary }]}>{item.title}</Text>
      <Text style={styles.reportDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={[
          styles.categoryHeader,
          { backgroundColor: theme.colors.primaryContainer },
        ]}
        onPress={() => toggleCategory(item.category)}
      >
        <View style={styles.categoryHeaderContent}>
          <Ionicons name={item.icon} size={24} color={theme.colors.onPrimaryContainer} />
          <Text style={[styles.categoryTitle, { color: theme.colors.onPrimaryContainer }]}>
            {item.category}
          </Text>
        </View>
        <Ionicons
          name={expandedCategory === item.category ? "chevron-up-outline" : "chevron-down-outline"}
          size={20}
          color={theme.colors.onPrimaryContainer}
        />
      </TouchableOpacity>
      {expandedCategory === item.category && (
        <FlatList
          data={item.reports}
          keyExtractor={(report) => report.title}
          renderItem={renderReportItem}
        />
      )}
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/featured/?business,abstract" }}
      style={styles.background}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content title="Reports" titleStyle={styles.appBarTitle} />
      </Appbar.Header>
      <FlatList
        data={reportsData}
        keyExtractor={(item) => item.category}
        renderItem={renderCategory}
        contentContainerStyle={styles.contentContainer}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  contentContainer: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  reportItem: {
    padding: 16,
    marginTop: 8,
    borderRadius: 8,
    elevation: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reportDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default ReportsPage;
