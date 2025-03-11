import React from "react";
import { Routes, Route } from "react-router-dom";

// Local Imports
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "./MainLayout";

// Web Pages
import FlashcardSession from "../webpages/study-resources/FlashcardSession";
import LoginPage from "../webpages/login/Login";
import PageNotFound from "../webpages/PageNotFound";
import SettingsPage from "../webpages/Settings";
import Success from "../webpages/stripe/Success";
import Cancel from "../webpages/stripe/Cancel";
import PrivacyPolicy from "../webpages/login/PrivacyPolicy";
import TermsOfService from "../webpages/login/TermsOfService";
import LandingPage from "../webpages/LandingPage";
import { CheckoutForm, Return } from "../webpages/stripe/StripeForm";
import CreateStudyResource from "../webpages/CreateStudyResource";
import MCQSession from "../webpages/study-resources/MCQSession";
import SummaryPage from "../webpages/study-resources/SummaryPage";
import AIChatPage from "../webpages/study-resources/AIChatPage";

function App() {
  // Define all your routes as objects:
  const pages = [
    // Public
    { path: "/", component: <CreateStudyResource /> },
    { path: "/create", component: <CreateStudyResource /> },
    { path: "/:folderID/create", component: <CreateStudyResource /> },
    { path: "/landing-page", component: <LandingPage /> },
    { path: "/login", component: <LoginPage /> },
    { path: "/success", component: <Success /> },
    { path: "/cancel", component: <Cancel /> },
    { path: "/terms", component: <TermsOfService /> },
    { path: "/privacy", component: <PrivacyPolicy /> },
    { path: "/checkout", component: <CheckoutForm /> },
    { path: "/return", component: <Return /> },
    { path: "/create-resource", component: <CreateStudyResource /> },

    // Ephemeral routes (also public)
    { path: "/:folderID/flashcards-local/:id", component: <FlashcardSession /> },
    { path: "/:folderID/mcq-local/:id", component: <MCQSession /> },
    { path: "/:folderID/summary-local/:id", component: <SummaryPage /> },
    { path: "/:folderID/chat-local/:id", component: <AIChatPage /> },

    // Auth-protected routes
    { path: "/:folderID/flashcards/:id", component: <FlashcardSession /> },
    { path: "/:folderID/mcq/:id", component: <MCQSession /> },
    { path: "/:folderID/summary/:id", component: <SummaryPage /> },
    { path: "/:folderID/chat/:id", component: <AIChatPage /> },
    { path: "/settings", component: <SettingsPage /> },

    // 404
    { path: "*", component: <PageNotFound /> },
  ];

  // Distinguish public vs. protected
  const publicPaths = [
    "/",
    "/login",
    "/landing-page",
    "/terms",
    "/privacy",
    "/return",
    "/create-resource",
    "/:folderID/create"
  ];
  // For ephemeral routes, treat them as public
  const ephemeralPrefixes = [
    "/flashcards-local/",
    "/mcq-local/",
    "/summary-local/",
    "/chat-local/",
  ];

  return (
    <Routes>
      {/* Wrap everything with the MainLayout (PrimarySidebar → SecondarySidebar → Content) */}
      <Route path="/" element={<MainLayout />}>
        {pages.map((page, i) => {
          // Is ephemeral?
          const isEphemeral = ephemeralPrefixes.some((prefix) =>
            page.path.startsWith(prefix)
          );
          // It's public if ephemeral or explicitly listed in publicPaths (or 404 "*")
          const isPublic =
            isEphemeral || publicPaths.includes(page.path) || page.path === "*";

          return (
            <Route
              key={i}
              path={page.path}
              element={
                isPublic ? (
                  page.component
                ) : (
                  <ProtectedRoute>{page.component}</ProtectedRoute>
                )
              }
            />
          );
        })}
      </Route>
    </Routes>
  );
}

export default App;
