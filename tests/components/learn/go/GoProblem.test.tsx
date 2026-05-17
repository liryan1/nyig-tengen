"use client";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoProblem } from "@/components/learn/go/GoProblem";
import { GoProblemResponse } from "@/lib/go/interface";
import { UserRole, Visibility } from "@prisma/client";
import { ShowCoordProvider } from "@/components/providers/ShowCoordProvider";
import { useSession } from "next-auth/react";

// Mocks
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

const mockSubmit = vi.fn();
vi.mock("@/lib/rtk/slices/problems", () => ({
  useSubmitMutation: () => [
    mockSubmit,
    { isLoading: false, isError: false, isSuccess: false },
  ],
  useProblemLikeMutation: () => [vi.fn(), { isLoading: false }],
  useProblemStarMutation: () => [vi.fn(), { isLoading: false }],
}));

// Setup mockSubmit default behavior
mockSubmit.mockImplementation(() => ({
  unwrap: vi.fn().mockResolvedValue({
    evaluation: { status: "solved", mismatchIndex: 1 },
    problemSetCompleted: false,
    problemSetNum: "set-1",
  }),
}));

vi.mock("@/lib/rtk/slices/hooks", () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock("@/hooks/useCellSize", () => ({
  useCellSize: () => ({ cellSize: 40, boardPixelSize: 800 }),
}));

vi.mock("@/hooks/isMobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

// Mock sub-components to simplify testing
vi.mock("@/components/learn/go/GoProblemBoard", () => ({
  GoProblemBoard: ({ onMove }: any) => (
    <div data-testid="mock-board" onClick={() => onMove(3, 3)}>
      Mock Board
    </div>
  ),
}));

vi.mock("@/components/learn/go/GoProblemHeader", () => ({
  GoProblemHeader: ({ num }: any) => (
    <div data-testid="mock-header">Problem {num}</div>
  ),
}));

vi.mock("@/components/learn/go/GoProblemToolbar", () => ({
  GoProblemToolbar: ({ children }: any) => (
    <div data-testid="mock-toolbar">{children}</div>
  ),
}));

vi.mock("@/components/learn/go/GoProblemAdminToolbar", () => ({
  GoProblemAdminToolbar: () => (
    <div data-testid="mock-admin-toolbar">Mock Admin Toolbar</div>
  ),
}));

vi.mock("@/components/learn/go/GoBoardMenu", () => ({
  GoBoardMenu: () => <div data-testid="mock-menu">Mock Menu</div>,
}));

const mockProblem: GoProblemResponse = {
  num: "1",
  initial: "(;SZ[19]AB[pd][dp])",
  rank: 0,
  visibility: Visibility.PUBLIC,
  author: { id: "user-1", name: "Admin", role: "ADMIN" },
  views: 100,
};

describe("GoProblem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSession as any).mockReturnValue({
      data: { user: { id: "user-1", role: UserRole.USER } },
      status: "authenticated",
    });
  });

  it("renders problem header and board", () => {
    render(
      <ShowCoordProvider>
        <GoProblem problem={mockProblem} />
      </ShowCoordProvider>,
    );

    expect(screen.getByTestId("mock-header")).toHaveTextContent("Problem 1");
    expect(screen.getByTestId("mock-board")).toBeInTheDocument();
  });

  it("shows error message when submitting empty sequence", async () => {
    render(
      <ShowCoordProvider>
        <GoProblem problem={mockProblem} />
      </ShowCoordProvider>,
    );

    const submitButtons = screen.getAllByText(/Submit/i);
    fireEvent.click(submitButtons[0]);

    expect(screen.getByText(/Empty sequence/i)).toBeInTheDocument();
  });

  it("handles successful submission and shows congratulations", async () => {
    mockSubmit.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({
        evaluation: { status: "solved", mismatchIndex: 1 },
        problemSetCompleted: false,
        problemSetNum: "set-1",
      }),
    }));

    render(
      <ShowCoordProvider>
        <GoProblem problem={mockProblem} />
      </ShowCoordProvider>,
    );

    // Play a move via mock board
    fireEvent.click(screen.getByTestId("mock-board"));

    // Click submit
    const submitButtons = screen.getAllByText(/Submit/i);
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Congratulations! You solved the problem/i),
      ).toBeInTheDocument();
    });
  });

  it("handles mismatch and shows hint", async () => {
    mockSubmit.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({
        evaluation: { status: "mismatch", mismatchIndex: 0 },
        problemSetCompleted: false,
      }),
    }));

    render(
      <ShowCoordProvider>
        <GoProblem problem={mockProblem} />
      </ShowCoordProvider>,
    );

    fireEvent.click(screen.getByTestId("mock-board"));
    const submitButtons = screen.getAllByText(/Submit/i);
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Your move 1 seems off track/i),
      ).toBeInTheDocument();
    });
  });

  it("handles partial solution", async () => {
    mockSubmit.mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue({
        evaluation: { status: "partial", mismatchIndex: 1 },
        problemSetCompleted: false,
      }),
    }));

    render(
      <ShowCoordProvider>
        <GoProblem problem={mockProblem} />
      </ShowCoordProvider>,
    );

    fireEvent.click(screen.getByTestId("mock-board"));
    const submitButtons = screen.getAllByText(/Submit/i);
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/Looks good so far, please continue the sequence/i),
      ).toBeInTheDocument();
    });
  });
});
