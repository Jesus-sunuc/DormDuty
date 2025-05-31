import { colors } from "@/constants/theme";
import { View, Text, ActivityIndicatorProps, ActivityIndicator } from "react-native";

const Loading = ({
    size = "large",
    color = colors.primary
}: ActivityIndicatorProps) => {
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ActivityIndicator size={size} color={color}/>
        </View>
    );
}

export default Loading;