import React from "react";
import styled from "styled-components";
import Nextarrow from "../assets/nextarrow.svg";
import Graynextarrow from "../assets/graynextarrow.svg"
import { useI18n } from "../i18n/I18nProvider";

export default function OtherCourse({ otherPosts }) {
  const { t } = useI18n();
  // 데이터가 없으면 영역 자체를 렌더링하지 않음
  if (!otherPosts || otherPosts.length === 0) return null;

  return (
    <Container>
      <Header>
        <Title>{t("이 가이드의 다른코스")}</Title>
        <MoreBtn>
          {t("더보기")} <Chevron src={Graynextarrow} alt="next" />
        </MoreBtn>
      </Header>

      <ScrollContainer>
        {otherPosts.map((post) => (
          <CourseCard key={post.postId}>
            <ImageWrapper>
              <CourseImage src={post.images[0]} alt={post.title} />
            </ImageWrapper>
            <CourseTitleRow>
              <CourseTitle>{post.title}</CourseTitle>
              <TitleChevron src={Nextarrow} alt="next" />
            </CourseTitleRow>
            <CourseSubtitle>{post.subtitle}</CourseSubtitle>
            <CoursePrice>
              {/* 가격이 문자열이든 숫자든 처리 가능하도록 보강 */}
              {String(post.price).replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원
            </CoursePrice>
          </CourseCard>
        ))}
      </ScrollContainer>
    </Container>
  );
}

const Container = styled.div`
  width: var(--app-page-width);
  margin: 0 auto;
  padding: 30px 0;
  background-color: #fff;
  font-family: "Pretendard", sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #111;
`;

const MoreBtn = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Chevron = styled.img`
  width: 10px;
  height: 10px;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 16px;
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const CourseCard = styled.div`
  flex-shrink: 0;
  width: 200px; /* 슬라이드 느낌을 위해 너비 소폭 조정 */
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 130px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const CourseImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CourseTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const CourseTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #111;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TitleChevron = styled.img`
  width: 12px;
  height: 12px;
`;
const CourseSubtitle = styled.p`
  font-size: 12px;
  color: #999;
  margin: 2px 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CoursePrice = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #111;
`;
