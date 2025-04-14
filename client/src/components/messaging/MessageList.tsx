import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  profileImage?: string;
}

const MessageList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Fetch contacts
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ["/api/messages/contacts"],
    enabled: !!user,
  });

  // Fetch messages for selected contact
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/messages", selectedContact?.id],
    enabled: !!selectedContact?.id,
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { receiverId: number; content: string }) => {
      const response = await apiRequest(
        "POST",
        "/api/messages",
        message
      );
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/contacts"] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/messages/read/${contactId}`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/contacts"] });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when selecting a contact
  useEffect(() => {
    if (selectedContact && selectedContact.unreadCount > 0) {
      markAsReadMutation.mutate(selectedContact.id);
    }
  }, [selectedContact]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedContact) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedContact.id,
      content: newMessage,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
      {/* Contacts */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Your conversations</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-[calc(75vh-150px)]">
            {isLoadingContacts ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {contacts.map((contact: Contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-3 rounded-md flex items-center cursor-pointer ${
                      selectedContact?.id === contact.id
                        ? "bg-primary/10"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={contact.profileImage} alt={contact.name} />
                      <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                        {contact.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {new Date(contact.lastMessageTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate">{contact.lastMessage || "No messages yet"}</p>
                        {contact.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="lg:col-span-2 flex flex-col">
        {!selectedContact ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg font-medium">Select a contact to start messaging</p>
            <p className="text-sm">Your messages will appear here</p>
          </div>
        ) : (
          <>
            <CardHeader className="border-b pb-3">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedContact.profileImage} alt={selectedContact.name} />
                  <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{selectedContact.name}</CardTitle>
                  <CardDescription>{selectedContact.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <ScrollArea className="h-[calc(75vh-200px)] p-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: Message, index: number) => {
                      const isSender = message.senderId === user?.id;
                      const isNewDay = index === 0 || (
                        new Date(message.timestamp).toDateString() !== 
                        new Date(messages[index - 1].timestamp).toDateString()
                      );

                      return (
                        <div key={message.id}>
                          {isNewDay && (
                            <div className="flex justify-center my-4">
                              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex ${
                              isSender ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                isSender
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 text-right ${
                                  isSender ? "text-primary-50" : "text-gray-500"
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-3">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={newMessage.trim() === "" || sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default MessageList;