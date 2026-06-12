/**
 * MyReviewCard - 나의 후기 카드 컴포넌트
 *
 * 사용법:
 * <MyReviewCard review={myReview} time="12:00-18:00" />
 */

import styled from "styled-components";
import StarFillIcon from "../../assets/bookStatusIcons/starFill.svg";
import StarEmptyIcon from "../../assets/bookStatusIcons/starEmpty.svg";
import DefaultProfileIcon from "../../assets/defaultProfile.svg";

export default function MyReviewCard({ review, time, onClick }) {
  if (!review) return null;

  const createdAt = review.createdAt ?? new Date().toISOString();
  const dateStr = createdAt.slice(0, 10).replace(/-/g, ".");
  const shortDate = dateStr.slice(5);
  const nickname = review.nickname ?? review.memberNickName ?? review.memberId ?? "사용자";
  const profile = review.profile ?? review.memberImage ?? DefaultProfileIcon;
  const images = review.images ?? review.postImages ?? [];

  return (
    <Card
      as={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      $clickable={Boolean(onClick)}
    >
      {/* ── 헤더 ──
          [Avatar]  [KIM  ★★★★☆ 4.2  2026.02]
                    [02.19 | 12:00-13:00      ]
      */}
      <CardHeader>
        <Avatar src={profile} alt="profile" />
        <HeaderRight>
          <TopRow>
            <ReviewerName>{nickname}</ReviewerName>
            <StarGroup>
              {[1, 2, 3, 4, 5].map((s) => (
                <img
                  key={s}
                  src={s <= Math.round(review.rating) ? StarFillIcon : StarEmptyIcon}
                  alt="star"
                  width={14}
                  height={14}
                />
              ))}
              <RatingNum>{review.rating}</RatingNum>
            </StarGroup>
            <MonthLabel>{dateStr}</MonthLabel>
          </TopRow>
          <BottomRow>
            <ReviewerDate>{shortDate} | {time}</ReviewerDate>
          </BottomRow>
        </HeaderRight>
      </CardHeader>

      {/* ── 이미지 ── */}
      {images.length > 0 && (
        <ImageRow>
          {images.slice(0, 3).map((img, idx) => (
            <ReviewImg
              key={idx}
              src={img}
              alt="review"
              onError={(e) => {
                e.target.style.background = "#eee";
                e.target.removeAttribute("src");
              }}
            />
          ))}
        </ImageRow>
      )}

      {/* ── 텍스트 ── \n → 실제 줄바꿈으로 표시 */}
      <ReviewContent>
        {String(review.content ?? "").split(/\\n|\n/).map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </ReviewContent>
    </Card>
  );
}

/* ─── Styled Components ─── */

const Card = styled.div`
  width: 348px;
  max-height: 346px;
  border: 1px solid #DADADA;
  border-radius: 12px;
  background: #fff;
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  text-align: left;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  font: inherit;

  &:focus {
    outline: none;
  }

  &:active {
    transform: ${({ $clickable }) => ($clickable ? "scale(0.995)" : "none")};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background: #DADADA;
  flex-shrink: 0;
`;

const HeaderRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ReviewerName = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.3px;
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  margin-right: 2px;
`;

const StarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const RatingNum = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #4E4E4E;
  margin-left: 2px;
`;

const MonthLabel = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #DADADA;
  margin-left: auto;   /* 오른쪽 끝으로 밀기 */
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
`;

const ReviewerDate = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #ACACAC;
  letter-spacing: 0.3px;
`;

const ImageRow = styled.div`
  display: flex;
  gap: 8px;
  padding-top:5px;
`;

const ReviewImg = styled.img`
  width: 110px;
  height: 102px;
  border-radius: 12px;
  object-fit: cover;
  background: #eee;
  flex-shrink: 0;
`;

const ReviewContent = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: #4E4E4E;
  font-feature-settings: 'liga' off, 'clig' off;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  color: #4E4E4E;
  padding-top:10px;
  width: 310px;
`;
