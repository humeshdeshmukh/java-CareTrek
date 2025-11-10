import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { useTheme, Avatar, IconButton } from 'react-native-paper';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  read: boolean;
}

const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Mock data - replace with actual data from your API
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: '1',
        text: 'Hi there! How are you doing today?',
        sender: 'other',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
      },
      {
        id: '2',
        text: 'I\'m doing well, thanks for asking!',
        sender: 'user',
        timestamp: new Date(Date.now() - 1800000),
        read: true,
      },
      {
        id: '3',
        text: 'Did you take your medication this morning?',
        sender: 'other',
        timestamp: new Date(),
        read: false,
      },
    ];
    setMessages(initialMessages);
  }, []);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      read: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const timeString = item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View 
        style={[
          styles.messageContainer, 
          isUser ? styles.userMessageContainer : styles.otherMessageContainer
        ]}
      >
        {!isUser && (
          <Avatar.Icon 
            size={32} 
            icon="account" 
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]} 
          />
        )}
        <View 
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser 
                ? theme.colors.primary 
                : theme.colors.surfaceVariant,
            },
          ]}
        >
          <Text 
            style={[
              styles.messageText,
              { color: isUser ? 'white' : theme.colors.onSurface },
            ]}
          >
            {item.text}
          </Text>
          <Text 
            style={[
              styles.timestamp,
              { color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant },
            ]}
          >
            {timeString}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
        keyboardVerticalOffset={90}
      >
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
            },
          ]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
        />
        <TouchableOpacity 
          onPress={handleSend}
          style={[
            styles.sendButton,
            { backgroundColor: theme.colors.primary },
          ]}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 8,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ChatScreen;
