import { Text, View } from "react-native";
import { StatusBar } from "react-native";
import { Link } from 'expo-router';

const App: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-3xl text-white font-pregular">CareBuddy</Text>
      <StatusBar style="auto" />
      <Link href="/home" style={{ color: 'blue' }}>Go to Home</Link>
    </View>
  );
};

export default App;