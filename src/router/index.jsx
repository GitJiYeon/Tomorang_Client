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
  const keyboardFocusedRef = useRef(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    viewport?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const state = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      tracking: false,
    };
    const threshold = 86;

    const isFormControl = (element) =>
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement;

    const canPullFromTarget = (target) => {
      const startElement = target instanceof Element ? target : target?.parentElement;
      if (!startElement || viewport.scrollTop > 0) return false;

      let element = startElement;
      while (element && element !== viewport) {
        if (element instanceof HTMLElement) {
          const style = window.getComputedStyle(element);
          const scrollableY =
            /(auto|scroll)/.test(style.overflowY) &&
            element.scrollHeight > element.clientHeight + 1;

          if (scrollableY && element.scrollTop > 0) return false;
        }
        element = element.parentElement;
      }

      return viewport.scrollTop <= 0;
    };

    const reset = () => {
      state.tracking = false;
    };

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      if (isFormControl(event.target)) return;
      if (!canPullFromTarget(event.target)) return;

      const touch = event.touches[0];
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.currentX = touch.clientX;
      state.currentY = touch.clientY;
      state.tracking = true;
    };

    const handleTouchMove = (event) => {
      if (!state.tracking || event.touches.length !== 1) return;

      const touch = event.touches[0];
      state.currentX = touch.clientX;
      state.currentY = touch.clientY;

      if (state.currentY < state.startY) reset();
    };

    const handleTouchEnd = () => {
      if (!state.tracking) return;

      const deltaX = state.currentX - state.startX;
      const deltaY = state.currentY - state.startY;
      reset();

      if (deltaY >= threshold && Math.abs(deltaX) < deltaY * 0.7 && viewport.scrollTop <= 0) {
        window.location.reload();
      }
    };

    viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: true });
    viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
    viewport.addEventListener("touchcancel", reset, { passive: true });

    return () => {
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("touchend", handleTouchEnd);
      viewport.removeEventListener("touchcancel", reset);
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const isFormControl = (element) =>
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement;

    const isFormControlFocused = () => {
      const element = document.activeElement;
      return isFormControl(element);
    };

    const setKeyboardHeight = () => {
      const viewport = window.visualViewport;
      const baseHeight = viewportHeightRef.current || window.innerHeight;
      const visualHeight = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      const keyboardHeight = keyboardFocusedRef.current
        ? Math.max(0, baseHeight - visualHeight - offsetTop)
        : 0;

      document.documentElement.style.setProperty(
        "--app-keyboard-height",
        `${Math.round(keyboardHeight)}px`
      );
    };

    const handleViewportResize = () => {
      setViewportHeight();
      setKeyboardHeight();
    };

    const handleFocusIn = (event) => {
      if (!isFormControl(event.target)) return;
      keyboardFocusedRef.current = true;
      setKeyboardHeight();
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        keyboardFocusedRef.current = isFormControlFocused();
        setKeyboardHeight();
        if (!keyboardFocusedRef.current) setViewportHeight();
      }, 80);
    };

    const setViewportHeight = () => {
      if ((keyboardFocusedRef.current || isFormControlFocused()) && viewportHeightRef.current) {
        keyboardFocusedRef.current = true;
        return;
      }

      const height = window.innerHeight;
      viewportHeightRef.current = height;
      document.documentElement.style.setProperty(
        "--app-viewport-height",
        `${height}px`
      );
    };

    setViewportHeight();
    setKeyboardHeight();
    window.addEventListener("resize", handleViewportResize);
    window.visualViewport?.addEventListener("resize", handleViewportResize);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("resize", handleViewportResize);
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
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
