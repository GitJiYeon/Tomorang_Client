import { useEffect, useRef } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { ReservationProvider } from "../components/context/ReservationContext"; // 추가

import MainLayout from "../layouts/MainLayout";
import SetLanguage from "../pages/SelectLanguage";
import SetInterest from "../pages/SelectInterest";
import MakeTravelerProfile from "../pages/MakeTravelerProfile";
import WelcomePage from "../pages/WelcomePage";
import Temp from "../pages/Temp";
import StartPage from "../pages/StartPage";
import Login from "../pages/LoginPage";
import RoleSelectPage from "../pages/RoleSelectPage";
import TravelerSignupPage from "../pages/TravelerSignupPage";
import MainPage from "../pages/MainPage";
import MainMorePage from "../pages/MainMorePage";
import EmergingDestination from "../pages/EmergingDestination";
import DestinationListPage from "../pages/DestinationListPage";
import CourseDescriptionPage from "../pages/CourseDescriptionPage";
import SearchPage from "../pages/SearchPage";
import MapPage from "../pages/MapPage";
import ReservationPage from "../pages/ReservationPage";
import ReservationStatusPage from "../pages/ReservationStatusPage";
import ReviewWritePage from "../pages/ReviewWritePage";
import NotificationPage from "../pages/NotificationPage";
import Chat from "../pages/Chat";
import ChatListPage from "../pages/ChatListPage";
import GuideProfilePage from "../pages/GuideProfilePage";
import ReservationListPage from "../pages/ReservationListPage";
import GuidePage from "../pages/GuidePage";
import GuideRegistrationPage from "../pages/GuideRegistrationPage";
import GuideDescriptionEditPage from "../pages/GuideDescriptionEditPage";
import SearchResultPage from "../pages/SearchResultPage";

import GuideReservationListPage from "../pages/GuideReservationListPage";
import GuideSignupPage from "../pages/GuideSignupPage";
import GuideSelectLanguage from "../pages/GuideSelectLanguage";
import GuideSelectInterest from "../pages/GuideSelectInterest";
import MakeGuideProfile from "../pages/MakeGuideProfile";
import GuideWelcomePage from "../pages/GuideWelcomePage";

import ProfilePage from "../pages/ProfilePage";
import PickCourse from "../pages/PickCourse";
import MyreviewPage from "../pages/MyreviewPage";
import HiddenUserPage from "../pages/HiddenUserPage";
import ProfileEditPage from "../components/ProfileEditPage";
import InterestEditPage from "../pages/InterestEditPage";
import LanguageEditPage from "../pages/LanguageEditPage";
import GuideChatPage from "../pages/GuideChatPage";
import GuideMyPage from "../pages/GuideMyPage";
import { isCurrentGuide } from "../utils/authRole";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "");

function RoleAwareMainPage() {
  return isCurrentGuide() ? <Navigate to="/guide" replace /> : <MainPage />;
}

function RouteViewport() {
  const location = useLocation();
  const viewportRef = useRef(null);
  const viewportHeightRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    viewport?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const isFormControlFocused = () => {
      const element = document.activeElement;
      return element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement;
    };

    const setViewportHeight = () => {
      if (isFormControlFocused() && viewportHeightRef.current) return;

      const height = window.innerHeight;
      viewportHeightRef.current = height;
      document.documentElement.style.setProperty(
        "--app-viewport-height",
        `${height}px`
      );
    };

    const handleFocusOut = () => {
      window.setTimeout(setViewportHeight, 80);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.visualViewport?.addEventListener("resize", setViewportHeight);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.visualViewport?.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <div className="app-viewport" ref={viewportRef}>
      <ReservationProvider>
        <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/role" element={<RoleSelectPage />} />
            <Route path="/language" element={<SetLanguage />} />
            <Route path="/interest" element={<SetInterest />} />
            <Route path="/make-traveler-profile" element={<MakeTravelerProfile />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/travelersignup" element={<TravelerSignupPage />} />
            <Route path="/guidesignup" element={<GuideSignupPage />} />
            <Route path="/guide-language" element={<GuideSelectLanguage />} />
            <Route path="/guide-interest" element={<GuideSelectInterest />} />
            <Route path="/make-guide-profile" element={<MakeGuideProfile />} />
            <Route path="/guide-welcome" element={<GuideWelcomePage />} />
            <Route path="/main" element={<RoleAwareMainPage />} />
            <Route path="/main-more/:type" element={<MainMorePage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/guide-reservations" element={<GuideReservationListPage />} />
            <Route path="/guide-registration" element={<GuideRegistrationPage />} />
            <Route path="/guide-description-edit" element={<GuideDescriptionEditPage />} />
            <Route path="emergingDestination" element={<EmergingDestination></EmergingDestination>}/>
            <Route path="/reservation/:postId" element={<ReservationPage />} />
            <Route path="/reservation-status/:reservationId" element={<ReservationStatusPage />} />
            <Route path="/destination" element={<DestinationListPage />} />  
            <Route path="/course" element={<CourseDescriptionPage />} />
            <Route path="/review-write/:reservationId" element={<ReviewWritePage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/chats" element={<ChatListPage />} />
            <Route path="/chat/:postId" element={<Chat />} />
            <Route path="/guide/:id" element={<GuideProfilePage />} />
            <Route path="/book" element={<ReservationListPage />} />
            <Route path="/search-result" element={<SearchResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-course" element={<PickCourse />} />
            <Route path="/my-reviews" element={<MyreviewPage />} />
            <Route path="/hidden" element={<HiddenUserPage />} />
            <Route path="/edit-profile" element={<ProfileEditPage />} />
            <Route path="/edit-interest" element={<InterestEditPage />} />
            <Route path="/edit-language" element={<LanguageEditPage />} />
            <Route path="/guide-chat" element={<GuideChatPage />} />
            <Route path="/guide-mypage" element={<GuideMyPage />} />
            

          </Routes>
        </ReservationProvider>
    </div>
  );
}

function Router() {
  return (
    <BrowserRouter basename={routerBasename}>
      <RouteViewport />
    </BrowserRouter>
  );
}

export default Router;
