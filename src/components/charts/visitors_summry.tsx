import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { Separator } from "../ui/separator";

type Range = "day" | "week" | "month" | "year";

const VisitorsSummary = () => {
  const [range, setRange] = useState<Range>("week");

  const dataMap = useMemo(
    () => ({
      day: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50 + 10)),
      week: [120, 200, 150, 170, 210, 250, 300],
      month: Array.from({ length: 30 }, () =>
        Math.floor(Math.random() * 400 + 100),
      ),
      year: [1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400],
    }),
    [],
  );

  const categoriesMap = useMemo(
    () => ({
      day: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      month: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    }),
    [],
  );

  const series = [
    {
      name: "Visitors",
      data: dataMap[range],
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.05,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categoriesMap[range],
      labels: {
        show: true,
        rotate: range === "day" ? -45 : 0,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} visitors`,
      },
    },
    grid: {
      strokeDashArray: 3,
    },
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-base font-semibold">
          <span>Visitors Overview</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Range</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {(["day", "week", "month", "year"] as Range[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRange(r)}>
                  {r.toUpperCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        <Chart options={options} series={series} type="area" height={260} />
      </CardContent>
    </Card>
  );
};

export default VisitorsSummary;