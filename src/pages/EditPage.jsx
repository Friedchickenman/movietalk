import React, { useState, useEffect } from 'react'; //상태 및 효과 관리를 위해 임포트 (useEffect 추가됨)
import axios from 'axios'; // 백엔드 통신을 위해 axios 임포트 
import { useNavigate, useParams } from 'react-router-dom'; // 페이지 이동과 URL 파라미터 읽기를 위해 임포트 (useParams 추가됨) 

// ReviewForm 컴포넌트를 임포트합니다.(수정 모드로 사용)
import ReviewForm from '../components/ReviewForm'; 


const EditPage = () => {
    
    // URL 파라미터에서 rno 값 읽어오기 
    const { rno } = useParams(); // 주소창 예: /reviews/123/edit 에서 123에 해당하는 값을 'rno'라는 변수로 가져옴 (문자열 형태)

    // 수정할 리뷰 정보를 저장할 상태 변수 추가
    const [editingReview, setEditingReview] = useState(null); // 백엔드에서 가져온 수정할 리뷰 정보 (초기값: null)

    // 라우팅 이동을 위한 useNavigate 훅 사용 
    const navigate = useNavigate(); // 수정 완료 후 목록 페이지로 이동하기 위해 사용

     // 리뷰 정보를 가져오는 동안의 로딩 및 에러 상태 추가 
  const [loading, setLoading] = useState(true); // 특정 리뷰 정보 로딩 중인지 여부
  const [error, setError] = useState(null); // 특정 리뷰 정보 로딩 중 발생한 오류 메시지


  // 컴포넌트 마운트 시 수정할 리뷰 정보를 백엔드에서 가져오는 useEffect 훅 추가 
  useEffect(() => {
    const fetchReviewForEdit = async () => { // 데이터를 가져오는 비동기 함수 정의
      setLoading(true); // 로딩 시작
      setError(null); // 이전 에러 초기화
      try {
        // 백엔드 단건 조회 API 호출 - URL 파라미터에서 얻은 rno 사용
        const response = await axios.get(`http://192.168.0.102:8080/api/reviews/${rno}`); // 백엔드 API 주소/포트 확인!
        setEditingReview(response.data); // 가져온 리뷰 정보를 editingReview 상태에 저장
        console.log("수정할 리뷰 정보 가져오기 성공:", response.data); // 콘솔에 데이터 출력
      } catch (err) {
        console.error(`rno=${rno} 리뷰 정보 가져오기 실패`, err);
        setError("리뷰 정보를 가져오는데 실패했습니다."); // 에러 상태 업데이트
        // 만약 존재하지 않는 rno라면 목록 페이지로 강제 이동시킬 수도 있습니다. (navigate('/'))
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    if (rno) { // rno 값이 있을 때만 데이터 가져오는 함수 호출
       fetchReviewForEdit();
    } else {
       // rno가 없으면 (잘못된 접근) 로딩 종료 및 에러 처리
       setLoading(false);
       setError("수정할 리뷰 정보(rno)가 없습니다.");
       // navigate('/'); // rno가 없으면 목록 페이지로 리다이렉트
    }

  }, [rno]); // 의존성 배열에 rno를 넣어 rno 값이 바뀔 때마다 다시 데이터를 가져오도록 합니다. (보통 수정 페이지에서는 rno가 바뀌지 않지만, 안전을 위해 포함)

const handleUpdateReview = async (reviewData) => { // ReviewForm으로부터 수정된 리뷰 데이터를 인자로 받습니다.
    // reviewData 객체에는 수정된 작성자, 내용, 평점 등이 포함되어 있습니다.
    // 리뷰 번호(rno)는 URL 파라미터에서 얻은 rno 값을 사용합니다. ReviewForm에서는 받아오지 않을 수 있습니다.

    try {
      // 백엔드의 리뷰 수정 엔드포인트 호출 - 수정할 리뷰의 rno를 URL에 포함
      // reviewData 객체에 rno가 포함되어 있다면 put의 두 번째 인자로 넘길 때 확인 필요. 보통은 URL에 포함
      await axios.put(`http://192.168.0.102:8080/api/reviews/${rno}`, reviewData); // 백엔드 API 주소/포트 확인!
      console.log(`리뷰 수정 완료 (rno: ${rno})`); // 콘솔 출력

      alert("리뷰 수정 완료!"); // 사용자에게 성공 알림

      // 수정 성공 후 리뷰 목록 페이지로 이동 
      navigate('/'); // 루트 경로인 리뷰 목록 페이지로 이동합니다. (또는 '/reviews' 경로)

    } catch (error) {
      console.error(`리뷰 수정 실패 (rno: ${rno})`, error);
      alert(`리뷰 수정에 실패했습니다. 오류: ${error.message}`); // 사용자에게 실패 알림 (에러 메시지 포함)
      // 실패 시에는 페이지 이동을 하지 않거나 다른 처리를 할 수 있습니다.
      throw error; // ReviewForm에서 에러를 잡을 수 있도록 다시 던져줄 수도 있습니다.
    }
  };


  // 로딩 중 또는 에러 발생 시 보여줄 
  // 로딩 상태일 때
  if (loading) {
    return <div>리뷰 정보를 불러오는 중입니다...</div>;
  }

  // 에러 상태일 때
  if (error) {
    return <div className="text-red-500">오류 발생: {error}</div>;
  }

  // 리뷰 수정 폼
  return (
    <div className="edit-page"> {/* 페이지 전체를 감싸는 div */}
      <h1>리뷰 수정</h1> {/* 페이지 제목 */}

      {/* editingReview 상태에 데이터가 있을 때만 ReviewForm을 보여줍니다. */}
      {/* 데이터를 가져오기 전(null)이거나 에러 발생 시에는 폼을 보여주지 않습니다. */}
      {editingReview && ( // editingReview 상태가 null이 아닐 때 (데이터를 성공적으로 가져왔을 때)
        <div className="review-form-container"> {/* ReviewForm을 감싸는 컨테이너 (스타일링 용도) */}
           {/* ReviewForm 컴포넌트에 필요한 props 전달 (수정 모드) */}
          <ReviewForm
            // editingReview prop으로 백엔드에서 가져온 기존 리뷰 정보를 전달
            editingReview={editingReview}
            // handleAddReview, selectedMovie, setSelectedMovie는 수정 페이지에서 필요 없습니다.

            // 사용자가 폼 수정을 완료하고 제출할 때 호출될 함수를 handleUpdateReview prop으로 전달
            handleUpdateReview={handleUpdateReview}
            // ReviewForm 내부에서 취소 시 호출할 함수를 setEditingReview prop으로 전달 (null로 만들어 폼 숨김)
            setEditingReview={setEditingReview} // 취소 버튼 기능 구현 시 사용 (EditPage에서는 setEditingReview(null)하면 폼이 사라짐)
             // ReviewForm 내부에서 취소 버튼 클릭 시 navigate('/') 호출하도록 구현하는 것도 가능
          />
          {/* 취소 버튼을 여기에 직접 추가할 수도 있습니다. */}
          {/* <button onClick={() => setEditingReview(null)}>취소</button> */}
        </div>
      )}

       {/* editingReview 상태가 null이고, 로딩 중도 아니고, 에러도 없을 경우 메시지 (예: 리뷰를 찾을 수 없습니다) */}
       {!editingReview && !loading && !error && (
         <div>수정할 리뷰 정보를 찾을 수 없습니다.</div>
       )}


    </div>
    );
};

export default EditPage; // 컴포넌트 내보내기
