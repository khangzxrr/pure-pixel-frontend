import { render, screen } from "@testing-library/react";
import BarChart from "./BarChart";

type BarStubProps = {
  data: { labels: string[]; datasets: { label: string; data: number[] }[] };
  options: { plugins: { title: { text: string } } };
};

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data, options }: BarStubProps) => (
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

describe("BarChart", () => {
  it("passes the labels, dataset and default title to the underlying Bar chart", () => {
    render(
      <BarChart
        nameChart=""
        labelArray={["Jan", "Feb"]}
        dataArray={[100, 200]}
      />,
    );

    expect(screen.getByTestId("labels")).toHaveTextContent("Jan,Feb");
    expect(screen.getByTestId("dataset")).toHaveTextContent(
      "Doanh thu:100,200",
    );
    expect(screen.getByTestId("title")).toHaveTextContent("Biểu đồ cột");
  });

  it("uses the given chart name as the title", () => {
    render(
      <BarChart
        nameChart="Doanh thu theo tháng"
        labelArray={["Mar"]}
        dataArray={[300]}
      />,
    );

    expect(screen.getByTestId("title")).toHaveTextContent(
      "Doanh thu theo tháng",
    );
  });
});
