import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JobListScreen from '../../../components/screens/JobListScreen';

const Stack = createStackNavigator();

// Навигация для раздела услуг
const JobsLayout = () => {
  return (
    <Stack.Navigator initialRouteName="JobList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobList" component={JobListScreen} />
      {/* Здесь могут быть дополнительные экраны, связанные с услугами */}
      {/* <Stack.Screen name="JobDetails" component={JobDetailsScreen} /> */}
    </Stack.Navigator>
  );
};

export default JobsLayout; 