import { repositories } from "@/core/repositories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function AdminClientsPage() {
  const clients = await repositories.clients.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client management</h1>
        <p className="text-muted-foreground">All patients registered on the platform.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Favorites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.fullName}</TableCell>
                  <TableCell className="text-sm">
                    <div>{c.email}</div>
                    {c.phone && <div className="text-muted-foreground">{c.phone}</div>}
                  </TableCell>
                  <TableCell>{c.city ? `${c.city}, ${c.country}` : c.country ?? "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{c.favoriteDoctorIds.length}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
