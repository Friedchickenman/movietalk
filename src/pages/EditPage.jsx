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



    return (
        <div>
            <div classNAme="editPage"></div>
            <h1>리뷰 수정</h1>
        </div>
    );
};

export default EditPage; // 컴포넌트 내보내기
