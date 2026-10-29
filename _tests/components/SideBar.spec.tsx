import { fireEvent, render, screen } from "@testing-library/react";
import { Sidebar } from "@/src/components/app/Sidebar";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("SideBar tests", () => {
  test("Testando renderização de componentes de link da navegaçao", () => {
    mockUsePathname.mockReturnValue("/");

    render(<Sidebar />);

    const links = ["Dashboard", "Veículos"];

    links.forEach((link) => {
      expect(screen.getByRole("link", { name: link })).toBeInTheDocument();
    });
  });

  test("Testando navegação das rotas dos links", () => {
    mockUsePathname.mockReturnValue("/");

    render(<Sidebar />);

    const links = [
      {
        name: "Dashboard",
        href: "/",
      },
      {
        name: "Veículos",
        href: "/veiculos",
      },
    ];

    links.forEach((link) => {
      const componentLink = screen.getByRole("link", { name: link.name });

      fireEvent.click(componentLink);

      expect(componentLink).toHaveAttribute("href", link.href);
    });
  });
});
