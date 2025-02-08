import { View, TextInput, TextInputProps, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import icons from "../constants/icons";

interface FormFieldProps extends TextInputProps {
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  icon?: any;
}

const FormField: React.FC<FormFieldProps> = ({
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  icon,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      className={`flex-row items-center px-4 bg-[#F0F0F0] w-[338px] h-[61.7px] rounded-[10px] border-2
      ${isFocused ? "border-primaryLight" : "border-transparent"} ${otherStyles}`}
    >
      {/* ✅ Left Icon */}
      {icon && <Image source={icon} className="w-[40px] h-[40px]" resizeMode="contain" />}

      {/* ✅ Text Input */}
      <TextInput
        className="flex-1 text-lg font-iregular text-black pl-[30px] h-full"
        value={value}
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.5)"
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry && !showPassword}
        {...props}
      />

      {/* ✅ Password Toggle */}
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={showPassword ? icons.eye : icons.eyeHide}
            className="w-[24px] h-[24px]"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FormField;