import { Avatar, HStack ,Text} from '@chakra-ui/react'
import React from 'react'

const Message = ({text,uri,user="other"}) => {
  return (
    <>
    <HStack alignSelf={user==="me"?"flex-end":'flex-start'} borderRadius={"base"} bg='gray.100' paddingX={2} paddingY={"4"}>
         {
             user==='other'&& <Avatar src={uri}/>
         }
         
         <Text>{text}</Text>
         {
             user==='me'&& <Avatar src={uri}/>
         }
    </HStack>

   </> 
  )
}

export default Message