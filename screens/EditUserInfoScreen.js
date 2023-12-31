import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "../firebase";
import {
  ref,
  deleteObject,
  getDownloadURL,
  getStorage,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { Button } from "react-native-elements";
import color from "../components/color";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
const EditUserInfoScreen = ({ navigation, route }) => {
  const { idUser: idUser } = route.params;
  const [avatar, setAvatar] = useState("");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    getUser();
  }, []);

  // Update state inside the useEffect when data is fetched
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAddress(user.address);
      setEmail(user.email);
      setPhoneNumber(user.phone);
      setAvatar(user.photo);
      //avatar gg = https://lh3.googleusercontent.com/a/ACg8ocJqThobPEndy9LkFEa0Dafe3pgnkZlr41UjDT3bKIUb_oU=s96-c
    }
  }, [user]);

  useEffect(() => {
    // Log giá trị mới của loaiHangImg sau mỗi lần cập nhật
    console.log(avatar);
  }, [avatar]);

  const getUser = async () => {
    try {
      const docRef = doc(db, "user", idUser);
      const docSnap = await getDoc(docRef);

      // Set state only when data is available
      setUser(docSnap.data());
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const updateUser = async () => {
    try {
      if (name === "" || address === "") {
        Alert.alert("Thông báo", "Không được để trống");
      } else {
        setLoading(true)
        const docRef = doc(db, "user", idUser);
        await updateDoc(docRef, {
          name: name,
          address: address,
        });
        setLoading(false)
        //   const updatedDocSnap = await getDoc(docRef);
        Alert.alert("Thông báo", "Cập nhật thành công");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const changeAvatar = async () => {
    if (loading===false){
    // Chọn hình ảnh
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      
      setLoading(true);
      //Tách path ảnh từ firestorage link
      const urlAvatarFirebase = extractFileName(avatar);
      console.log(urlAvatarFirebase);
      //Xóa ảnh cũ khỏi firebase
      const storage = getStorage();

      const desertRef = ref(storage, "userImg/" + urlAvatarFirebase);
      // Delete the file
      deleteObject(desertRef)
        .then(() => {
          console.log("File deleted successfully");          
        })
        .catch((error) => {
          console.log("Xoa anh firebase loi", error);
        });

      // Lấy URI của hình ảnh đã chọn trong máy
      const newAvatarUri = result.assets[0].uri;

      //Upload ảnh mới lên firebase và return url ảnh
      const urlAvatar = await uploadImage(newAvatarUri)
      //Cập nhật url ảnh vào colection users
      const docRef = doc(db, "user", idUser);
        await updateDoc(docRef, {
          photo:urlAvatar,
        });
      // Lưu URI vào trạng thái
      setAvatar(urlAvatar);
      
      setLoading(false);
    }
    }
  };
  const uploadImage = async (avatarImage) => {
    const storage = getStorage();
    const storageRef = ref(storage, "userImg");
  
    const getCurrentTimestamp = () => {
      const date = new Date();
      return `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${date
        .getHours()
        .toString()
        .padStart(2, "0")}${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}${date.getSeconds().toString().padStart(2, "0")}`;
    };
  
    try {
      // Fetch the image
      const response = await fetch(avatarImage);
      const blob = await response.blob();
  
      // Create a filename
      const filename = idUser + `_${getCurrentTimestamp()}.jpg`;
  
      // Reference to the storage location
      const imageRef = ref(storageRef, filename);
  
      // Upload the image
      const snapshot = await uploadBytesResumable(imageRef, blob);
  
      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(snapshot.ref);
  
      console.log("Image has been uploaded.");
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }
  };
  

  const extractFileName = (url) => {
    const parts = url.split("%2F");
    const fileNameWithQuery = parts[parts.length - 1];
    const fileNameParts = fileNameWithQuery.split("?");
    const fileName = fileNameParts[0];
    return fileName;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 8 }}>
        {avatar === "" ? (
          <></>
        ) : (
          <>
            <View
  style={{
    marginVertical: 10,
    alignSelf: "center",
  }}
>
  {/* Image Container */}
  <View style={styles.imageContainer}>
    {loading && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.origin}/> 
      </View>
    )}
    <Image
      source={{ uri: avatar }}
      style={{
        width: 100,
        height: 100, 
        borderWidth: 5,
        borderColor: "white",
        borderRadius: 100,
      }}
    />
  </View>

  {/* Button */}
  <TouchableOpacity
    style={{
      backgroundColor: color.origin,
      padding: 5,
      alignSelf: "center",
      marginTop: -24,
      marginLeft: 60,
      borderRadius: 100,
    }}
    onPress={changeAvatar}
  >
    <FontAwesome5 name="exchange-alt" size={12} color="white" />
  </TouchableOpacity>
</View>

          </>
        )}
        <View style={styles.list_items}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ marginLeft: 10, fontSize: 16 }}>Tên tài khoản</Text>
            <Text style={{ color: "red" }}>*</Text>
          </View>
          <TextInput style={styles.input} onChangeText={setName} value={name} />
        </View>
        <View style={styles.list_items}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ marginLeft: 10, fontSize: 16 }}>Địa chỉ</Text>
            <Text style={{ color: "red" }}>*</Text>
          </View>
          <TextInput
            style={styles.input}
            onChangeText={setAddress}
            value={address}
          />
        </View>

        {/* <View style={styles.list_items}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ marginLeft: 10, fontSize: 16 }}>Email</Text>
            <Text style={{ color: "red" }}>*</Text>
          </View>
          <Text style={styles.input}>{email}</Text>
        </View>

        <View style={styles.list_items}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ marginLeft: 10, fontSize: 16 }}>Số điện thoại</Text>
            <Text style={{ color: "red" }}>*</Text>
          </View>
          <Text style={styles.input}>{phoneNumber}</Text>
        </View> */}
      </View>

      <View style={{}}>
        <Button title="Lưu" color={color.origin} onPress={updateUser} />
      </View>
    </View>
  );
};

export default EditUserInfoScreen;

const styles = StyleSheet.create({
  list_items: {
    marginVertical: 1,
    width: "100%",
    padding: 10,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  input: {
    marginLeft: 12,
  },
  
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure the loading indicator is above the image
  },
  imageContainer: {
    position: 'relative',
  },
});
