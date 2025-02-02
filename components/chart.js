import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

const CustomChart = ({ data }) => {
  // Extract series and slice colors from the data

  const pieData = data.map(item => ({
    value: item.value ?? 0,
    color: item.svg.fill,  // This is where we set the color for each slice
    text: item.key,        // Optional: Add labels for each slice
  }));
  return (
    <View style={styles.container}>
    
      <PieChart
         data={pieData} 
        width={screenWidth / 2}
        height={screenWidth / 2}
        radius={120}
        innerRadius={30}
        showText={true}
        textColor="#fff"
        textStyle={{ fontSize: 14 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CustomChart;
