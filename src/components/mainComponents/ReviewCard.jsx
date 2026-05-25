import styled from "styled-components";
import StarIcon from "../../assets/star.svg";

function getTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

/**
 * 호출 방법:
 * <ReviewCard review={review} />
 */
export default function ReviewCard({ review }) {
  return (
    <Wrapper>
      {/* 왼쪽 이미지 */}
      <PostImg
        src={review.postImages[0]}
        alt="리뷰 이미지"
        onError={e => { e.target.style.background = "#ddd"; e.target.removeAttribute("src"); }}
      />

      {/* 오른쪽 내용 카드 */}
      <ContentCard>
        <TopRow>
          <LeftInfo>
            <Nickname>{review.nickname.toUpperCase()}</Nickname>
            <RatingRow>
              <img src={StarIcon} alt="star" width={10} height={10} />
              <RatingText>{review.rating}</RatingText>
            </RatingRow>
          </LeftInfo>
          <TimeBadge>{getTimeAgo(review.createdAt)}</TimeBadge>
        </TopRow>
        <ReviewText>{review.content}</ReviewText>
      </ContentCard>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
`;

const PostImg = styled.img`
  width: 75px;
  height: 140px;
  border-radius: 12px;
  border: 0.3px solid #DADADA;
  object-fit: cover;
  flex-shrink: 0;
  background: #eee;
`;

const ContentCard = styled.div`
  width: 200px;
  height: 140px;
  border-radius: 12px;
  border: 0.3px solid #DADADA;
  box-sizing: border-box;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  background-color:#fff;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const LeftInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Nickname = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 510;
  font-size: 10px;
  line-height: 100%;
  letter-spacing: 0%;
  text-transform: uppercase;
  color: #111;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const RatingText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 100%;
  letter-spacing: 0%;
  color: #4E4E4E;
`;

const TimeBadge = styled.div`
  height: 22px;
  border-radius: 50px;
  padding: 5px 8px;
  box-sizing: border-box;
  background: #C5F598;
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 10px;
  line-height: 100%;
  letter-spacing: -0.1%;
  color: #111;
  white-space: nowrap;
  display: flex;
  align-items: center;
`;

const ReviewText = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: 0%;
  color: #4E4E4E;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  
`;