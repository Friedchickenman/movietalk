import React, { useState } from 'react'; // React와 상태 관리를 위해 useState 임포트 
import axios from 'axios'; // 백엔드 통신을 위해 axios 임포트
import { useNavigate } from 'react-router-dom'; // 새 리뷰 등록 완료 후 목록 페이지 이동을 위해 useNavigate 임포트 
import MovieSearch from '../components/MovieSearch'; // 경로 (src/pages에서 src/components로 이동)
import ReviewForm from '../components/ReviewForm'; // 경로 src/pages에서 src/components로 이동) 


const AddReviewPage = () => {

    // 선택된 영화 상태 변수 추가
    const [selectedMovie, setSelectedMovie] = useState(null); // 사용자가 검색 후 선택한 영화 정보를 저장할 상태 (초기값: null)

    // 라우팅 이동을 위한 useNavigate 훅 사용
    const navigate = useNavigate(); // navigate 함수를 사용하여 새 리뷰 등록 성공 시 리뷰 목록 페이지로 이동하는 데 사용

    // 새 리뷰 등록 처리 함수 추가
  const handleAddReview = async (reviewData) => { // ReviewForm으로부터 제출된 리뷰 데이터(작성자, 내용, 평점 등)를 인자로 받음음
    // reviewData 객체에는 MovieSearch에서 선택된 영화 정보(movieTitle 등)와
    // ReviewForm에서 입력된 리뷰 내용(reviewer, content, grade)이 모두 포함
    // ReviewForm 컴포넌트에서 이 데이터를 잘 조합해서 넘겨준다고 가정

    try {
      // 백엔드의 리뷰 등록 엔드포인트 호출 
      const response = await axios.post("http://192.168.0.102:8080/api/reviews/", reviewData);
      console.log("리뷰 등록 성공", response.data); // 성공 응답 확인

      alert("리뷰가 등록되었습니다!"); // 사용자에게 성공 알림

      // 등록 성공 후 리뷰 목록 페이지로 이동 
      navigate('/reviews'); // 루트 경로인 리뷰 목록 페이지로 이동

    } catch (error) {
      console.error("리뷰 등록 실패", error);
      alert(`리뷰 등록에 실패했습니다. 오류: ${error.message}`); // 사용자에게 실패 알림 (에러 메시지 포함)
      // 실패 시에는 페이지 이동을 하지 않거나 다른 처리를 할 수 있음
    }
  };

    // 컴포넌트가 화면에 보여줄 내용을 반환합니다.
    return (
        <div className='add-review-page'>  {/* 페이지 전체를 감싸는 div */}
            <h1>새 리뷰 작성</h1> {/* 페이지 제목 */}

            {/* MovieSearch와 ReviewForm 조건부 렌더링 */}
      {/* selectedMovie 상태가 null이면 MovieSearch를 보여주고, 그렇지 않으면 ReviewForm을 보여준다다 */}
      {selectedMovie ? ( // 영화가 선택되었다면 (selectedMovie가 null이 아니면)
        <div className="review-form-container"> {/* ReviewForm을 감싸는 컨테이너 (스타일링 용도) */}
          {/* ReviewForm 컴포넌트에 필요한 props 전달 */}
          <ReviewForm
            selectedMovie={selectedMovie} // 선택된 영화 정보를 ReviewForm에 전달
            // 사용자가 폼 작성을 완료하고 제출할 때 호출될 함수를 handleAddReview prop으로 전달
            handleAddReview={handleAddReview}
            // ReviewForm 내부에서 제출 성공 또는 취소 시 호출할 함수를 setSelectedMovie prop으로 전달
            // ReviewForm이 이 함수를 호출하면서 null을 전달하면 selectedMovie 상태가 초기화되어 다시 MovieSearch가 보임
            setSelectedMovie={setSelectedMovie}
             // 필요에 따라 폼 취소 버튼 기능을 ReviewForm 내부에 구현하고, 그 버튼 클릭 시 setSelectedMovie(null) 호출
          />
          <button onClick={() => setSelectedMovie(null)}>취소</button> 

        </div>
      ) : ( // 영화가 아직 선택되지 않았다면 (selectedMovie가 null이면)
        <div className="movie-search-container"> {/* MovieSearch를 감싸는 컨테이너 (스타일링 용도) */}
          {/* MovieSearch 컴포넌트에 필요한 props 전달 */}
          {/* MovieSearch가 영화를 선택했을 때 호출할 함수를 setSelectedMovie prop으로 전달 */}
          <MovieSearch onMovieSelect={setSelectedMovie} />
        </div>
      )}

        </div>
    );
};

export default AddReviewPage; // 컴포넌트 내보내기 
