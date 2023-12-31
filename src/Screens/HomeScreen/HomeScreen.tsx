import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  Modal,
  Button,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const HomeScreen = () => {
  const [userData, setUserData] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  // Function to toggle the modal's visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Function to handle the submission of the "Add Fund" button
  const handleAddFund = () => {
    // Open the modal to enter the amount
    toggleModal();
  };

  // Fetch recent transactions and pending payments when the component mounts
  useEffect(() => {
    // Fetch user data
    axios
      .get(
        'https://easypaybackend.onrender.com/api/user/652bc4824281dc2ad19ae6cf',
      )
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });

    // Fetch recent transactions
    axios
      .get('https://easypaybackend.onrender.com/api/recent-transactions')
      .then(response => {
        setRecentTransactions(response.data);
      })
      .catch(error => {
        console.error('Error fetching recent transactions:', error);
      });

    // Fetch pending payments
    axios
      .get('https://easypaybackend.onrender.com/api/pending-payments')
      .then(response => {
        setPendingPayments(response.data);
      })
      .catch(error => {
        console.error('Error fetching pending payments:', error);
      });
  }, []);

  // Function to add funds and close the modal
  const handleAddFunds = () => {
    const amountToAdd = parseFloat(addMoneyAmount);
    if (!isNaN(amountToAdd) && amountToAdd > 0) {
      // Prepare the data for the POST request
      const data = {
        fund_add: amountToAdd,
        userId: '652bc4824281dc2ad19ae6cf', // Replace with the actual user ID
      };

      // Make the POST request to add funds
      axios
        .post('https://easypaybackend.onrender.com/api/user/add_fund', data)
        .then(response => {
          // Update the wallet balance after a successful response
          setUserData(response.data);
          // Clear the input field
          setAddMoneyAmount('');

          // Show a pop-up alert box with the added amount
          Alert.alert(
            'Funds Added',
            `You have added $${amountToAdd} to your wallet.`,
          );
        })
        .catch(error => {
          console.error('Error adding funds:', error);
        });
    }

    // Close the modal
    toggleModal();
  };

  const formatDateToTime = timeString => {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };

    const formattedTime = new Date(timeString).toLocaleString(
      undefined,
      options,
    );
    return formattedTime;
  };

  const buttons = [{text: 'Account'}, {text: 'Debit Cards'}, {text: 'Loans'}];
  const iconData = [
    {name: 'bank-transfer', text: 'Bank Transfer'},
    {name: 'qrcode-scan', text: 'Scan QR Code'},
    {name: 'bank-transfer', text: 'UPI Transfer'},
    {name: 'chart-bar', text: 'View Expenses'},
  ];

  function alert(_arg0: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity key={index} style={styles.button}>
            <Text style={styles.txt}>{button.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.rectangleBox}>
        <View style={styles.innerRectangleBox}>
          <Text style={styles.demoAmount}>Wallet Balance</Text>
          <Text style={styles.demoAmount}>
            $
            {userData.bankAccount
              ? userData.bankAccount.fund.toFixed(2)
              : '0.00'}
          </Text>
        </View>
        <View style={styles.upiIdContainer}>
          <View style={styles.upiIdBox}>
            <Text style={styles.upiId}>UPI ID: {userData.upi_id || 'N/A'}</Text>
          </View>
          <TouchableOpacity onPress={() => alert('UPI ID copied')}>
            <MaterialCommunityIcons
              name="content-copy"
              // size={20}
              style={styles.copy}
            />
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>Enter Amount:</Text>
              <TextInput
                style={styles.input} // Apply the 'input' style
                placeholder="Amount"
                value={addMoneyAmount}
                onChangeText={text => setAddMoneyAmount(text)}
                keyboardType="numeric"
              />
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Submit"
                  style={styles.modalButton}
                  onPress={handleAddFunds}
                />
                <Button
                  title="Cancel"
                  style={styles.modalButton}
                  onPress={toggleModal}
                />
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.addMoneyBtn}>
          <TouchableOpacity onPress={handleAddFund}>
            <Text>Add Fund {' >'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.iconsContainer}>
        {iconData.map((icon, index) => (
          <View key={index} style={styles.iconBox}>
            <MaterialCommunityIcons name={icon.name} size={30} color="#000" />
            <Text style={styles.txt}>{icon.text}</Text>
          </View>
        ))}
      </View>
      <ScrollView style={styles.scrollContainer}>
        <Text style={[styles.txt, styles.title]}>Recent Transactions:</Text>
        <View style={styles.recentPayments}>
          <>
            {recentTransactions.map((payment, index) => (
              <View key={index} style={styles.paymentRow}>
                {
                  <>
                    <Image
                      source={{uri: payment.senderImage}}
                      style={styles.profileImage}
                    />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>
                        {payment.senderName}
                      </Text>
                      <Text style={styles.time}>
                        {formatDateToTime(payment.time)} From:{' '}
                        {payment.bankName}
                      </Text>
                      <Text style={styles.amount}>
                        ${payment.amount.toFixed(2)}
                      </Text>
                    </View>
                  </>
                }
              </View>
            ))}
          </>
        </View>

        <Text style={[styles.txt, styles.title]}>Payments Pending:</Text>
        <View style={styles.pendingPayments}>
          <>
            {pendingPayments.map((payment, index) => (
              <View key={index} style={styles.paymentRow}>
                {
                  <>
                    <Image
                      source={{uri: payment.senderImage}}
                      style={styles.profileImage}
                    />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>
                        {payment.senderName}
                      </Text>
                      <Text style={styles.time}>
                        {formatDateToTime(payment.time)} From:{' '}
                        {payment.bankName}
                      </Text>
                      <Text style={styles.amount}>
                        ${payment.amount.toFixed(2)}
                      </Text>
                    </View>
                  </>
                }
              </View>
            ))}
          </>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingIcon}
        onPress={() => {
          console.log('Floating Icon Clicked');
        }}>
        <MaterialCommunityIcons name="qrcode-scan" size={30} color="#fff" />
        <Text style={styles.floatingIconText}>Scan &</Text>
        <Text style={styles.floatingIconText}>Pay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 10,
    marginLeft: 50,
  },
  button: {
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#82807c',
    backgroundColor: '#fff',
    color: '#000',
    padding: 10,
    marginRight: 10,
  },
  upiId: {
    fontSize: 15,
    color: '#000',
  },
  copy: {
    fontSize: 15,
    marginLeft: -80,
    color: '#000',
  },
  rectangleBox: {
    backgroundColor: '#EA1179',
    width: '90%',
    height: 180,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },
  innerRectangleBox: {
    backgroundColor: '#FF6AC2',
    width: '60%',
    paddingTop: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    paddingBottom: 10,
    marginLeft: 20,
  },
  demoAmount: {
    color: '#F1EFEF',
    marginTop: 5,
    fontSize: 20,
    fontWeight: 'bold',
  },
  upiIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 5,
    marginLeft: 20,
  },
  upiIdBox: {
    width: '90%',
  },
  addMoneyBtn: {
    marginLeft: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#000',
    borderRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalContent: {
    backgroundColor: '#000',
    width: '90%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    color: '#fff',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
    marginTop: 20,
  },
  iconBox: {
    alignItems: 'center',
    width: 70,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    paddingVertical: 10,
    marginRight: 15,
  },
  txt: {
    color: '#000',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    marginLeft: 15,
    marginTop: 5,
    textAlign: 'left',
  },
  paymentName: {
    color: '#000',
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  scrollContainer: {
    width: '95%',
    marginTop: 5,
  },
  recentPayments: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 15,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginVertical: 2,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  paymentInfo: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amount: {
    color: '#000',
    fontSize: 18,
    textAlign: 'right',
    fontWeight: 'bold',
    marginTop: -30,
  },
  time: {
    color: '#888',
    textAlign: 'left',
    fontSize: 12,
  },
  pendingPayments: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 15,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bank: {
    color: '#888',
  },
  floatingIcon: {
    position: 'absolute',
    bottom: 5,
    left: '35%',
    backgroundColor: '#000',
    width: 120,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  floatingIconText: {
    color: '#fff',
    marginLeft: 5,
  },
});

export default HomeScreen;
