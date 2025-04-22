import './App.css';
import ReviewList from './components/ReviewList';

function App() {
  return (
    <div className="bg-rose-50 min-h-screen text-gray-800 p-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">

      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 border-b-2 border-blue-500 pb-2">
        Movie Reviews
      </h1>
      <ReviewList />
    </div>
  );
}

export default App;