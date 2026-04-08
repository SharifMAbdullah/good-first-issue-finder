import { NextRequest, NextResponse } from "next/server";
import { Platform, FetchIssuesParams, PaginatedResponse } from "@/types/issues";
import { IssueOrchestrator } from "../services/issueOrchestrator";

const parseArrayParam = (param: string | null): string[] => {
  if (!param) return [];
  return param
    .split(",")
    .map((val: string): string => val.trim().toLowerCase());
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams }: URL = new URL(request.url);

    const platformsParam: string[] = parseArrayParam(
      searchParams.get("platforms"),
    );
    const languagesParam: string[] = parseArrayParam(
      searchParams.get("languages"),
    );
    const pageParam: number = parseInt(searchParams.get("page") || "1", 10);
    const queryParam: string = searchParams.get("q")?.trim() || "";
    const sortParam: string = searchParams.get("sort") || "newest";

    const params: FetchIssuesParams = {
      platforms: (platformsParam.length > 0
        ? platformsParam
        : ["github"]) as Platform[],
      languages: languagesParam,
      page: isNaN(pageParam) || pageParam < 1 ? 1 : pageParam,
      query: queryParam,
      sort: sortParam,
    };

    // Orchestrator handles fetching, combining, and sorting
    const responsePayload: PaginatedResponse =
      await IssueOrchestrator.getUnifiedIssues(params);

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "Unknown routing error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
