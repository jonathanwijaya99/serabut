import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { icons } from '../constants'

const FormField = ({title, value, placeholder, style, handleChangeText, ...props}) => {
    const [showPassoword, setshowPassoword] = useState(false)
  return (
    <View className={`space-y-2 ${style}`}>
      <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

      <View className="border-2 border-black-200 rounded-2xl focus:border-secondary items-center w-full h-16 px-4 bg-black-100 flex-row">
        <TextInput
            className="flex-1 text-white font-psemibold text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7b7b8b"
            onChangeText={handleChangeText}
            secureTextEntry={title === 'Password' && !showPassoword}
        />

        {title === 'Password' && (
            <TouchableOpacity onPress={() => setshowPassoword(!showPassoword)}>
                <Image
                    source={!showPassoword ? icons.eye : icons.eyeHide}
                    className="w-6 h-6"
                    resizeMode='contain'
                />
            </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField