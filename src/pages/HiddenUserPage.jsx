import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import DefaultProfile from "../assets/defaultProfile.svg";
import { getHiddenUsers, unhideUser } from "../api/tomorang";
import { unhideGuide } from "../utils/hiddenGuides";

const getProfile = () => {
  try {
    return JSON.parse(localStorage.getItem("profile") || "{}");
  } catch {
    return {};
  }
};

const roleType = (role) => {
  const value = String(role ?? "").toUpperCase();
  return value === "GUIDE" ? "guide" : "traveler";
};

export default function HiddenUserPage() {
  const navigate = useNavigate();
  const profile = useMemo(getProfile, []);
  const isGuideViewer = String(profile?.role ?? "").toUpperCase() === "GUIDE";
  const targetRole = isGuideViewer ? "traveler" : "guide";
  const title = isGuideViewer ? "숨긴 발견자" : "숨긴 안내자";
  const emptyText = isGuideViewer ? "숨긴 발견자가 없어요." : "숨긴 안내자가 없어요.";

  const [hiddenUsers, setHiddenUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [unhidingId, setUnhidingId] = useState("");

  useEffect(() => {
    let alive = true;

    getHiddenUsers()
      .then((users) => {
        if (!alive) return;
        setHiddenUsers(users);
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("숨긴 사용자 조회 실패", error);
        if (!alive) return;
        setHiddenUsers([]);
        setErrorMessage(error.message || "숨긴 사용자를 불러오지 못했어요.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const visibleUsers = useMemo(
    () => hiddenUsers.filter((user) => roleType(user.role) === targetRole),
    [hiddenUsers, targetRole]
  );

  const handleUnhide = async (userId) => {
    if (!userId || unhidingId) return;

    setUnhidingId(String(userId));
    try {
      await unhideUser(userId);
      unhideGuide(userId);
      setHiddenUsers((users) => users.filter((user) => String(user.id) !== String(userId)));
    } catch (error) {
      console.error("숨김 해제 실패", error);
      alert(error.message || "숨김 해제에 실패했어요.");
    } finally {
      setUnhidingId("");
    }
  };

  const handleCardClick = (user) => {
    if (roleType(user.role) !== "guide") return;
    navigate(`/guide/${user.id}`, { state: { guide: user } });
  };

  return (
    <PageWrapper>
      <Header coment={title} />
      <ListWrapper>
        {loading ? (
          <EmptyText>불러오는 중이에요.</EmptyText>
        ) : errorMessage ? (
          <EmptyText>{errorMessage}</EmptyText>
        ) : visibleUsers.length > 0 ? (
          visibleUsers.map((user) => {
            const clickable = roleType(user.role) === "guide";
            const isUnhiding = unhidingId === String(user.id);

            return (
              <HiddenCard
                key={user.id}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={() => handleCardClick(user)}
                onKeyDown={(event) => {
                  if (!["Enter", " "].includes(event.key)) return;
                  event.preventDefault();
                  handleCardClick(user);
                }}
                $clickable={clickable}
              >
                <InfoGroup>
                  <Name>{user.nickname || user.id}</Name>
                  <Bio>{user.bio || "소개가 없어요."}</Bio>
                  <AnswerTime>{user.answertime || "평균 응답 정보 없음"}</AnswerTime>
                </InfoGroup>

                <ProfileActions>
                  <Avatar
                    src={user.profileImage || DefaultProfile}
                    alt={user.nickname || user.id}
                    onError={(event) => {
                      event.currentTarget.src = DefaultProfile;
                    }}
                  />
                  <UnhideButton
                    type="button"
                    disabled={isUnhiding}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUnhide(user.id);
                    }}
                  >
                    {isUnhiding ? "해제 중" : "숨김 해제"}
                  </UnhideButton>
                </ProfileActions>
              </HiddenCard>
            );
          })
        ) : (
          <EmptyText>{emptyText}</EmptyText>
        )}
      </ListWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: min(var(--app-page-width), 100vw);
  height: 100dvh;
  max-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 32px 0 28px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const HiddenCard = styled.div`
  width: var(--app-content-width);
  min-height: 176px;
  border-radius: 16px;
  border: 1px solid #dadada;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 18px 24px 26px;
  box-sizing: border-box;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  text-align: left;
`;

const InfoGroup = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Name = styled.span`
  color: #111;
  font-family: Pretendard;
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
`;

const Bio = styled.span`
  width: 178px;
  margin-top: 8px;
  color: #acacac;
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AnswerTime = styled.span`
  margin-top: 14px;
  color: #b1dd89;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
`;

const ProfileActions = styled.div`
  width: 126px;
  height: 124px;
  flex-shrink: 0;
  position: relative;
`;

const Avatar = styled.img`
  width: 112px;
  height: 112px;
  border-radius: 50%;
  object-fit: cover;
  background: #d9d9d9;
  display: block;
  margin-left: auto;
`;

const UnhideButton = styled.button`
  position: absolute;
  right: 0;
  bottom: 2px;
  width: 112px;
  height: 34px;
  border: 0;
  border-radius: 2px;
  background: #b9dd8f;
  color: #111;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: wait;
  }
`;

const EmptyText = styled.p`
  margin-top: 80px;
  color: #acacac;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
`;
