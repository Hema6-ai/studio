'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SemesterPolicy {
    id: string;
    semesterId: string;
    hasElectives: boolean;
    usesStudentPreferences: boolean;
    usesCGPA: boolean;
    numberOfElectiveBins: number;
    maxTimetableRetries: number;
}

const SEMESTERS = ['UG1', 'UG2', 'UG3', 'UG4'];

const defaultPolicies: Record<string, Omit<SemesterPolicy, 'id'>> = {
    UG1: { semesterId: 'UG1', hasElectives: false, usesStudentPreferences: false, usesCGPA: false, numberOfElectiveBins: 0, maxTimetableRetries: 3 },
    UG2: { semesterId: 'UG2', hasElectives: false, usesStudentPreferences: false, usesCGPA: false, numberOfElectiveBins: 0, maxTimetableRetries: 3 },
    UG3: { semesterId: 'UG3', hasElectives: true, usesStudentPreferences: true, usesCGPA: true, numberOfElectiveBins: 5, maxTimetableRetries: 3 },
    UG4: { semesterId: 'UG4', hasElectives: true, usesStudentPreferences: true, usesCGPA: true, numberOfElectiveBins: 5, maxTimetableRetries: 3 },
};

const SemesterPolicyCard = ({ user, policyData, semesterId }: { user: any; policyData: Omit<SemesterPolicy, 'id'>; semesterId: string; }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [policy, setPolicy] = useState(policyData);
    const [isSaving, setIsSaving] = useState(false);
    
    const isLocked = semesterId === 'UG1' || semesterId === 'UG2';

    useEffect(() => {
        setPolicy(policyData);
    }, [policyData]);

    const handleFieldChange = (field: keyof SemesterPolicy, value: any) => {
        setPolicy(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'hasElectives' && !value) {
                newState.usesStudentPreferences = false;
                newState.numberOfElectiveBins = 0;
            }
            return newState;
        });
    };

    const handleSave = async () => {
        if (!user || !firestore) return;
        setIsSaving(true);
        
        // Validation
        if (policy.hasElectives && policy.numberOfElectiveBins <= 0) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Number of elective bins must be greater than 0 if electives are enabled.' });
            setIsSaving(false);
            return;
        }

        const retries = Math.max(1, Math.min(10, policy.maxTimetableRetries));
        if (retries !== policy.maxTimetableRetries) {
             handleFieldChange('maxTimetableRetries', retries);
        }

        const docRef = doc(firestore, 'semesterPolicies', semesterId);
        try {
            await setDocumentNonBlocking(docRef, {
                ...policy,
                maxTimetableRetries: retries,
                lastUpdatedBy: user.email,
                lastUpdatedAt: serverTimestamp()
            }, { merge: true });

            toast({ title: 'Policy Saved', description: `${semesterId} academic policy has been updated.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Save Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> {semesterId} Policy</CardTitle>
                <CardDescription>Define the core academic rules for this semester.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor={`hasElectives-${semesterId}`}>Has Electives</Label>
                        <p className="text-xs text-muted-foreground">Enables elective course selection.</p>
                    </div>
                    <Switch id={`hasElectives-${semesterId}`} checked={policy.hasElectives} onCheckedChange={(val) => handleFieldChange('hasElectives', val)} disabled={isLocked || isSaving} />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor={`usesPrefs-${semesterId}`}>Uses Student Preferences</Label>
                         <p className="text-xs text-muted-foreground">Allows students to rank choices.</p>
                    </div>
                    <Switch id={`usesPrefs-${semesterId}`} checked={policy.usesStudentPreferences} onCheckedChange={(val) => handleFieldChange('usesStudentPreferences', val)} disabled={isLocked || !policy.hasElectives || isSaving}/>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor={`usesCGPA-${semesterId}`}>Uses CGPA for Bidding</Label>
                         <p className="text-xs text-muted-foreground">Prioritizes based on CGPA.</p>
                    </div>
                    <Switch id={`usesCGPA-${semesterId}`} checked={policy.usesCGPA} onCheckedChange={(val) => handleFieldChange('usesCGPA', val)} disabled={isLocked || isSaving}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`electiveBins-${semesterId}`}>Number of Elective Bins</Label>
                    <Input id={`electiveBins-${semesterId}`} type="number" value={policy.numberOfElectiveBins} onChange={(e) => handleFieldChange('numberOfElectiveBins', parseInt(e.target.value, 10))} disabled={isLocked || !policy.hasElectives || isSaving} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor={`retries-${semesterId}`}>Max Timetable Retries</Label>
                    <Input id={`retries-${semesterId}`} type="number" min="1" max="10" value={policy.maxTimetableRetries} onChange={(e) => handleFieldChange('maxTimetableRetries', parseInt(e.target.value, 10))} disabled={isSaving} />
                     <p className="text-xs text-muted-foreground">Number of attempts for the scheduler (1-10).</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                    <Save className="mr-2"/>
                    {isSaving ? 'Saving...' : `Save ${semesterId} Policy`}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default function TimetableAdminPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const policiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'semesterPolicies') : null, [firestore]);
    const { data: fetchedPolicies, isLoading: loadingPolicies } = useCollection(policiesQuery);

    const policiesMap = useMemo(() => {
        const map = new Map<string, SemesterPolicy>();
        fetchedPolicies?.forEach(policy => {
            map.set(policy.id, policy as SemesterPolicy);
        });
        return map;
    }, [fetchedPolicies]);

    if (isUserLoading || loadingPolicies) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {SEMESTERS.map(semesterId => (
                   <SemesterPolicyCard
                        key={semesterId}
                        user={user}
                        semesterId={semesterId}
                        policyData={policiesMap.get(semesterId) || defaultPolicies[semesterId]}
                   />
               ))}
            </div>

             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Next Phases</CardTitle>
                     <CardDescription>These sections will be enabled once semester policies are finalized.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base text-muted-foreground">Data Configuration</CardTitle></CardHeader>
                        <CardContent><Button variant="secondary" disabled>Configure Courses/Faculty/Rooms</Button></CardContent>
                    </Card>
                     <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base text-muted-foreground">Student Enrollment</CardTitle></CardHeader>
                        <CardContent><Button variant="secondary" disabled>Run Enrollment Process</Button></CardContent>
                    </Card>
                     <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base text-muted-foreground">Scheduling</CardTitle></CardHeader>
                        <CardContent><Button variant="secondary" disabled>Generate Master Timetable</Button></CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}
