import { render, screen } from "@testing-library/react";
import TotalMoneyUpgrade from "./TotalMoneyUpgrade";

type LineStubProps = {
  data: { labels: string[]; datasets: { label: string; data: number[] }[] };
  options: { plugins: { title: { text: string } } };
};

vi.mock("react-chartjs-2", () => ({
  Line: ({ data, options }: LineStubProps) => (
    <div>
      <p data-testid="title">{options.plugins.title.text}</p>
      <p data-testid="labels">{data.labels.join(",")}</p>
      {data.datasets.map((ds) => (
        <p key={ds.label} data-testid="dataset">
          {ds.label}:{ds.data.join(",")}
        </p>
      ))}
    </div>
  ),
}));

describe("TotalMoneyUpgrade", () => {
  it("passes the labels, dataset and default title to the underlying Line chart", () => {
    render(
      <TotalMoneyUpgrade
        nameChart=""
        labelArray={["Jan", "Feb"]}
        dataArray={[1000, 2000]}
      />,
    );

    expect(screen.getByTestId("labels")).toHaveTextContent("Jan,Feb");
    expect(screen.getByTestId("dataset")).toHaveTextContent(
      "Doanh thu:1000,2000",
    );
    expect(screen.getByTestId("title")).toHaveTextContent(
      "Biểu đồ doanh thu",
    );
  });

  it("uses the given chart name as the title", () => {
    render(
      <TotalMoneyUpgrade
        nameChart="Doanh thu nâng cấp"
        labelArray={["Mar"]}
        dataArray={[3000]}
      />,
    );

    expect(screen.getByTestId("title")).toHaveTextContent(
      "Doanh thu nâng cấp",
    );
  });
});
