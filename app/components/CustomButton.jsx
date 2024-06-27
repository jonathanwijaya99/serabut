import { TouchableOpacity, Text } from 'react-native'
import React from 'react'

const CustomButton = ({ title, handlePress, className, style, textStyles, isLoading, unstyled}) => {
  return (
    <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className={`rounded-xl ${!unstyled && 'min-h-[62px]'} justify-center items-center ${className} ${isLoading ? 'opacity-50' : ''}`}
        style={style}
        disabled={isLoading}
    >
      <Text className={`text-primary font-psemibold text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  )
}

export default CustomButton