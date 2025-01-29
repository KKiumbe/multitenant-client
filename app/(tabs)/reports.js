
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { Appbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing"; // ✅ Use expo-sharing
import axios from "axios";
import base64 from "base-64";

// Reports Data with Downloadable Endpoints
const reportsData = [
  {
    category: "Customer Reports",
    icon: "people-outline",
    reports: [
      {
        title: "Active Customers Report",
        description: "List of all active customers with details like name, phone, and balance.",
        endpoint: "/reports/customers",
      },
      {
        title: "Dormant Customers Report",
        description: "List of all dormant customers with last activity date.",
        endpoint: "/reports/dormant'",
      },
      {
        title: "Age Analysis Report",
        description: "Pending payments grouped by months overdue.",
        endpoint: "/reports/age-analysis",
      },
      {
        title: "Garbage Collection Day Report",
        description: "Customers grouped by garbage collection day.",
        endpoint: "/reports/customer-per-collection-day",
      },
      {
        title: "Customers with High Balance Report",
        description: "Customers with more than twice their monthly charge.",
        endpoint: "/reports/customers-debt-high",
      },
      {
        title: "Customer with low Balance Report",
        description: "Customers with balance less than their monthly charge.",
        endpoint: "/reports/customers-debt-low",
      },
    ],
  },
  {
    category: "Financial Reports",
    icon: "cash-outline",
    reports: [

      {
        title: "Monthly Income Report",
        description: "Income generated in a specific month.",
        endpoint: "/reports/income",
      },
      {
        title: "Monthly Invoice Report",
        description: "Invoices generated in a specific month.",
        endpoint: "/reports/monthly-invoice",
      },
      {
        title: "Payment Report",
        description: "List of all payments with details.",
        endpoint: "/reports/payments",
      },
      {
        title: "Outstanding Balances Report",
        description: "All Customers Balance for current month.",
        endpoint: "/reports/outstanding-balances",
      },
      {
        title: "Receipt Report",
        description: "Receipts issued during a specific period.",
        endpoint: "/reports/receipts",
      },
      {
        title: "Mpesa payments Report",
        description: "All mpesa payments report .",
        endpoint: "/reports/mpesa",
      },
    ],
  },
  // {
  //   category: "Garbage Collection Reports",
  //   icon: "trash-outline",
  //   reports: [
  //     {
  //       title: "Garbage Collection History Report",
  //       description: "All garbage collections by date and status.",
  //       endpoint: "/api/reports/garbage/history",
  //     },
  //     {
  //       title: "Garbage Collection Day Summary",
  //       description: "Collections grouped by the day of the week.",
  //       endpoint: "/api/reports/garbage/day-summary",
  //     },
  //   ],
  // },
];

// Function to Download and Open Report




// Function to Download and Open Report
const downloadAndOpenReport = async (endpoint, title) => {
  try {
    const fullUrl = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

    console.log("Downloading from URL:", fullUrl);

    const reportType = title.replace(/\s+/g, "_"); // Convert title to filename
    const downloadPath = FileSystem.documentDirectory + `invoice-${reportType}.pdf`;
 
    Alert.alert(
      "Download Confirmation",
      `Do you want to download ${title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download",
          onPress: async () => {
            try {
              // Fetch the report from the API
              const response = await axios.get(fullUrl, {
                responseType: "arraybuffer",
              });

              // Convert the ArrayBuffer to Base64
              const uint8Array = new Uint8Array(response.data);
              let binaryString = "";
              for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
              }
              const base64Data = base64.encode(binaryString);

              // Save the file
              await FileSystem.writeAsStringAsync(downloadPath, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
              });

              // Open the file using expo-sharing
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadPath);
              } else {
                Alert.alert("Error", "Sharing is not available on this device.");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to download the report.");
              console.error("Download error:", error);
            }
          },
        },
      ]
    );
  } catch (error) {
    Alert.alert("Error", "Something went wrong.");
    console.error(error);
  }
};


const ReportsPage = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const theme = useTheme();

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.reportItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => downloadAndOpenReport(item.endpoint, item.title)}
    >
      <Text style={[styles.reportTitle, { color: theme.colors.primary }]}>{item.title}</Text>
      <Text style={styles.reportDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={[styles.categoryHeader, { backgroundColor: theme.colors.primaryContainer }]}
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
        <FlatList data={item.reports} keyExtractor={(report) => report.title} renderItem={renderReportItem} />
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
