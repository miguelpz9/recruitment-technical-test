// Import React, React Native, Ethers, Redux, Etherspot
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-get-random-values';
import "@ethersproject/shims";
import { ethers } from "ethers";
import { Sdk, randomPrivateKey, EnvNames, NetworkNames } from 'etherspot';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { createStore } from 'redux';
import walletReducer from './WalletReducer';
import {addPk, addAddress, addSdk, updateBalance} from './WalletActions';

// Create Redux Store
const store = createStore(walletReducer);
// Create Navigator Stack
const Stack = createNativeStackNavigator();

/* I coded different pages, they are all coded in this file */

/* -- First Page -- */
/* Here you can create wallet or recover it if it is the first time, if you have alredy created a wallet, you can also access it directly */
const Welcome = ({ navigation }) => {
  // Check if we have alredy generated a private key to determine if we show the access wallet button
  const currentPk = useSelector((store) => store.wallets.currentPk);

  // Go to create wallet page
  const onPressNewWallet = () => {
    navigation.navigate('Wallet Generation')
  };
  // Go to recovery page
  const onPressRecoverWallet = () => {
    navigation.navigate('Wallet Recovery')
  };
  // Go to wallet page
  const onPressAccessWallet = () => {
    navigation.navigate('Wallet')
  };

  return (
      <SafeAreaView>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={'#ffffff'}
        />
        <View
          contentInsetAdjustmentBehavior="automatic"
          style={{height: '100%'}}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              flex: 1,
              height: '100%'
            }}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}> Welcome! </Text>
                <Text style={styles.sectionDescription}>
                  Generate a new wallet or recover it from your private key!
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                {/* Determine which buttons to show depending on if we alredy have a wallet generated */}
                {currentPk != '' ? <TouchableOpacity  onPress={onPressAccessWallet}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Access my wallet</Text>
                  </View>
                </TouchableOpacity > : <></>}
                {currentPk == '' ?<TouchableOpacity  onPress={onPressNewWallet}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Generate new wallet</Text>
                  </View>
                </TouchableOpacity >: <></>}
                {currentPk != '' ?<TouchableOpacity  onPress={onPressNewWallet}>
                  <View style={styles.altButton}>
                    <Text style={styles.altButtonText}>Generate new wallet</Text>
                  </View>
                </TouchableOpacity > : <></>}
                <TouchableOpacity  onPress={onPressRecoverWallet}>
                  <View style={styles.altButton}>
                    <Text style={styles.altButtonText}>Recover Wallet</Text>
                  </View>
                </TouchableOpacity >
              </View>
          </View>
        </View>
      </SafeAreaView>
  );
};

/* -- Create Wallet Page -- */
/* Here a private key will appear. You can go back or access your wallet from here */
const NewWallet = ({ navigation }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const currentPk = useSelector((store) => store.wallets.currentPk);
  
  useEffect(() => {
    // Generate new private key with etherspot
    let newPk = randomPrivateKey();
    // Add the PK to redux
    dispatch(addPk(newPk));
    console.log(newPk);
    async function getAddress(newPk) {
      // Generate Etherspot SDK
      const sdk = new Sdk(newPk, {
        env: EnvNames.TestNets,
        networkName: NetworkNames.Goerli
      });
      // Get account address using etherspot
      const output = await sdk.syncAccount();
      console.log("ADDRESS: ", output.address);
      // Get account balance using etherspot
      const output2 = await sdk.getAccountBalances();
      const balances = ethers.utils.formatEther(output2.items[0].balance.toNumber());
      console.log(balances);
      // Save address, sdk and balance with redux
      dispatch(addAddress(output.address));
      dispatch(addSdk(sdk));
      dispatch(updateBalance(balances));
    }
    getAddress(newPk);    
    setIsLoaded(true);
  }, []);

  const onPressWallet = () => {
    navigation.navigate('Wallet')
  };
  const onPressBack = () => {
    navigation.navigate('Welcome')
  };

  return (
      <SafeAreaView>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={'#ffffff'}
        />
        <View
          contentInsetAdjustmentBehavior="automatic"
          style={{height: '100%'}}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              flex: 1,
              height: '100%'
            }}>
              <View style={styles.sectionContainer}>
                <Text
                  style={styles.sectionTitle}>
                  {isLoaded ? currentPk : "LOADING..."}
                </Text>
                <Text
                  style={styles.sectionDescription}>
                  This is your private key, write it down for future recovery
                </Text>
              </View>
              <View style={styles.sectionContainer}>
              {isLoaded ? <TouchableOpacity  onPress={onPressWallet}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Access my wallet</Text>
                </View>
              </TouchableOpacity > : <></>}
              <TouchableOpacity  onPress={onPressBack}>
                <View style={styles.altButton}>
                  <Text style={styles.altButtonText}>Go back</Text>
                </View>
              </TouchableOpacity >
              </View>
          </View>
        </View>
      </SafeAreaView>
  );
};

