import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ReviewListPage from './pages/ReviewListPage';
import AddReviewPage from './pages/AddReviewPage';
import EditPage from './pages/EditPage'; 

function App() {
  return (
    <BrowserRouter>

      <div className="bg-rose-50 min-h-screen text-gray-800 p-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 border-b-2 border-blue-500 pb-2">
          Movie Reviews
        </h1>


        <Routes>

          <Route path="/" element={<ReviewListPage />} />


          <Route path="/reviews/new" element={<AddReviewPage />} />


          <Route path="/reviews/:rno/edit" element={<EditPage />} />


        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;