import React from 'react';
import { PieChart } from 'react-native-svg-charts';
import { Text, G } from 'react-native-svg';

const CustomPieChart = ({ data, chartStyle, labelStyle }) => {
  if (!data || data.length === 0) return null;

  const totalValue = data.reduce((sum, item) => sum + item.value, 0); // Calculate total sum

  const pieData = data.map((item, index) => ({
    value: item.value,
    svg: item.svg,
    key: `pie-${index}`,
    onPress: () => console.log(`${item.key} pressed`),
  }));

  const Labels = ({ slices }) =>
    slices.map((slice, index) => {
      const { pieCentroid, data } = slice;
      const percentage = ((data.value / totalValue) * 100).toFixed(1) + '%'; // Percentage based on total value

      return (
        <G key={`label-${index}`}>
          <Text
            x={pieCentroid[0]}
            y={pieCentroid[1]}
            fill={labelStyle?.color || 'white'}
            textAnchor={'middle'}
            alignmentBaseline={'middle'}
            fontSize={labelStyle?.fontSize || 10} // Reduced font size
            stroke={labelStyle?.stroke || 'black'}
            strokeWidth={labelStyle?.strokeWidth || 0.2}
          >
            {data.value} 
          </Text>
        </G>
      );
    });

  return (
    <PieChart
      style={[{ height: 200 }, chartStyle]}
      valueAccessor={({ item }) => item.value}
      data={pieData}
      spacing={0}
      outerRadius={'95%'}
    >
      <Labels />
    </PieChart>
  );
};

export default CustomPieChart;
