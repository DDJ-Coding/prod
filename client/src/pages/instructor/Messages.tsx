import MessageList from "@/components/messaging/MessageList";

const InstructorMessages = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Messages</h1>
        <p className="text-gray-600">Communicate with your students</p>
      </header>
      
      <MessageList />
    </div>
  );
};

export default InstructorMessages;