import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { useTheme, Avatar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  avatar?: string;
  phoneNumber: string;
  lastSeen: string;
  isOnline: boolean;
  isAddButton?: boolean;
};

type Message = {
  id: string;
  text: string;
  sender: string; // 'user' or family member ID
  timestamp: Date;
  isRead: boolean;
};

const ChatScreen = ({ route }: { route: any }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load family members from your data source (e.g., API, context, or storage)
  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        // TODO: Replace with actual data fetching
        // const members = await fetchFamilyMembers();
        // setFamilyMembers(members);
        
        // For now, set empty array and show empty state
        setFamilyMembers([
          {
            id: 'add-member',
            name: 'Add Family Member',
            relation: '',
            phoneNumber: '',
            lastSeen: '',
            isOnline: false,
            isAddButton: true,
          },
        ]);
      } catch (error) {
        console.error('Error loading family members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilyMembers();
  }, []);

  useEffect(() => {
    if (route.params?.memberId) {
      setActiveChat(route.params.memberId);
    }
    
    // Check if we're coming back from adding a new member
    if (route.params?.newMember) {
      setFamilyMembers(prev => {
        // Check if member already exists to avoid duplicates
        const exists = prev.some(m => m.id === route.params.newMember.id);
        return exists ? prev : [...prev, route.params.newMember];
      });
    }
  }, [route.params]);

  const handleSend = () => {
    if (!message.trim() || !activeChat) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      isRead: false,
    };
    
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));
    
    setMessage('');
    
    // Simulate a response after a short delay
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! I\'ll get back to you soon.',
        sender: activeChat,
        timestamp: new Date(),
        isRead: false,
      };
      setMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), response]
      }));
    }, 1000);
  };

  const handleAddFamilyMemberPress = useCallback(() => {
    navigation.navigate('AddFamilyMember' as never, {
      onAddMember: (newMember: FamilyMember) => {
        setFamilyMembers(prev => [...prev, newMember]);
        setActiveChat(newMember.id);
      }
    });
  }, [navigation]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const member = familyMembers.find(m => m.id === item.sender);
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.otherMessage
      ]}>
        {!isUser && member && (
          <Text style={[styles.senderName, { color: theme.colors.primary }]}>
            {member.name}
          </Text>
        )}
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isUser 
              ? theme.colors.primary 
              : theme.colors.surfaceVariant,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? 'white' : theme.colors.onSurface }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            { 
              color: isUser 
                ? 'rgba(255,255,255,0.7)' 
                : theme.colors.onSurfaceVariant 
            }
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {!isUser && !item.isRead && (
              <Text style={styles.unreadDot}> •</Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  const renderFamilyMember = ({ item }: { item: FamilyMember }) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity 
          style={[styles.addMemberButton, { borderColor: theme.colors.primary }]}
          onPress={handleAddFamilyMemberPress}
        >
          <MaterialCommunityIcons 
            name="plus" 
            size={24} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.addMemberText, { color: theme.colors.primary }]}>
            Add Family Member
          </Text>
        </TouchableOpacity>
      );
    }

    const unreadCount = messages[item.id]?.filter(m => 
      m.sender !== 'user' && !m.isRead
    ).length || 0;

    return (
      <TouchableOpacity 
        style={[
          styles.familyMember,
          activeChat === item.id && { 
            backgroundColor: theme.colors.surfaceVariant 
          }
        ]}
        onPress={() => setActiveChat(item.id)}
      >
        <View style={styles.memberInfo}>
          <Avatar.Text 
            size={48} 
            label={item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            style={{ backgroundColor: theme.colors.primary }}
            labelStyle={{ color: 'white', fontSize: 16 }}
          />
          <View style={styles.memberDetails}>
            <Text style={[styles.memberName, { color: theme.colors.onSurface }]}>
              {item.name}
            </Text>
            <Text style={[styles.memberRelation, { color: theme.colors.onSurfaceVariant }]}>
              {item.relation}
              {item.isOnline && (
                <Text style={[styles.onlineDot, { color: theme.colors.primary }]}>
                  {' '}• Online
                </Text>
              )}
            </Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const activeMember = familyMembers.find(m => m.id === activeChat);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons 
        name="account-group" 
        size={64} 
        color={theme.colors.primary} 
        style={styles.emptyStateIcon}
      />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
        No Family Members Yet
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
        Add family members to start chatting with them
      </Text>
      <Button
        mode="contained"
        onPress={handleAddFamilyMemberPress}
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        icon="account-plus"
      >
        Add Family Member
      </Button>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
          {activeChat ? 'Chat' : 'Messages'}
        </Text>
        {activeChat && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveChat(null)}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {activeChat ? (
        <>
          <FlatList
            data={messages[activeChat] || []}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
          />
          
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.outline
                }
              ]}
              value={message}
              onChangeText={setMessage}
              placeholder={`Message ${activeMember?.name || ''}...`}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: message.trim() ? theme.colors.primary : theme.colors.surfaceVariant,
                  opacity: message.trim() ? 1 : 0.5
                }
              ]}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <MaterialCommunityIcons 
                name="send" 
                size={24} 
                color={message.trim() ? 'white' : theme.colors.onSurfaceVariant} 
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <FlatList
          data={familyMembers}
          renderItem={renderFamilyMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.familyList}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
              Family Members
            </Text>
          }
        />
      )}
      
      {!activeChat && familyMembers.length <= 1 && (
        <Button 
          mode="contained" 
          onPress={handleAddFamilyMemberPress}
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ color: 'white' }}
          icon="account-plus"
        >
          Add Family Member
        </Button>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
  familyList: {
    paddingBottom: 80,
  },
  familyMember: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRelation: {
    fontSize: 14,
    opacity: 0.7,
  },
  onlineDot: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    margin: 16,
    marginTop: 8,
  },
  addMemberText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 24,
    paddingVertical: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    marginBottom: 8,
    width: '100%',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 8,
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
  unreadDot: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default ChatScreen;
