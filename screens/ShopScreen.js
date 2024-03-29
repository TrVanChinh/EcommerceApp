import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { CheckBox, Icon } from "react-native-elements";
import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useContext,
  useCallback,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import { useUser } from "../UserContext";

import {
  collection,
  doc,
  query,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const ShopScreen = ({ navigation, route }) => {
  const { shop } = route.params;
  const idShop = shop.id;
  // console.log("shop",idShop)
  const { height, width } = Dimensions.get("window");
  const [menu, setMenu] = useState(true);
  const [products, setProducts] = useState([]);
  const [categoryShop, setCategoryShop] = useState([]);
  useEffect(() => {
    fetchData(idShop);
    getCategoryShop(idShop);
  }, [idShop]);

  const fetchData = async (idShop) => {
    console.log(idShop);
    const q = query(collection(db, "product"), where("idShop", "==", idShop));
    const snapshot = await getDocs(q);
    const productsData = [];
    for (const productDoc of snapshot.docs) {
      const productId = productDoc.id;
      const productData = productDoc.data();

      const imageSnapshot = await getDocs(
        collection(doc(db, "product", productId), "image")
      );

      if (imageSnapshot.docs.length > 0) {
        const imageUrl = imageSnapshot.docs[0].data().url;
        productsData.push({
          id: productId,
          data: { ...productData, imageUrl },
        });
      }
    }
    setProducts(productsData);
  };

  const getCategoryShop = async (idShop) => {
    const CategorySnapshot = await getDocs(
      collection(doc(db, "user", idShop), "categoryShop")
    );
    const categoryData = CategorySnapshot.docs.map((doc) => doc.data());
    setCategoryShop(categoryData);
    console.log(categoryData);
  };

  const handleItem = (product) => {
    navigation.navigate("Detail", { product });
  };

  return (
    <View>
      <View
        style={{
          height: height * 0.12,
          width: width,
          backgroundColor: "#F1582C",
          justifyContent: "space-between",
          flexDirection: "row",
          padding: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            style={{ width: 60, height: 60, borderRadius: 26 }}
            source={{
              uri: shop.data.photo,
            }}
          />
          <Text
            style={{
              fontWeight: "bold",
              color: "white",
              fontSize: 18,
              paddingLeft: 10,
            }}
          >
            {shop.data.shopName}
          </Text>
        </View>
        <Pressable
          style={{
            paddingHorizontal: 16,
            borderRadius: 5,
            backgroundColor: "white",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#F1582C", fontSize: 14 }}>Theo dõi</Text>
        </Pressable>
      </View>
      <View
        style={{
          height: height * 0.06,
          width: width,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          style={{
            ...styles.buttonArrange,
            borderColor: menu ? "#F1582C" : "white",
          }}
          onPress={() => setMenu(true)}
        >
          <Text>Sản phẩm</Text>
        </Pressable>

        <Pressable
          style={{
            ...styles.buttonArrange,
            borderColor: !menu ? "#F1582C" : "white",
          }}
          onPress={() => setMenu(false)}
        >
          <Text>Danh mục</Text>
        </Pressable>
      </View>
      {/* <View
        style={{
          height: height * 0.88,
          width: width,
          backgroundColor: "green",
        }}
      >
        <Text>List</Text>
      </View> */}
      {menu ? (
        <View style={{ height: height * 0.75 }}>
          <FlatList
            numColumns={2}
            data={products}
            renderItem={({ item }) => {
              return (
                <Pressable
                  onPress={() => handleItem(item)}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: 5,
                  }}
                >
                  <View
                    style={{
                      width: width / 2,
                    }}
                  >
                    <Image
                      style={{
                        width: width / 2.5,
                        height: height / 4,
                        resizeMode: "cover",
                        borderRadius: 25,
                        margin: 10,
                      }}
                      source={{
                        uri: item.data.imageUrl,
                      }}
                    />
                    <View
                      style={{
                        width: 50,
                        position: "absolute",
                        marginTop: 20,
                        alignItems: "flex-end",
                        backgroundColor: "red",
                      }}
                    >
                      <Text style={{ color: "yellow" }}>
                        {item.data.discount}%
                      </Text>
                    </View>
                  </View>
                  <View style={{ width: width / 2 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 14, color: "red" }}
                    >
                      {item.data.name}
                    </Text>
                  </View>
                  <View style={{ width: 100, paddingBottom: 10 }}>
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 18,
                        color: "red",
                      }}
                    >
                      {item.data.price}đ
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          ></FlatList>
        </View>
      ) : (
        <View style={{ height: height * 0.88 }}>
          <ScrollView>
            {categoryShop?.map((item, index) => (
              <View key={index}>
                <Pressable style={styles.list_items}>
                  <View
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 10,
                    }}
                  >
                    <Text>{item.name}</Text>
                  </View>
                  <View
                    style={{
                      alignItems: "flex-end",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text></Text>
                    <SimpleLineIcons
                      marginLeft={15}
                      name="arrow-right"
                      size={10}
                      color="#60698a"
                    />
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default ShopScreen;

const styles = StyleSheet.create({
  buttonArrange: {
    flexDirection: "row",
    flex: 1,
    borderColor: "white",
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  list_items: {
    marginVertical: 1,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
    backgroundColor: "white",
  },
});
