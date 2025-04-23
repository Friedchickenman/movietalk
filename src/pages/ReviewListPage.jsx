import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 


const TMDB_API_KEY = "518024ad458565e49a0e1c6656a66213";

const ReviewListPage = () => {

    //리뷰 목록, 로딩, 에러 상태 변수 정의
    const [reviews, setReviews] = useState([]); // 리뷰 목록 데이터를 저장할 상태
    const [loading, setLoading] = useState(true); // 데이터 로딩 중인지 여부를 저장할 상태
    const [error, setError] = useState(null); // 데이터 로딩 중 발생한 오류 메시지를 저장

    //라우팅 이동을 위한 useNavigate 훅 사용
    const navigate = useNavigate();

     //백엔드에서 리뷰 목록을 가져오는 함수 (기존 ReviewList에서 가져옴) 
  const fetchReviews = async () => {
    setLoading(true); // 로딩 시작
    setError(null); // 이전 에러 초기화
    try {
      // 백엔드 목록 API 호출 - 사용자님의 백엔드 주소와 포트 확인!
      const response = await axios.get("http://192.168.0.102:8080/api/reviews/list");

      const reviewList = response.data;

      // TMDb에서 포스터 정보를 가져와 리뷰 데이터에 추가 (주의: 이 부분은 비효율적일 수 있습니다.)
      const updatedReviews = await Promise.all(
        reviewList.map(async (review) => {
           try {
              const tmdbRes = await axios.get(
                `https://api.themoviedb.org/3/search/movie`,
                {
                  params: {
                    api_key: TMDB_API_KEY, // 상단에 정의된 API 키 사용
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

      // 리뷰 목록을 rno 기준으로 내림차순 정렬 (최신순)
      const sortedReviews = updatedReviews.sort((a, b) => b.rno - a.rno);

      setReviews(sortedReviews); // 정렬된 목록으로 상태 업데이트
    } catch (error) {
      console.error("리뷰 목록 가져오기 실패", error);
      setError("리뷰 목록을 가져오는데 실패했습니다."); // 에러 상태 업데이트
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  //컴포넌트 마운트 시 fetchReviews 함수를 호출하는 useEffect 훅
  useEffect(() => {
    fetchReviews();
  }, []); // 의존성 배열이 비어있으므로, 컴포넌트가 처음 마운트될 때만 이 효과가 실행됩니다.

  // 리뷰 삭제 핸들러 함수 추가
  const handleDelete = async (rno) => {
    if (window.confirm("정말 이 리뷰를 삭제하시겠습니까?")) {// 삭제 여부를 다시 한번 확인하는는 팝업 
        try{
            // 백엔드 삭제 API 호출 - 삭제할 리뷰의 rno를 URL에 포함
            await axios.delete(`http://192.168.0.102:8080/api/reviews/${rno}`);
            // 백엔드에서 삭제 성공시:
            // 현재 reviews 상태에서 해당 rno를 가진 리뷰를 제거하여 UI 즉시 업데이트
            setReviews((prevReviews) => prevReviews.filter((review) => review.rno !== rno));
            alert("리뷰가 삭제되었습니다!"); // 삭제 성공 알림
        } catch (error) {
            console.error("리뷰 삭제가 실패되었습니다", error);
            alert(`리뷰 삭제에 실패했습니다! 오류: ${error.message}`); // 삭제 실패 알림
        }
        }
  };
  
  //  수정 버튼 클릭 시 수정 페이지로 이동하는 함수 추가 
  const handleEdit = (review) => {
    // navigate 함수를 사용하여 '/reviews/:rno/edit' 경로로 이동 (rno는 리뷰 번호)
    navigate(`/reviews/${review.rno}/edit`);
  };

    // 컴포넌트가 화면에 보여줄 내용을 반환합니다.
     // 로딩 중 또는 에러 발생 시 보여줄 JSX
  if (loading) {
    return <div>리뷰 목록을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="text-red-500">오류 발생: {error}</div>;
  }

  // 모든 준비가 되면 보여줄 JSX (리뷰 목록 )
  return (
    <div className="space-y-4"> {/* 리뷰 목록 전체 컨테이너 */}
      <h2 className="text-xl font-bold">리뷰 목록</h2> {/* 목록 제목 */}

      {/* 새 리뷰 작성 페이지로 이동하는 버튼 */}
    <button
       onClick={() => navigate('/reviews/new')} // 버튼 클릭 시 /reviews/new 경로로 이동
       className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
     >
       새 리뷰 작성
     </button>
      
      {reviews.length === 0 ? (
        <div>등록된 리뷰가 없습니다.</div>
      ) : (
        // 리뷰 목록을 순회하며 각 리뷰를 화면에 표시
        reviews.map((review) => (
          <div key={review.rno} className="border rounded-lg p-4 shadow"> {/* 개별 리뷰 아이템 */}
            {/* 리뷰 아이템 내용 */}
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
               onClick={() => handleEdit(review)} // 아직 handleEdit 함수는 정의되지 않았습니다.
               className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
             >
               수정
             </button>
            <button
              onClick={() => handleDelete(review.rno)} // 삭제 버튼 클릭 시 handleDelete 호출
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>

          </div>
        ))
      )}
    </div>
  );
};

export default ReviewListPage;
