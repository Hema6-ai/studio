'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useEffect } from 'react';

// Zod schema for form validation
const formSchema = z.object({
  rollNumber: z.string().min(1, "Roll Number is required."),
  fullName: z.string().min(1, "Full Name is required."),
  email: z.string().email().refine(val => val.endsWith('@iiits.in'), {
    message: 'Must be a valid IIIT Sri City email ID.'
  }),
  gender: z.string({ required_error: "Gender is required." }),
  mobile: z.string().length(10, "Mobile number must be 10 digits.").regex(/^\d+$/, "Must be a valid number."),
  programme: z.string({ required_error: "Programme is required." }),
  yearOfStudy: z.string({ required_error: "Year of Study is required." }),
  feeSemester: z.string({ required_error: "Fee semester is required." }),
  paymentMode: z.string({ required_error: "Payment mode is required." }),
  amountPaid: z.coerce.number().min(1, "Amount must be greater than 0."),
  transactionDetails: z.string().min(1, "Transaction details are required."),
  receiptPdf: z.custom<File>(val => val instanceof File, "Proof of payment is required.")
    .refine(file => file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(file => file.type === "application/pdf", "Only .pdf files are accepted."),
});

type FormValues = z.infer<typeof formSchema>;

const SEMESTER_ID = "Spring 2026";

export default function FeeReceiptPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  // Check for existing submission
  useEffect(() => {
    if (!user || !firestore) return;
    const checkSubmission = async () => {
      const receiptsRef = collection(firestore, 'fee_receipts');
      const q = query(receiptsRef, where("uid", "==", user.uid), where("semester", "==", SEMESTER_ID));
      const querySnapshot = await getDocs(q);
      setHasSubmitted(!querySnapshot.empty);
    };
    checkSubmission();
  }, [user, firestore]);

  // Set email when user loads
  useEffect(() => {
    if (user?.email) {
      form.setValue('email', user.email);
    }
  }, [user, form]);
  
  const onSubmit = async (values: FormValues) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
        return;
    }
    
    if (hasSubmitted) {
        toast({ variant: 'destructive', title: 'Duplicate Submission', description: 'You have already submitted a receipt for this semester.' });
        return;
    }

    setIsSubmitting(true);
    
    try {
        const storage = getStorage();
        const filePath = `fee-receipts/${SEMESTER_ID}/${values.rollNumber}/receipt.pdf`;
        const storageRef = ref(storage, filePath);

        // 1. Upload PDF
        const uploadTask = await uploadBytes(storageRef, values.receiptPdf);
        const receiptPdfUrl = await getDownloadURL(uploadTask.ref);

        // 2. Save to Firestore
        const receiptsCollection = collection(firestore, 'fee_receipts');
        await addDoc(receiptsCollection, {
            uid: user.uid,
            semester: SEMESTER_ID,
            rollNumber: values.rollNumber,
            fullName: values.fullName,
            email: values.email,
            gender: values.gender,
            mobile: values.mobile,
            programme: values.programme,
            yearOfStudy: values.yearOfStudy,
            feeSemester: values.feeSemester,
            paymentMode: values.paymentMode,
            amountPaid: values.amountPaid,
            transactionDetails: values.transactionDetails,
            receiptPdfUrl: receiptPdfUrl,
            submittedAt: serverTimestamp(),
            status: "submitted",
        });

        toast({ title: 'Success', description: 'Fee receipt submitted successfully.' });
        setHasSubmitted(true); // Prevent resubmission
    } catch (error) {
        console.error("Submission error:", error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'An error occurred. Please try again.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (hasSubmitted === null) {
      return <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><p>Checking submission status...</p></CardContent></Card>;
  }

  if (hasSubmitted) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Fee Receipt Submitted</CardTitle>
                  <CardDescription>You have already submitted your fee receipt for the {SEMESTER_ID} semester.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p>No further action is required. You will be notified once it is processed by the accounts office.</p>
              </CardContent>
          </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spring 2026 – Fee Payment Receipt Submission</CardTitle>
        <CardDescription>Please fill out the form accurately and upload your payment receipt.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Student Information</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="rollNumber" render={({ field }) => (
                         <FormItem><FormLabel>Roll Number *</FormLabel><FormControl><Input {...field} placeholder="S20230030404" /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="fullName" render={({ field }) => (
                         <FormItem><FormLabel>Full Name (As per SSC Records) *</FormLabel><FormControl><Input {...field} placeholder="Hema Polumati" /></FormControl><FormMessage /></FormItem>
                     )} />
                     <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>IIIT Sri City Email ID *</FormLabel><FormControl><Input {...field} readOnly disabled /></FormControl><FormMessage /></FormItem>
                     )} />
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                     )} />
                     <FormField control={form.control} name="mobile" render={({ field }) => (
                         <FormItem><FormLabel>Mobile Number *</FormLabel><FormControl><Input {...field} type="tel" maxLength={10} /></FormControl><FormMessage /></FormItem>
                     )} />
                 </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Academic Details</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="programme" render={({ field }) => (
                         <FormItem><FormLabel>Programme *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your programme" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="B.Tech in CSE">B.Tech in CSE</SelectItem>
                                <SelectItem value="B.Tech in ECE">B.Tech in ECE</SelectItem>
                                <SelectItem value="B.Tech in AI & DS">B.Tech in AI & DS</SelectItem>
                                <SelectItem value="MS by Research in CSE">MS by Research in CSE</SelectItem>
                                <SelectItem value="MS by Research in ECE">MS by Research in ECE</SelectItem>
                                <SelectItem value="MS by Research in MDS">MS by Research in MDS</SelectItem>
                                <SelectItem value="PhD in CSE">PhD in CSE</SelectItem>
                                <SelectItem value="PhD in ECE">PhD in ECE</SelectItem>
                                <SelectItem value="PhD in MDS">PhD in MDS</SelectItem>
                                <SelectItem value="PhD in CSE (Part Time)">PhD in CSE (Part Time)</SelectItem>
                                <SelectItem value="PhD in ECE (Part Time)">PhD in ECE (Part Time)</SelectItem>
                                <SelectItem value="PhD in MDS (Part Time)">PhD in MDS (Part Time)</SelectItem>
                            </SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                     )} />
                     <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                         <FormItem><FormLabel>Year of Study *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem>
                            </SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                     )} />
                     <FormField control={form.control} name="feeSemester" render={({ field }) => (
                         <FormItem><FormLabel>Fee Paid for which Semester *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="2 sem - UG">2 sem - UG</SelectItem><SelectItem value="4 sem - UG">4 sem - UG</SelectItem>
                                <SelectItem value="6 sem - UG">6 sem - UG</SelectItem><SelectItem value="8 sem - UG">8 sem - UG</SelectItem>
                                <SelectItem value="MS">MS</SelectItem><SelectItem value="PhD">PhD</SelectItem>
                                <SelectItem value="PhD (Part Time)">PhD (Part Time)</SelectItem>
                            </SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                     )} />
                 </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
                 <h3 className="font-semibold mb-2">Fee & Transaction Details</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="paymentMode" render={({ field }) => (
                         <FormItem><FormLabel>Paid Through *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select payment mode" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Canara Easyfee Collect">Canara Easyfee Collect</SelectItem>
                                <SelectItem value="NEFT/RTGS">NEFT/RTGS</SelectItem>
                                <SelectItem value="Education Loan">Education Loan</SelectItem>
                            </SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                     )} />
                     <FormField control={form.control} name="amountPaid" render={({ field }) => (
                         <FormItem><FormLabel>Fee Paid (Total Amount) *</FormLabel><FormControl><Input {...field} type="number" placeholder="e.g., 209000" /></FormControl><FormMessage /></FormItem>
                     )} />
                     <div className="md:col-span-2">
                        <FormField control={form.control} name="transactionDetails" render={({ field }) => (
                            <FormItem><FormLabel>Transaction No(s) & Date of Payment *</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="IOBAN2535808XXXX&#10;DOP-26/12/2025" /></FormControl><FormMessage /></FormItem>
                        )} />
                     </div>
                 </div>
            </div>

             <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Proof of Payment</h3>
                 <FormField control={form.control} name="receiptPdf" render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                        <FormLabel>Upload Proof of Payment (PDF Only, Max 5MB) *</FormLabel>
                        <FormControl>
                            <Input type="file" accept="application/pdf" onChange={e => onChange(e.target.files?.[0])} {...rest} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Fee Receipt'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
