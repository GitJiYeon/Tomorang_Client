import styled from "styled-components";
import StarIcon from "../../assets/star.svg"; // 별 아이콘 직접 삽입

/**
 * 호출 방법:
 * <GuideCard guide={guide} />
 */
export default function GuideCard({ guide, onClick }) {
  return (
    <Card onClick={onClick}>
      <ProfileCircle>
        <ProfileImg
          src={guide.profileImage}
          alt={guide.nickname}
          onError={e => { e.target.style.background = "#ddd"; e.target.removeAttribute("src"); }}
        />
      </ProfileCircle>
      <Nickname>{guide.nickname}</Nickname>
      <RatingRow>
        <img src={StarIcon} alt="star" width={10} height={10} />
        <RatingText>{guide.rating}</RatingText>
      </RatingRow>
    </Card>
  );
}

const Card = styled.div`
  width: 100px;
  height: 150px;
  border-radius: 82px;
  border: 0.3px solid #B1DD89;
  background: #C5F598;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const ProfileCircle = styled.div`
  width: 86px;
  height: 86px;
  border-radius: 82px;
  border: 0.4px solid #B1DD89;
  overflow: hidden;
  background: #eee;
  flex-shrink: 0;
`;

const ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Nickname = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: 0%;
  text-align: center;
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
  text-align: center;
  color: #4E4E4E;
`;
