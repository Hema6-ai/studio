'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";

export default function AcadOfficeDashboard() {
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Academic Office Dashboard</CardTitle>
                <CardDescription>Welcome to your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is a placeholder dashboard for the Academic Office.</p>
            </CardContent>
        </Card>
    </div>
  );
}
