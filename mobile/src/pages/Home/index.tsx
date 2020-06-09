import React from 'react'
import {Feather as Icon} from '@expo/vector-icons'
import {View,ImageBackground, Image,Text} from 'react-native'
import styles from './styles'
import {RectButton} from 'react-native-gesture-handler'
import {useNavigation} from '@react-navigation/native'

const Home = () =>
{
  const navigation = useNavigation();

  function handleNavigateToPoints(){
    navigation.navigate('Points')
  }

  return (
    <ImageBackground 
      source={require('../../assets/home-background.png')} 
      imageStyle={{width: 274, height:368}}
      style={styles.container}>
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')}></Image>
          <Text style={styles.title}>Seu marketplace de coleta de residuos</Text>
          <Text style={styles.description}>Ajudamos pessoas à encontrarem pontos de coleta de forma eficiente.</Text>
        </View>

        <View style={styles.footer}>
            <RectButton style={styles.button} onPress={handleNavigateToPoints}>
              <View style={styles.buttonIcon}>
                <Text>
                  <Icon name="arrow-right" color="#fff" size={24}></Icon>
                </Text>
              </View>
              <Text style={styles.buttonText}>
                Entrar
              </Text>
            </RectButton>
        </View>  
    </ImageBackground>
  )
}

export default Home
