import {
  StyleSheet,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  View,
} from "react-native";
import React from "react";
import { useState } from "react";
import { Feather, SimpleLineIcons , AntDesign } from "@expo/vector-icons";
import { Input, Icon } from "react-native-elements";
import 'expo-dev-client'
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth'
import AuthGoogleButton from '../components/authGoogleButton'
import { useUser } from '../UserContext';
import { doc, getDoc, getFirestore, updateDoc, setDoc , getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";


const LoginScreen = ({navigation}) => {
  const { updateUser} = useUser();
  const [inputValue, setInputValue] = useState("");
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const clearInput = () => {
    setInputValue("");
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const onLoginSuccess = (user) => { 
    updateUser(user);
    console.log('Login success:', user);
    navigation.navigate('Main')
  }

  // const loginUser = async () => {
  //   try {
  //     if (password === "" || inputValue === "") {
  //       alert("Không được để trống");
  //       return;
  //     }  
  //     const userCollectionRef = collection(db, "user");
  //     const querySnapshot = await getDocs(userCollectionRef);
  
  //     let userFound = false;
  
  //     querySnapshot.forEach((doc) => {
  //       const userData = doc.data();
  //       // Kiểm tra thông tin đăng nhập
  //       if (
  //         (userData.hasOwnProperty("email") && userData.email === inputValue) ||
  //         (userData.hasOwnProperty("mobileNo") && userData.mobileNo === inputValue)
  //       ) {
  //         if (userData.hasOwnProperty("password") && userData.password === password) {
  //           userFound = true;
  //           const userId = doc.id;
  //           updateUser(userId)
  //         }
  //       }
  //     });
  
  //     if (!userFound) {
  //       Alert.alert("Thông báo", "Thông tin đăng nhập không đúng");
  //     }else{
  //       navigation.navigate("Main")
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const loginWithEmailAndPassword = async () => {
  
      if ( password == "" || inputValue == "") {
        alert( "Không được để trống");
        return;
      } 
      try {
        const userCredential = await auth().signInWithEmailAndPassword(inputValue, password);
        const user = userCredential.user;
        console.log('Đăng nhập thành công:', userCredential);
        onLoginSuccess(userCredential)
      } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
      }
  };

  return (
    <SafeAreaView style={{ width: "100%", alignItems: "center" }}>
      <View> 
        <Image
          style={{ width: 60, height: 80, top: 20 }}
          source={require("../assets/shopLogo.png")}
        />
      </View>
      <View style={{ width: "90%", top: 30 }}>
        <KeyboardAvoidingView behavior="padding">
          <Input
            placeholder="Email"
            onChangeText={(text) => setInputValue(text)}
            value={inputValue}
            leftIcon={<SimpleLineIcons name="user" size={24} color="#857E7C" />}
            rightIcon={
              inputValue ? (
                <AntDesign
                  name="close"
                  size={24}
                  color="#857E7C"
                  onPress={clearInput}
                />
              ) : null
            }
          />
          <Input
            secureTextEntry={!isPasswordVisible}
            placeholder="Mật khẩu"
            onChangeText={(text) => setPassword(text)}
            value={password}
            leftIcon={<SimpleLineIcons name="lock" size={24} color="#857E7C" />}
            rightIcon={
                <Feather 
                  name="eye-off" 
                  size={24} 
                  color="#857E7C" 
                  onPress={togglePasswordVisibility}
                />
            }
          />
        </KeyboardAvoidingView>
        <TouchableOpacity
          style={{
            backgroundColor: inputValue.length > 0 & password.length > 0 ? "#F1582C" : "lightgray",
            padding: 12,
            alignItems: "center",
          }}
          disabled={inputValue.length === 0}
          onPress={() => {
            loginWithEmailAndPassword()
          }}
        >
          <Text style={{ color: inputValue.length > 0 ? "white" : "#857E7C" }}>
            Đăng nhập
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20, alignItems:'flex-end'}} onPress={() => navigation.navigate('SmsLogin')}>
        {/* <TouchableOpacity style={{ marginTop: 20, alignItems:'flex-end'}} onPress={() => navigation.navigate('SMSLoginTest')}> */}

          <Text style={{ color:"blue"}}>Đăng nhập bằng SMS</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: 'center', marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#D5DBCD" }}></View>
          <Text style={{ color:"#857E7C"}}>Hoặc</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#D5DBCD"}}></View>
        </View>
        <AuthGoogleButton onLoginSuccess={onLoginSuccess} />
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor:'#D5DBCD',
            backgroundColor:'#357EFF',
            padding: 12,
            alignItems: "center",
            marginBottom: 10,
          }}
          onPress={() => {
            console.log("Facebook");
          }}
        > 
          
          <Text style={{color:'white'}}>Facebook</Text>
        </TouchableOpacity>
        <View style={{flexDirection:'row', justifyContent:'center', alignItems:"center", paddingTop:20}}>
          <Text>Bạn chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color:'blue'}}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
          
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
