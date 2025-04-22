// src/components/MovieSearch.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";

const MovieSearch = ({ onMovieSelect }) => {

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie`,
        {
          params: {
            api_key: "518024ad458565e49a0e1c6656a66213",
            query: searchQuery,
            language: 'ko-KR',
          },
        }
      );
      setSearchResults(response.data.results);
      console.log("영화 검색 결과:", response.data.results);
    } catch (error) {
       console.error("영화 검색 실패", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="movie-search-container space-y-4">
      <div className="flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="영화 제목을 입력하세요"
          className="border p-2 rounded flex-grow"
        />
        <button onClick={handleSearch} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          검색
        </button>
      </div>

      {searchResults.length > 0 && (
        <ul className="space-y-2">
          {searchResults.map((movie) => (
            <li
              key={movie.id}
              className="p-2 border rounded flex justify-between items-center"
            >
                <div className="flex items-center">
                  {movie.poster_path && (
                    <img
                      src={`https://image.themoviedb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-12 h-auto mr-4 rounded flex-shrink-0"
                    />
                  )}
                  <div className="movie-info text-left">
                    <h3 className="text-lg font-semibold">{movie.title}</h3>
                    {movie.release_date && (
                      <p className="text-sm text-gray-600">{movie.release_date.substring(0, 4)}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onMovieSelect(movie)}
                  className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex-shrink-0"
                >
                  선택
                </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MovieSearch;