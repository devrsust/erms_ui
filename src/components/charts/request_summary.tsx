import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

const RequestSummary = () => {
  const series = [44, 55, 41, 17];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: ["A", "B", "C", "D"],
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 10,
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
            },
            value: {
              show: true,
            },
            total: {
              show: true,
              label: "Total",
              formatter: function (w) {
                return w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      position: "bottom",
    },
    grid: {
      padding: {
        bottom: -80, // pulls chart upward
      },
    },
  };

  return (
    <Card className="w-full max-w-md shadow-md gap-3">
      <CardHeader className="pb-0 mb-0 flex items-center w-full">
        <CardTitle className="w-full flex justify-between items-center text-base font-semibold">
          <span>Request Summary</span>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="">
        <Chart options={options} series={series} type="donut" width="100%" />
      </CardContent>
    </Card>
  );
};

export default RequestSummary;
