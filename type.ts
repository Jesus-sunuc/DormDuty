
import {
    ActivityIndicator,
    ActivityIndicatorProps,
    ImageStyle,
    PressableProps,
    TextInput,
    TextInputProps,
    TextProps,
    TextStyle,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

export type ScreenWrapperProps = {
    style?: ViewStyle;
    children?: React.ReactNode;
    bg?: string;
};

export type ModalWrapperProps = {
    style?: ViewStyle;
    children?: React.ReactNode;
    bg?: string;
}

export type accountOptionType = {
    title: string;
    icon: React.ReactNode;
    bgColor?: string;
    routeName?: any;
}

export type TypoProps = {
    size?: number;
    color?: string;
    fontWeight?: TextStyle['fontWeight'];
    children: any 
}