// components/WelcomeScreen.js
const Emptycard = () => {
  return (
    <div className="flex items-center justify-center min-h-screen  from-blue-400 to-purple-500 text-white text-center p-5">
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-3xl font-bold mb-4">Welcome to Our Chat App</h1>
        <p className="mb-6">
          Connect with friends, share your thoughts, and make every conversation count!
          This app provides an engaging space to chat with your loved ones in real-time.
        </p>
      
      </div>
    </div>
  );
};

export default Emptycard;