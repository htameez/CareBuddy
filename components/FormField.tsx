import { View, TextInput, TextInputProps, Image } from "react-native";
import React, { useState } from "react";

interface FormFieldProps extends TextInputProps {
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  icon?: any; // Accepts an image source
}

const FormField: React.FC<FormFieldProps> = ({
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center justify-center px-4 bg-[#F0F0F0] w-[338px] h-[61.7px] rounded-[10px] border-2
      ${isFocused ? "border-primaryLight" : "border-transparent"} ${otherStyles}`}
    >
      {/* ✅ Icon on the Left */}
      {icon && <Image source={icon} className="w-[50px] h-[50px]" resizeMode="contain" />}

      {/* ✅ Text Input (Vertically Centered) */}
      <TextInput
        className="flex-1 text-lg font-iregular text-black pl-[15px] h-full"
        value={value}
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.5)"
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );
};

export default FormField;