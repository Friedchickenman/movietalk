import React, { useState, useEffect } from 'react'; //상태 및 효과 관리를 위해 임포트 (useEffect 추가됨)
import axios from 'axios'; // 백엔드 통신을 위해 axios 임포트 
import { useNavigate, useParams } from 'react-router-dom'; // 페이지 이동과 URL 파라미터 읽기를 위해 임포트 (useParams 추가됨) 

// ReviewForm 컴포넌트를 임포트합니다.
import ReviewForm from '../components/ReviewForm'; 


const AddReviewPage = () => {
    return (
        <div>
            <h1>새 리뷰 작성 페이지</h1>
        </div>
    );
};

export default AddReviewPage;
