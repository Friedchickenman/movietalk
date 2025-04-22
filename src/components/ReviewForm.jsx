import React, { useState, useEffect } from "react";
import axios from "axios";


const ReviewForm = ({
  // 새 리뷰 작성 모드 (selectedMovie prop 존재 시)
  selectedMovie, // 선택된 영화 정보 (객체)
  handleAddReview, // 리뷰 추가 처리 함수 (async 함수)
  setSelectedMovie, // 영화 선택 상태 초기화 함수 (function)

  // 리뷰 수정 모드 (editingReview prop 존재 시)
  editingReview, // 수정 중인 리뷰 정보 (객체)
  setEditingReview, // 수정 상태 종료 함수 (function)
  handleUpdateReview, // 리뷰 수정 처리 함수 (async function)

}) => {
  // 폼의 입력 값을 관리하는 상태
  const [reviewData, setReviewData] = useState({
    movieTitle: "",
    reviewer: "",
    content: "",
    grade: 0,
    moviePosterPath: "",
  });

  // selectedMovie나 editingReview prop이 변경될 때 폼 상태를 초기화
  useEffect(() => {
    // 수정 모드 우선 체크
    if (editingReview) {
      console.log("ReviewForm: 수정 모드 시작", editingReview);
      // 수정 모드일 때: 기존 리뷰 정보로 폼 초기화
      setReviewData({
        movieTitle: editingReview.movieTitle || "",
        reviewer: editingReview.reviewer || "",
        content: editingReview.content || "",
        grade: editingReview.grade || 0,
        moviePosterPath: editingReview.moviePosterPath || "", // 백엔드 DTO에 추가했다면 사용
      });
    } else if (selectedMovie) {
      console.log("ReviewForm: 새 리뷰 작성 모드 시작", selectedMovie);
      // 새 리뷰 작성 모드일 때: 선택된 영화 정보로 폼 초기화
      setReviewData({
        movieTitle: selectedMovie.title || "",
        reviewer: "",
        content: "",
        grade: 0, // 초기 평점 설정
        moviePosterPath: selectedMovie.poster_path || "", // TMDb에서 가져온 포스터 경로
      });
    } else {
      // 초기 또는 모드 변경 시 상태 클린업
      console.log("ReviewForm: 초기 상태");
      setReviewData({
        movieTitle: "",
        reviewer: "",
        content: "",
        grade: 0,
        moviePosterPath: "",
      });
    }
    // 디버깅용: 폼 상태가 변경될 때마다 현재 reviewData 확인
    // console.log("ReviewForm 상태 초기화:", reviewData); // 주의: 이 로그는 상태 업데이트 이전 값이 찍힐 수 있습니다.
  }, [selectedMovie, editingReview]); // selectedMovie 또는 editingReview prop이 변경될 때마다 실행

  // 폼 입력 값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 폼 제출 핸들러 (등록 또는 수정 처리)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("폼 제출 시도. 전송될 리뷰 데이터:", reviewData);

    // 기본적인 평점 유효성 검사
    if (reviewData.grade < 1 || reviewData.grade > 5) {
      alert("평점은 1부터 5 사이의 값이어야 합니다.");
      return; // 유효성 검사 실패 시 제출 중단
    }
    // 다른 필수 필드 유효성 검사 추가 가능 (예: reviewer, content, movieTitle)

    try {
      if (editingReview) {
        // 수정 모드일 때: ReviewList에서 전달받은 handleUpdateReview 함수 호출
        if (handleUpdateReview) {
            console.log("ReviewForm: handleUpdateReview 호출");
          await handleUpdateReview(reviewData); // 수정된 데이터 전달
        } else {
          console.error("handleUpdateReview prop이 ReviewForm에 전달되지 않았습니다.");
          alert("리뷰 수정 기능을 찾을 수 없습니다.");
        }

      } else {
        // 새 리뷰 작성 모드일 때: ReviewList에서 전달받은 handleAddReview 함수 호출
        if (handleAddReview) {
            console.log("ReviewForm: handleAddReview 호출");
          await handleAddReview(reviewData); // 새 리뷰 데이터 전달

          // 새 리뷰 등록 성공 후 영화 선택 상태 초기화
          if (setSelectedMovie) {
                console.log("ReviewForm: setSelectedMovie(null) 호출");
            setSelectedMovie(null);
          }
        } else {
          console.error("handleAddReview prop이 ReviewForm에 전달되지 않았습니다.");
          alert("리뷰 등록 기능을 찾을 수 없습니다.");
        }
      }

      // 폼 초기화 (성공적으로 처리 완료 후) 
        console.log("ReviewForm: 폼 초기화");
      setReviewData({
        movieTitle: "",
        reviewer: "",
        content: "",
        grade: 0,
        moviePosterPath: "",
      });

    } catch (error) {
      console.error("ReviewForm 폼 제출 중 오류 발생:", error);
      // alert("폼 제출 중 오류 발생!"); // 필요하다면 추가 (중복 주의)
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 영화 제목 필드는 수정 모드이거나 영화가 선택된 경우에만 표시 (사용자 편집 불가) */}
      {(editingReview || selectedMovie) && (
        <div>
          <label htmlFor="movieTitle" className="font-medium">영화 제목</label>
          <input
            id="movieTitle"
            type="text"
            name="movieTitle"
            value={reviewData.movieTitle}
            // 제목은 선택/수정 시 고정되므로 readOnly 속성 사용
            readOnly
            className="border p-2 rounded w-full bg-gray-100"
          />
        </div>
      )}

      <div>
        <label htmlFor="reviewer" className="font-medium">작성자</label>
        <input
          id="reviewer"
          type="text"
          name="reviewer"
          value={reviewData.reviewer}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required // 필수 필드
        />
      </div>
      <div>
        <label htmlFor="content" className="font-medium">내용</label>
        <textarea
          id="content"
          name="content"
          value={reviewData.content}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          rows="4"
          required // 필수 필드
        />
      </div>
      <div>
        <label htmlFor="grade" className="font-medium">평점 (1-5)</label>
        <input
          id="grade"
          type="number"
          name="grade"
          value={reviewData.grade}
          onChange={handleChange}
          min="1" // 최소값
          max="5" // 최대값
          className="border p-2 rounded w-full"
          required // 필수 필드
        />
      </div>

      {selectedMovie && !editingReview && reviewData.moviePosterPath && (
        <div className="mt-4">
          <h3>선택된 영화: {reviewData.movieTitle}</h3>
          <img
              src={`https://image.tmdb.org/t/p/w500${reviewData.moviePosterPath}`}
              alt={`${reviewData.movieTitle} 포스터`}
              className="w-32 h-48 object-cover rounded"
            />
        </div>
      )}

      {editingReview && editingReview.moviePosterPath && ( // editingReview.moviePosterPath로 확인
        <div className="mt-4">
          <h3>수정 중: {editingReview.movieTitle}</h3>
          <img
              src={`https://image.tmdb.org/t/p/w500${editingReview.moviePosterPath}`} // editingReview.moviePosterPath 사용
              alt={`${editingReview.movieTitle} 포스터`}
              className="w-32 h-48 object-cover rounded"
            />
        </div>
      )}

      <button
        type="submit" // 폼 제출 버튼
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {editingReview ? "리뷰 수정 완료" : "리뷰 등록"}
      </button>

      {/* 수정 모드일 때만 취소 버튼 표시 */}
      {editingReview && (
        <button
          type="button" // 제출 버튼이 아니므로 type="button" 명시
          onClick={() => setEditingReview(null)} // 수정 상태 취소
          className="mt-4 ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          취소
        </button>
      )}
    </form>
  );
};

export default ReviewForm;