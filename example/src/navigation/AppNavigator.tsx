import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PushEngageScreen from '../App';
import SendGoalScreen from '../SendGoalScreen';
import TriggerCampaignsScreen from '../TriggerCampaignsScreen';
import TriggerCampaignEntry from '../TriggerCampaignEntry';
import AlertEntryScreen from '../AlertEntryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4040FF',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '800',
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen name="PushEngage" component={PushEngageScreen} />
        <Stack.Screen name="SendGoal" component={SendGoalScreen} />
        <Stack.Screen 
          name="TriggerCampaigns" 
          component={TriggerCampaignsScreen}
          options={{ title: 'Trigger Campaigns' }}
        />
        <Stack.Screen 
          name="TriggerCampaignEntry" 
          component={TriggerCampaignEntry}
          options={{ title: 'Trigger Campaign' }}
        />
        <Stack.Screen 
          name="AlertEntry" 
          component={AlertEntryScreen}
          options={{ title: 'Alert Entry' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 