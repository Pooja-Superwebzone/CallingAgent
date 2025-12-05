import React, { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

const toNumber = (val: unknown) => (val === "" ? undefined : Number(val));

const schema = z.object({
    vehicle_driver_id: z.preprocess(toNumber, z.number()),
    total_amount: z.preprocess(toNumber, z.number()),
    initial_km_reading: z.preprocess(toNumber, z.number()),
    total_fuel_liters: z.preprocess(toNumber, z.number()),
    total_distance: z.preprocess(toNumber, z.number()),
    final_km_reading: z.preprocess(toNumber, z.number()),
    advance_amount: z.preprocess(toNumber, z.number()),
    remaining_amount: z.preprocess(toNumber, z.number()),
    mileage: z.preprocess(toNumber, z.number().max(20, "Mileage cannot exceed 20")),
    status: z.enum(["open", "closed"]),
    driver_payment_status: z.enum(["paid", "pending"]),
});

type LogSheetFormData = z.infer<typeof schema>;

interface Driver {
    emp_id: number;
    first_name: string;
    last_name: string;
}

interface LogSheet {
    log_sheet_id?: string;
    [key: string]: any;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    drivers: Driver[];
    selectedLogsheet?: LogSheet | null;
}

const API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
const AUTH_KEY = `Bearer ${API_KEY}`;

export const LogSheetForm: React.FC<Props> = ({
    open,
    onOpenChange,
    onSuccess,
    drivers,
    selectedLogsheet,
}) => {
    const form = useForm<LogSheetFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            vehicle_driver_id: 0,
            total_amount: 0,
            initial_km_reading: 0,
            final_km_reading: 0,
            total_distance: 0,
            total_fuel_liters: 0,
            advance_amount: 0,
            remaining_amount: 0,
            mileage: 0,
            status: "closed",
            driver_payment_status: "paid",
        },
    });

    useEffect(() => {
        if (selectedLogsheet) {
            form.reset({
                vehicle_driver_id: Number(selectedLogsheet.vehicle_driver_id),
                total_amount: Number(selectedLogsheet.total_amount),
                initial_km_reading: Number(selectedLogsheet.initial_km_reading),
                final_km_reading: Number(selectedLogsheet.final_km_reading),
                total_distance: Number(selectedLogsheet.total_distance),
                total_fuel_liters: Number(selectedLogsheet.total_fuel_liters),
                advance_amount: Number(selectedLogsheet.advance_amount),
                remaining_amount: Number(selectedLogsheet.remaining_amount),
                mileage: Number(selectedLogsheet.mileage),
                status: selectedLogsheet.status || "closed",
                driver_payment_status:
                    selectedLogsheet.driver_payment_status || "paid",
            });
        } else {
            form.reset();
        }
    }, [selectedLogsheet, form]);

    const handleSubmit = async (data: LogSheetFormData) => {
        const isEditing = !!selectedLogsheet?.log_sheet_id;

        const url = isEditing
            ? "https://n8n.srv799538.hstgr.cloud/webhook/updatelogsheet"
            : "https://n8n.srv799538.hstgr.cloud/webhook/insertlogsheet";

        const selectedDriver = drivers.find(
            (d) => d.emp_id === data.vehicle_driver_id
        );

        const payload = {
            ...data,
            created_by: 2,
            updated_by: 2,
            driver_name: selectedDriver
                ? `${selectedDriver.first_name} ${selectedDriver.last_name}`
                : "Unknown",
            regestration_number: "nh09hn8987",
            ...(isEditing && selectedLogsheet?.log_sheet_id
                ? { log_sheet_id: selectedLogsheet.log_sheet_id }
                : {}),
        };

        try {
            const response = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    apikey: API_KEY,
                    Authorization: AUTH_KEY,
                    "Content-Type": "application/json",
                    "Content-Profile": "srtms",
                    "Accept-Profile": "srtms",
                    jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
                    session_id: "1",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !Array.isArray(result) || result[0]?.status !== "success") {
                throw new Error(result[0]?.message || "Submission failed");
            }

            toast({
                title: isEditing ? "Log Sheet Updated" : "Log Sheet Created",
                description: result[0]?.message || "Operation completed successfully",
            });

            form.reset();
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("LogSheet submit error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to submit log sheet.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selectedLogsheet ? "Edit Log Sheet" : "Create New Log Sheet"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            name="vehicle_driver_id"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Driver</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value ? String(field.value) : ""}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select driver" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {drivers.map((d) => (
                                                    <SelectItem key={d.emp_id} value={String(d.emp_id)}>
                                                        {d.first_name} {d.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                ["total_amount", "Total Amount"],
                                ["initial_km_reading", "Initial KM"],
                                ["final_km_reading", "Final KM"],
                                ["total_distance", "Total Distance"],
                                ["total_fuel_liters", "Total Fuel (L)"],
                                ["advance_amount", "Advance Amount"],
                                ["remaining_amount", "Remaining Amount"],
                                ["mileage", "Mileage"],
                            ].map(([name, label]) => (
                                <FormField
                                    key={name}
                                    name={name as keyof LogSheetFormData}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{label}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    max={name === "mileage" ? 20 : undefined}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                name="status"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <select {...field} className="border p-2 rounded w-full">
                                                <option value="open">Open</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="driver_payment_status"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Status</FormLabel>
                                        <FormControl>
                                            <select {...field} className="border p-2 rounded w-full">
                                                <option value="paid">Paid</option>
                                                <option value="pending">Pending</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{selectedLogsheet ? "Update" : "Create"}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
