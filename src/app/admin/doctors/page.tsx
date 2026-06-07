import Link from "next/link";
import { BadgeCheck, Settings2 } from "lucide-react";
import { repositories } from "@/core/repositories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { DoctorAdminActions } from "@/components/admin/doctor-admin-actions";

const STATUS_VARIANT = { active: "success", pending: "warning", suspended: "destructive" } as const;

export default async function AdminDoctorsPage() {
  const doctors = await repositories.doctors.listAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctor management</h1>
        <p className="text-muted-foreground">Approve, suspend, and verify providers.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      <Link href={`/doctor/${d.username}`} className="hover:text-primary hover:underline">
                        {d.fullName}
                      </Link>
                      {d.verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{d.address.city}, {d.address.country}</div>
                  </TableCell>
                  <TableCell>{d.specialty}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{d.planId}</Badge></TableCell>
                  <TableCell><RatingStars rating={d.rating} showValue /></TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[d.status]} className="capitalize">{d.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/doctors/${d.id}`}><Settings2 className="h-4 w-4" /> Manage</Link>
                      </Button>
                      <DoctorAdminActions id={d.id} status={d.status} verified={d.verified} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
