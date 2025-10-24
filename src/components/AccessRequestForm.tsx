import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  asset_id: z.string().min(1, "Please select a dataset"),
  business_justification: z.string().min(20, "Business justification must be at least 20 characters"),
  use_case: z.string().min(20, "Use case description must be at least 20 characters"),
  expected_tps: z.string().optional(),
  connected_app: z.string().optional(),
  api_endpoint: z.string().optional(),
  requested_access_level: z.enum(["read", "write", "admin"]),
  data_retention_period: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Asset {
  id: string;
  name: string;
  category: string;
}

export function AccessRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requested_access_level: "read",
    },
  });

  // Load approved assets
  useState(() => {
    const loadAssets = async () => {
      try {
        const { data, error } = await supabase
          .from("assets")
          .select("id, name, category")
          .eq("status", "approved")
          .order("name");

        if (error) throw error;
        setAvailableAssets(data || []);
      } catch (error) {
        console.error("Error loading assets:", error);
        toast.error("Failed to load available datasets");
      } finally {
        setIsLoadingAssets(false);
      }
    };

    loadAssets();
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const { error } = await (supabase.from("access_requests" as any).insert({
        consumer_id: user.id,
        asset_id: values.asset_id,
        business_justification: values.business_justification,
        use_case: values.use_case,
        expected_tps: values.expected_tps,
        connected_app: values.connected_app,
        api_endpoint: values.api_endpoint,
        requested_access_level: values.requested_access_level,
        data_retention_period: values.data_retention_period,
      }) as any);

      if (error) throw error;

      toast.success("Access request submitted successfully");
      form.reset();
    } catch (error: any) {
      console.error("Error submitting access request:", error);
      toast.error(error.message || "Failed to submit access request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Data Access</CardTitle>
        <CardDescription>
          Submit a request to access an approved dataset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingAssets}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dataset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} {asset.category && `(${asset.category})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Justification *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain the business need for this data access..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear business rationale for requesting access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="use_case"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Use Case *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how you will use this data..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detail the specific use case and expected outcomes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requested_access_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_tps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected TPS</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 100 TPS" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Transactions per second
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="connected_app"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connected App/Service</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Analytics Dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Endpoint</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., /api/v1/data" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="data_retention_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Retention Period</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 90 days" {...field} />
                  </FormControl>
                  <FormDescription>
                    How long will you retain the accessed data?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Access Request"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
