'use client';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings, Database, PlayCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TimetableAdminPage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <div className="text-center p-12">Loading user data...</div>;
    }

    if (!user || user.email !== 'tt@iiits.in') {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-destructive">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This dashboard is restricted to the Academic Office Timetable Administrator (tt@iiits.in) only.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Academic Office – Timetable Control Panel</CardTitle>
                    <CardDescription>IIIT Sri City</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            Any change here impacts student enrollment and timetable generation. Proceed with caution.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Academic Policy Setup</CardTitle>
                        <CardDescription>Define the core rules for the semester.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="semester-select">Target Semester</Label>
                            <Select defaultValue="UG1">
                                <SelectTrigger id="semester-select">
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UG1">UG1</SelectItem>
                                    <SelectItem value="UG2">UG2</SelectItem>
                                    <SelectItem value="UG3">UG3</SelectItem>
                                    <SelectItem value="UG4">UG4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label htmlFor="has-electives">Has Electives</Label>
                                <p className="text-xs text-muted-foreground">Enables elective selection bins.</p>
                            </div>
                            <Switch id="has-electives" />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label htmlFor="uses-cgpa">Uses CGPA for Bidding</Label>
                                 <p className="text-xs text-muted-foreground">Prioritizes based on CGPA.</p>
                            </div>
                            <Switch id="uses-cgpa" disabled/>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label htmlFor="uses-prefs">Uses Student Preferences</Label>
                                 <p className="text-xs text-muted-foreground">Allows students to rank choices.</p>
                            </div>
                            <Switch id="uses-prefs" disabled/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="elective-bins">Number of Elective Bins</Label>
                            <Input id="elective-bins" type="number" placeholder="e.g., 5" disabled />
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Data Configuration</CardTitle>
                            <CardDescription>Define all courses, rooms, and faculty constraints.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Card className="bg-muted/50">
                                <CardHeader><CardTitle className="text-base text-muted-foreground">UG Configuration</CardTitle></CardHeader>
                                <CardContent><Button variant="secondary" disabled>Configure in next phase</Button></CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                                <CardHeader><CardTitle className="text-base text-muted-foreground">Course Configuration</CardTitle></CardHeader>
                                <CardContent><Button variant="secondary" disabled>Configure in next phase</Button></CardContent>
                            </Card>
                             <Card className="bg-muted/50">
                                <CardHeader><CardTitle className="text-base text-muted-foreground">Room Configuration</CardTitle></CardHeader>
                                <CardContent><Button variant="secondary" disabled>Configure in next phase</Button></CardContent>
                            </Card>
                             <Card className="bg-muted/50">
                                <CardHeader><CardTitle className="text-base text-muted-foreground">Faculty Configuration</CardTitle></CardHeader>
                                <CardContent><Button variant="secondary" disabled>Configure in next phase</Button></CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5" /> Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <Button variant="outline" disabled>Generate Student Dataset</Button>
                            <Button disabled>Generate Timetable</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
