import React, { useEffect, useRef, useState } from 'react';
import { Button, Box, Container, VStack, HStack, Input } from '@chakra-ui/react';
import { Heading } from '@chakra-ui/react'
import Message from './Components/Message';
import { onAuthStateChanged, getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { app } from './firebase'
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore"

const auth = getAuth(app);
const db = getFirestore(app);

const loginhandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
};

const logouthandler = () => {
  signOut(auth);
}

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const divforscroll = useRef(null);

  const submithandler = async (e) => {
    e.preventDefault();
    try {
      setMessage("");
      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL, 
        createdat: serverTimestamp(),
      });

      divforscroll.current.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    const q = query(collection(db, "Messages"), orderBy("createdat", "asc"));
    const unsuscribe = onAuthStateChanged(auth, (userData) => {
      setUser(userData);
    });

    const unsuscribeformessage = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => {
      unsuscribe();
      unsuscribeformessage();
    };
  }, []);

  return (
    <Box bg={"gray.300"}>
      {user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack h="full" bg={"telegram.100"} padding={4}>
            <Button onClick={logouthandler} colorScheme='teal' size='md'>Logout</Button>
            <VStack h="full" w={"full"} bg="purple.50" border="1px solid black" p={4} borderRadius="md" overflowY={"auto"} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
              {messages.map(item => (
                <Message key={item.id} user={item.uid === user.uid ? "me" : "other"} text={item.text} uri={item.uri} />
              ))}
              <div ref={divforscroll}></div>
            </VStack>
            <form onSubmit={submithandler} style={{ width: "100%" }}>
              <HStack>
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Enter a message....' focusBorderColor='blue.500' border="1px solid black" p={4} borderRadius="md" backgroundColor={'white'} />
                <Button colorScheme='twitter' type='submit'>Send</Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack h='100vh' justifyContent={'center'} bg="black">
          <Heading as='h1' size='4xl' noOfLines={1} color="cyan.500" paddingY={"2"}>Let's Chat</Heading>
          <Button onClick={loginhandler}>Start with Google</Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
         