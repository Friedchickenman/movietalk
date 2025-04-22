import React, { useState, useEffect } from "react";
import axios from "axios";

const MovieSearch = ({ setSelectedMovie }) => {
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
          },
        }
      );
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("영화 검색 실패", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="영화 제목을 입력하세요"
        className="border p-2 rounded"
      />
      <button onClick={handleSearch} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
        검색
      </button>

      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((movie) => (
            <li
              key={movie.id}
              onClick={() => setSelectedMovie(movie)} // 영화 선택 시 selectedMovie로 전달
              className="cursor-pointer p-2 hover:bg-gray-200"
            >
              {movie.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MovieSearch;