/* -- The Wallet Page -- */
/* Here you can check your address and your ETH balance. You also have the ability to send ETH to other addresses and view the TX Hash  */
const Wallet = ({ navigation }) => {
  // States for Input fields
  const [receiverAdr, onChangeText] = useState("");
  const [sendAmount, onChangeNumber] = useState(null);
  // State for txHash if the user sends ETH
  const [txHash, setTxHash] = useState("");
  const dispatch = useDispatch();
  // Get everything from redux store
  const currentPk = useSelector((store) => store.wallets.currentPk);
  const sdk = useSelector((store) => store.wallets.currentSdk);
  const currentAdr = useSelector((store) => store.wallets.currentAdr);
  const balance = useSelector((store) => store.wallets.currentBalance);

  // Function to update the balance. Triggered after the user sends ETH
  async function updateBalances() {
    const output = await sdk.getAccountBalances();
    const balances = ethers.utils.formatEther(output2.items[0].balance.toNumber());
    console.log(balances);
    dispatch(updateBalance(balances));
  }

  const onPressSend = async () =>  {
    // Configure the connection to the Infura Goerli node
    const network = "goerli";
    const provider = new ethers.providers.InfuraProvider(
      'goerli',
      'e6cf5e2039db4c74ba878a4e1ae97497'
    );
    // Get gas from provider
    const gasPrice = await provider.getGasPrice();
    // Definition of the signer with PK and provider
    const signer = new ethers.Wallet(currentPk, provider);
    // Definition of the transaction object
    const tx = {
      from: signer.address,
      to: receiverAdr,
      value: ethers.BigNumber.from(ethers.utils.parseUnits(sendAmount, "ether")),
      gasPrice: gasPrice,
      gasLimit: ethers.utils.hexlify(21000), // 21 gwei
      nonce: await provider.getTransactionCount(signer.address, 'latest')
    };
    console.log(tx);
    // We estimate gas. Used for internal testing
    signer.estimateGas(tx).then((txObject) => {
      console.log(txObject);
    })
    // We send the tx
    signer.sendTransaction(tx).then((txObj) => {
      console.log('txObj', txObj);
      // We set the TX Hash so it can be displayed to user
      setTxHash(txObj.hash);
      // We update the balances
      updateBalances();
    })
  }

  const onPressBack = () => {
    navigation.navigate('Welcome')
  };

  return (
      <SafeAreaView>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={'#ffffff'}
        />
        <View
          contentInsetAdjustmentBehavior="automatic"
          style={{height: '100%'}}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              flex: 1,
              height: '100%'
            }}>
              <View style={styles.addressContainer}>
                <Text
                  style={styles.addressTitle}>
                  {currentAdr}
                </Text>
              </View>
              <View style={styles.addressContainer}>
                <Text
                  style={styles.addressTitle}>
                  Your ETH balance: {balance}
                </Text>
              </View>
              <View style={styles.sectionWalletContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeNumber}
                  value={sendAmount}
                  placeholder="Amount of ETH"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeText}
                  value={receiverAdr}
                  placeholder="Receiver Address"
                />
                <TouchableOpacity  onPress={onPressSend}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Send Ether</Text>
                  </View>
                </TouchableOpacity >
                <TouchableOpacity  onPress={onPressBack}>
                  <View style={styles.altButton}>
                    <Text style={styles.altButtonText}>Go back</Text>
                  </View>
                </TouchableOpacity >
              </View>
              {/* After a TX is sent successfully, we will display TX Hash */}
              {txHash != "" ? <View style={styles.addressContainer}>
                <Text
                  style={styles.addressTitle}>
                  ETH SENT! Your tx hash: {txHash}
                </Text>
              </View> : <></>}
          </View>
        </View>
      </SafeAreaView>
  );
};

