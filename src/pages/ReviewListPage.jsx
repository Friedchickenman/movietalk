// src/pages/ReviewListPage.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // 라우팅 이동을 위해 useNavigate 훅 임포트


const TMDB_API_KEY = "518024ad458565e49a0e1c6656a66213"; // TMDb API 키 (주의: 보안상 백엔드 또는 환경변수 권장)

const ReviewListPage = () => {

  // 리뷰 목록 상태 및 로딩/에러 상태 관리
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 라우팅 이동을 위한 훅 사용
  const navigate = useNavigate();


  // 백엔드에서 리뷰 목록을 가져오는 함수
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://192.168.0.102:8080/api/reviews/list"); // 백엔드 목록 API 호출

      const reviewList = response.data;

      // TMDb에서 포스터 정보를 가져와 리뷰 데이터에 추가 (개선 필요 가능성 있음 - 백엔드 저장 고려)
      const updatedReviews = await Promise.all(
        reviewList.map(async (review) => {
           try {
              const tmdbRes = await axios.get(
                `https://api.themoviedb.org/3/search/movie`,
                {
                  params: {
                    api_key: TMDB_API_KEY,
                    query: review.movieTitle,
                    language: 'ko-KR'
                  },
                }
              );
              const movie = tmdbRes.data.results[0];
              const posterUrl = movie?.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null;

              return { ...review, imageUrl: posterUrl };
            } catch (err) {
              console.error(`TMDb 검색 실패: ${review.movieTitle}`, err);
              return { ...review, imageUrl: null };
            }
          })
        );

      // 리뷰 목록을 rno 기준으로 내림차순 정렬 (최신순)
      const sortedReviews = updatedReviews.sort((a, b) => b.rno - a.rno);
      setReviews(sortedReviews);

    } catch (error) {
      console.error("리뷰 목록 가져오기 실패", error);
      setError("리뷰 목록을 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트가 마운트될 때 (처음 로딩될 때) 리뷰 목록 가져오기
  useEffect(() => {
    fetchReviews();
  }, []); // 의존성 배열이 비어있으므로 마운트 시 단 한 번만 실행

  // 리뷰 삭제 핸들러
  const handleDelete = async (rno) => {
    if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://192.168.0.102:8080/api/reviews/${rno}`); // 백엔드 삭제 API 호출
        // 삭제 성공 시: 상태에서 해당 리뷰 제거하여 UI 즉시 업데이트
        setReviews((prevReviews) => prevReviews.filter((review) => review.rno !== rno));
        alert("리뷰가 삭제되었습니다.");
      } catch (error) {
        console.error("리뷰 삭제 실패", error);
        alert(`리뷰 삭제에 실패했습니다. 오류: ${error.message}`);
      }
    }
  };

  // 수정 버튼 클릭 시 해당 리뷰의 수정 페이지로 이동하는 함수
  const handleEdit = (review) => {
    // navigate 함수를 사용하여 '/reviews/:rno/edit' 경로로 이동 (rno는 리뷰 번호)
    navigate(`/reviews/${review.rno}/edit`);
  };


  // 로딩 중 또는 에러 발생 시 보여줄 JSX
  if (loading) {
    return <div>리뷰 목록을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="text-red-500">오류 발생: {error}</div>;
  }

  // 모든 준비가 되면 보여줄 JSX (리뷰 목록 본문)
  return (
    <div className="space-y-4"> {/* 리뷰 목록 전체를 감싸는 컨테이너 */}
      <h2 className="text-xl font-bold">리뷰 목록</h2> {/* 목록 제목 */}

      {/* 새 리뷰 작성 페이지로 이동하는 버튼 */}
      <button
         onClick={() => navigate('/reviews/new')} // 버튼 클릭 시 /reviews/new 경로로 이동
         className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
       >
         새 리뷰 작성
       </button>

      {/* 리뷰 목록 조건부 렌더링: 목록이 비어있거나 로딩/에러가 아닐 때 */}
      {reviews.length === 0 && !loading && !error ? (
        <div>등록된 리뷰가 없습니다.</div>
      ) : (
        // 리뷰 목록을 순회하며 각 리뷰를 화면에 표시
        reviews.map((review) => (
          <div key={review.rno} className="border rounded-lg p-4 shadow"> {/* 개별 리뷰 아이템 컨테이너 */}
            {/* 리뷰 아이템 내용 (포스터, 제목, 작성자, 내용, 평점) */}
            {review.imageUrl && (
              <div className="flex justify-center mb-4">
                <img
                  src={review.imageUrl}
                  alt={`${review.movieTitle} 포스터`}
                  className="w-32 h-48 object-cover rounded"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold">{review.movieTitle}</h3>
            <p><span className="font-medium">작성자:</span> {review.reviewer}</p>
            <p><span className="font-medium">내용:</span> {review.content}</p>
            <p><span className="font-medium">평점:</span> {review.grade}</p>

            {/* 수정 및 삭제 버튼 */}
             <button
               onClick={() => handleEdit(review)} // 수정 버튼 클릭 시 handleEdit 함수 호출 (수정 페이지로 이동)
               className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
             >
               수정
             </button>
            <button
              onClick={() => handleDelete(review.rno)} // 삭제 버튼 클릭 시 handleDelete 함수 호출 (리뷰 삭제)
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>

            {/* (참고: 원래 ReviewList에는 여기에 수정 폼이 조건부로 렌더링되는 코드가 있었지만, 이제 EditPage에서 담당) */}

          </div>
        ))
      )}
    </div>
  );
};

export default ReviewListPage; // ReviewListPage 컴포넌트 내보내기