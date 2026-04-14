import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UserSectionCards() {
  return (
    <div className="grid lg:grid-cols-4 gap-4 ">
      <Card>
        <CardDescription>Total request</CardDescription>
        <CardTitle></CardTitle>
      </Card>
      <Card></Card>
      <Card></Card>
      <Card></Card>
    </div>
  );
}