/* -- Recover Wallet Page -- */
/* Here you can input a private key and your wallet will be recovered. You can access your wallet after it is recovered or go back */
const RecoverWallet = ({ navigation }) => {
  const [newPk, onChangeText] = React.useState("");
  const dispatch = useDispatch();

  const onPressRecover = async () =>  {
    try{
      // Save the inputed PK in redux store
      dispatch(addPk(newPk));
      console.log(newPk);
      // Get address and balances. Initialises SDK. Saves everything in redux store
      async function getAddress(newPk) {
        const sdk = new Sdk(newPk, {
          env: EnvNames.TestNets,
          networkName: NetworkNames.Goerli
        });
        const output = await sdk.syncAccount();
        console.log("ADDRESS: ", output.address);
        const output2 = await sdk.getAccountBalances();
        const balances = ethers.utils.formatEther(output2.items[0].balance.toNumber());
        console.log(balances);
        dispatch(addAddress(output.address));
        dispatch(addSdk(sdk));
        dispatch(updateBalance(balances))
      }
      getAddress(newPk);
      console.log("SUCCESS RECOVERING WALLET")    
      navigation.navigate("Wallet");
    } catch(e){
      console.log(e);
    }
  }

  const onPressBack = () => {
    navigation.navigate('Welcome')
  };

  return (
      <SafeAreaView>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={'#ffffff'}
        />
        <View
          contentInsetAdjustmentBehavior="automatic"
          style={{height: '100%'}}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              flex: 1,
              height: '100%'
            }}>
              <View style={styles.addressContainer}>
                <Text
                  style={styles.addressTitle}>
                  Input your Private Key
                </Text>
              </View>
              <View style={styles.sectionWalletContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeText}
                  value={newPk}
                  placeholder="Private Key"
                />
                <TouchableOpacity  onPress={onPressRecover}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Recover wallet</Text>
                  </View>
                </TouchableOpacity >
                <TouchableOpacity  onPress={onPressBack}>
                  <View style={styles.altButton}>
                    <Text style={styles.altButtonText}>Go back</Text>
                  </View>
                </TouchableOpacity >
              </View>
          </View>
        </View>
      </SafeAreaView>
  );
};

/* -- App definition -- */
/* Here all pages are defined */
const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Wallet Generation" component={NewWallet} />
          <Stack.Screen name="Wallet Recovery" component={RecoverWallet} />
          <Stack.Screen name="Wallet" component={Wallet} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

/* -- Styles -- */
/* Here the styles are defined */
const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingTop: '33%'
  },
  sectionWalletContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingTop: '10%'
  },
  addressContainer: {
    marginTop: 8,
    paddingHorizontal: 24
  },
  addressTitle: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center'
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center'
  },
  highlight: {
    fontWeight: '700',
  },
  button: {
    alignItems: "center",
    backgroundColor: "#009FFF",
    padding: 10,
    borderRadius:20
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    color:"#FFFFFF"
  },
  altButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius:0
  },
  altButtonText: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    color:"#009FFF"
  },
});

export default App;
