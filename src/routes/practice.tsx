import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { AccessGate } from "@/components/practice/AccessGate";
import { PracticeEngine } from "@/components/practice/PracticeEngine";
import { ProgressView } from "@/components/practice/ProgressView";
import { SavedQuestions } from "@/components/practice/SavedQuestions";
import { SubjectList } from "@/components/practice/SubjectList";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuth } from "@/hooks/useAuth";
import { getPracticeAccess } from "@/lib/edge-practice.functions";

type PracticeSearchParams = {
  subject?: string | undefined;
  topic?: string | undefined;
  page?: number | undefined;
  tab?: "practice" | "saved" | "progress" | undefined;
};

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): PracticeSearchParams => {
    return {
      subject: typeof search["subject"] === "string" && search["subject"] ? search["subject"] : undefined,
      topic: typeof search["topic"] === "string" && search["topic"] ? search["topic"] : undefined,
      page: Number(search["page"]) > 0 ? Math.floor(Number(search["page"])) : undefined,
      tab: ["practice", "saved", "progress"].includes(search["tab"] as string)
        ? (search["tab"] as "practice" | "saved" | "progress")
        : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Edge Practice — Newton Edge Tutorial" },
      {
        name: "description",
        content:
          "JAMB/UTME past-question practice for Newton Edge Foundational Class students with instant feedback, explanations, and bookmarks.",
      },
      { property: "og:title", content: "Edge Practice — Newton Edge Tutorial" },
      {
        property: "og:description",
        content: "Practice UTME questions topic-by-topic with instant explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const fetchAccess = useServerFn(getPracticeAccess);

  const subject = search["subject"];
  const topic = search["topic"];
  const page = search["page"] || 1;
  const tab = search["tab"] || "practice";

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

  const {
    data: access,
    isLoading: isCheckingAccess,
    refetch: refetchAccess,
  } = useQuery({
    queryKey: ["practice-access"],
    queryFn: () => fetchAccess(),
    enabled: Boolean(user),
  });

  function updateSearch(params: Partial<PracticeSearchParams>) {
    navigate({
      to: "/practice",
      search: (prev: PracticeSearchParams) => ({
        ...prev,
        ...params,
      }),
    });
  }

  function handleSelectSubject(selectedSubject: string) {
    navigate({
      to: "/practice",
      search: {
        subject: selectedSubject,
        topic: undefined,
        page: 1,
        tab: "practice",
      },
    });
  }

  function handleSelectTopic(selectedTopic: string) {
    navigate({
      to: "/practice",
      search: {
        subject,
        topic: selectedTopic,
        page: 1,
        tab: "practice",
      },
    });
  }

  function handlePageChange(newPage: number) {
    updateSearch({ page: newPage });
  }

  function handleBackToSubjects() {
    navigate({
      to: "/practice",
      search: {
        subject: undefined,
        topic: undefined,
        page: 1,
        tab: "practice",
      },
    });
  }

  function handleBackToTopics() {
    navigate({
      to: "/practice",
      search: {
        subject,
        topic: undefined,
        page: 1,
        tab: "practice",
      },
    });
  }

  function handleTabChange(nextTab: "practice" | "saved" | "progress") {
    navigate({
      to: "/practice",
      search: {
        subject: undefined,
        topic: undefined,
        page: 1,
        tab: nextTab,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {isCheckingAccess ? (
          <div className="mx-auto w-full max-w-2xl space-y-4 py-12">
            <div className="h-6 w-36 animate-pulse rounded bg-muted" />
            <div className="h-10 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-8 h-40 animate-pulse rounded-2xl border border-border bg-card/60" />
          </div>
        ) : !access?.unlocked ? (
          <AccessGate
            onAccessGranted={() => {
              void refetchAccess();
              void queryClient.invalidateQueries({ queryKey: ["practice-access"] });
            }}
          />
        ) : tab === "saved" ? (
          <SavedQuestions
            onGoToTopic={(sub, top) => {
              navigate({
                to: "/practice",
                search: { subject: sub, topic: top, page: 1, tab: "practice" },
              });
            }}
          />
        ) : tab === "progress" ? (
          <ProgressView
            onStartPracticing={() => {
              handleTabChange("practice");
            }}
          />
        ) : subject && topic ? (
          <PracticeEngine
            subjectSlug={subject}
            topicSlug={topic}
            currentPage={page}
            onPageChange={handlePageChange}
            onBackToTopics={handleBackToTopics}
          />
        ) : subject ? (
          <TopicList
            subjectSlug={subject}
            onSelectTopic={handleSelectTopic}
            onBackToSubjects={handleBackToSubjects}
          />
        ) : (
          <SubjectList
            onSelectSubject={handleSelectSubject}
            activeTab={tab}
            onTabChange={handleTabChange}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
