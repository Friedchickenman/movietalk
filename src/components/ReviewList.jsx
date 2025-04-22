import React, { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm"; // 리뷰 폼 컴포넌트
import MovieSearch from "./MovieSearch"; // 영화 검색 컴포넌트
import axios from "axios";

const TMDB_API_KEY = "518024ad458565e49a0e1c6656a66213";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]); // 리뷰 목록 상태
  const [editingReview, setEditingReview] = useState(null); // 수정 중인 리뷰 상태 (객체 또는 null)
  const [selectedMovie, setSelectedMovie] = useState(null); // 새 리뷰 작성 시 선택된 영화 상태 (객체 또는 null)
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가

  // 리뷰 목록을 가져오는 함수 )
  const fetchReviews = async () => {
    setLoading(true); // 로딩 시작
    setError(null); // 이전 에러 초기화
    try {

      const response = await axios.get("http://192.168.0.102:8080/api/reviews/list");
      const reviewList = response.data;

      const updatedReviews = await Promise.all(
        reviewList.map(async (review) => {
           
          if (review.moviePosterPath) { // ReviewDTO에 moviePosterPath 필드를 추가했다면 이 조건문이 유효해짐
            const posterUrl = `https://image.tmdb.org/t/p/w500${review.moviePosterPath}`;
            return { ...review, imageUrl: posterUrl };
          }

          try {
            const tmdbRes = await axios.get(
              `https://api.themoviedb.org/3/search/movie`,
              {
                params: {
                  api_key: TMDB_API_KEY,
                  query: review.movieTitle,
                  language: 'ko-KR' // 한국어 검색 결과 우선
                },
              }
            );
            const movie = tmdbRes.data.results[0]; // 첫 번째 결과 사용
            const posterUrl = movie?.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null;

            return { ...review, imageUrl: posterUrl }; // 이미지 URL 추가
          } catch (err) {
            console.error(`TMDb 검색 실패: ${review.movieTitle}`, err);
            return { ...review, imageUrl: null }; // 실패 시 null
          }
        })
      );

      const sortedReviews = updatedReviews.sort((a, b) => b.rno - a.rno);

      setReviews(sortedReviews); // 정렬된 목록으로 상태 업데이트
    } catch (error) {
      console.error("리뷰 목록 가져오기 실패", error);
      setError("리뷰 목록을 가져오는데 실패했습니다."); // 에러 상태 업데이트
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []); // 의존성 배열이 비어있으므로 마운트 시 한 번만 실행

  const handleAddReview = async (reviewData) => {
    try {
      // ★ 백엔드의 리뷰 등록 엔드포인트 호출 - URL 끝에 슬래시 추가 ★
      const response = await axios.post("http://192.168.0.102:8080/api/reviews/", reviewData);
      console.log("리뷰 등록 성공", response.data); // 응답 데이터 확인
      alert("리뷰가 등록되었습니다!"); // 새 리뷰 등록 성공 팝업

      await fetchReviews();

    } catch (error) {
      console.error("리뷰 등록 실패", error);
      alert(`리뷰 등록에 실패했습니다. 오류: ${error.message}`); // 상세 에러 메시지 포함
      throw error; // ReviewForm의 catch에서도 잡을 수 있도록 에러 다시 던지기
    }
  };

  // 리뷰 삭제 핸들러
  const handleDelete = async (rno) => {
    if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://192.168.0.102:8080/api/reviews/${rno}`);
        // 삭제 성공 시 상태에서 해당 리뷰 제거하여 UI 즉시 업데이트
        setReviews((prevReviews) => prevReviews.filter((review) => review.rno !== rno));
        alert("리뷰가 삭제되었습니다."); // 삭제 성공 팝업
      } catch (error) {
        console.error("리뷰 삭제 실패", error);
        alert(`리뷰 삭제에 실패했습니다. 오류: ${error.message}`); // 상세 에러 메시지 포함
      }
    }
  };

  // 리뷰 수정 시작 핸들러 - ReviewForm을 열어 수정 모드로 전환
  const handleEdit = (review) => {
    setEditingReview(review); // 수정할 리뷰 정보를 상태에 저장
  };

  // 리뷰 수정 완료 핸들러 - ReviewForm에서 수정된 데이터가 넘어오면 호출됨
  const handleUpdateReview = async (reviewData) => {
    try {
      // 수정할 리뷰의 rno는 editingReview 상태에서 가져옵니다.
      if (!editingReview || !editingReview.rno) {
        throw new Error("수정할 리뷰 정보가 없습니다."); // 안전 장치
      }
      await axios.put(
        `http://192.168.0.102:8080/api/reviews/${editingReview.rno}`, // 백엔드 수정 엔드포인트
        reviewData // 수정된 데이터
      );
      console.log(`리뷰 수정 완료 (rno: ${editingReview.rno})`);
      alert("리뷰 수정 완료!"); // 수정 완료 팝업!

      // 수정 성공 후 전체 목록을 다시 가져와서 정렬하여 표시
      await fetchReviews();
      setEditingReview(null); // 수정 상태 종료

    } catch (error) {
      console.error("리뷰 수정 실패", error);
      alert(`리뷰 수정에 실패했습니다. 오류: ${error.message}`); // 상세 에러 메시지 포함
      throw error; // ReviewForm의 catch에서도 잡을 수 있도록 에러 다시 던지기
    }
  };

  // 로딩 중 또는 에러 발생 시 메시지 표시
  if (loading) {
    return <div>리뷰 목록을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="text-red-500">오류 발생: {error}</div>;
  }


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">리뷰 목록</h2>

      {!editingReview && (
          <MovieSearch setSelectedMovie={setSelectedMovie} />
      )}

      {selectedMovie && !editingReview && (
        <div className="border p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-semibold mb-2">새 리뷰 작성</h3>
            <ReviewForm
              selectedMovie={selectedMovie} // 선택된 영화 정보 전달
              handleAddReview={handleAddReview} // 리뷰 추가 함수 전달
              setSelectedMovie={setSelectedMovie} // 영화 선택 상태 초기화 함수 전달
              // 새 리뷰 작성 시에는 수정 관련 props는 null로 전달
              editingReview={null}
              setEditingReview={() => {}} // 빈 함수 전달 또는 아예 전달 안 함
              handleUpdateReview={() => {}} // 빈 함수 전달 또는 아예 전달 안 함
              fetchReviews={fetchReviews} // 필요에 따라 전달 (handleAddReview에서 사용)
            />
        </div>
      )}
      
      {/* 리뷰 목록 표시 */}
      {reviews.length === 0 && !loading && !error ? (
           <div>등록된 리뷰가 없습니다.</div>
      ) : (
        reviews.map((review) => (
          <div key={review.rno} className="border rounded-lg p-4 shadow">
            {/* TMDb에서 가져온 포스터 이미지 표시 */}
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
            <p>
              <span className="font-medium">작성자:</span> {review.reviewer}
            </p>
            <p>
              <span className="font-medium">내용:</span> {review.content}
            </p>
            <p>
              <span className="font-medium">평점:</span> {review.grade}
            </p>
            <button
              onClick={() => handleEdit(review)}
              className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
            >
              수정
            </button>
            <button
              onClick={() => handleDelete(review.rno)}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>

            {editingReview && editingReview.rno === review.rno && (
              <div className="mt-4 border p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">리뷰 수정</h3>
                <ReviewForm
                  editingReview={editingReview} // 수정 중인 리뷰 정보 전달
                  setEditingReview={setEditingReview} // 수정 상태 종료 함수 전달
                  handleUpdateReview={handleUpdateReview} // <- 수정 완료 처리 함수 전달 (여기 중요!)
                  fetchReviews={fetchReviews} // 목록 갱신 함수 전달 (handleUpdateReview에서 사용)
                  // 수정 시에는 새 리뷰 작성 관련 props는 null로 전달
                  selectedMovie={null}
                  handleAddReview={() => {}} // 빈 함수 전달 또는 아예 전달 안 함
                  setSelectedMovie={() => {}} // 빈 함수 전달 또는 아예 전달 안 함
                />
              </div>
            )}
          </div>
        ))
      )}

    </div>
  );
};

export default ReviewList;