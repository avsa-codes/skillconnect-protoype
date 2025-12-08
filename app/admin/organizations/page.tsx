"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Search, Download, Eye, Edit, Building2 } from "lucide-react";
import AdminRoute from "@/components/admin/AdminRoute";

export default function AdminOrganizationsPage() {
  const supabase = createSupabaseBrowserClient();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // Fetch all organizations
  // -------------------------
  useEffect(() => {
    async function loadOrganizations() {
      setLoading(true);

      const { data, error } = await supabase
        .from("organization_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching organizations:", error);
        setLoading(false);
        return;
      }

      setOrganizations(data || []);
      setFilteredOrgs(data || []);



      // Fetch real task counts
const orgIds = (data || []).map((o) => o.user_id);

const { data: taskCounts } = await supabase
  .from("tasks")
  .select("org_id", { count: "exact" })
  .in("org_id", orgIds);

const countMap: Record<string, number> = {};
taskCounts?.forEach((t: any) => {
  if (!countMap[t.org_id]) countMap[t.org_id] = 0;
  countMap[t.org_id] += 1;
});

// Merge count into org objects
const updated = (data || []).map((o) => ({
  ...o,
  tasks_posted: countMap[o.user_id] || 0,
}));

setOrganizations(updated);
setFilteredOrgs(updated);




      const uniqueIndustries = [...new Set((data || []).map((o) => o.industry))].filter(Boolean);
      setIndustries(uniqueIndustries);

      setLoading(false);
    }

    loadOrganizations();
  }, []);

  // -------------------------
  // Filtering Logic
  // -------------------------
  useEffect(() => {
    let orgs = [...organizations];

    // search
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      orgs = orgs.filter(
        (o) =>
          o.company_name?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q) ||
          o.contact_person?.toLowerCase().includes(q)
      );
    }

    // industry
    if (industryFilter !== "all") {
      orgs = orgs.filter((o) => o.industry === industryFilter);
    }

    setFilteredOrgs(orgs);
  }, [searchQuery, industryFilter, organizations]);

  return (
    <AdminRoute>
      <DashboardLayout allowedRoles={["admin", "super_admin"]}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
              <p className="text-muted-foreground">Manage all registered organizations</p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by company name, email, or contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organizations Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Organizations</CardTitle>
              <CardDescription>{filteredOrgs.length} organization(s) found</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredOrgs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No organizations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrgs.map((org) => (
                        <TableRow key={org.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{org.company_name}</p>
                                <p className="text-sm text-muted-foreground">{org.email}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>{org.contact_person}</TableCell>
                          <TableCell>{org.industry}</TableCell>
                          <TableCell>{org.company_size}</TableCell>
                          <TableCell>{org.city || "-"}</TableCell>

                          <TableCell>
                            <span className="font-medium">{org.tasks_posted}</span>
                            <span className="text-muted-foreground text-sm"> posted</span>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedOrg(org)}>
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* View Modal */}
         <Dialog open={!!selectedOrg && !showEditModal} onOpenChange={() => setSelectedOrg(null)}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">

    {selectedOrg && (
      <>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            {selectedOrg.logo_url ? (
              <img src={selectedOrg.logo_url} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-5 w-5" />
              </div>
            )}

            {selectedOrg.company_name}
          </DialogTitle>

          <DialogDescription>
            {selectedOrg.industry || "No industry specified"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <OrgField label="Contact Person" value={selectedOrg.contact_person} />
            <OrgField label="Email" value={selectedOrg.email} />
            <OrgField label="Phone" value={selectedOrg.phone || "-"} />
            <OrgField label="Company Size" value={selectedOrg.company_size || "-"} />
            <OrgField label="City" value={selectedOrg.city || "-"} />
            <OrgField label="Tasks Posted" value={selectedOrg.tasks_posted} />
            <OrgField label="Active Students" value={selectedOrg.active_students || 0} />
            <OrgField label="Created At" value={new Date(selectedOrg.created_at).toLocaleDateString()} />
            <OrgField label="Updated At" value={new Date(selectedOrg.updated_at).toLocaleDateString()} />
          </div>

          {/* Description */}
          {selectedOrg.description && (
            <div>
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-muted-foreground">{selectedOrg.description}</p>
            </div>
          )}

          {/* Logo Preview */}
          {selectedOrg.logo_url && (
            <div>
              <p className="text-sm font-medium mb-1">Logo</p>
              <img src={selectedOrg.logo_url} className="h-24 w-24 rounded-xl object-cover border" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedOrg(null)}>
            Close
          </Button>

          <Button onClick={() => setShowEditModal(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>


          {/* Edit Modal */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent>
              {selectedOrg && (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Organization</DialogTitle>
                    <DialogDescription>{selectedOrg.company_name}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input defaultValue={selectedOrg.company_name} className="mt-1" />
                    </div>

                    <div>
                      <Label>Contact Person</Label>
                      <Input defaultValue={selectedOrg.contact_person} className="mt-1" />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input defaultValue={selectedOrg.email} className="mt-1" />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input defaultValue={selectedOrg.phone || ""} className="mt-1" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowEditModal(false)}>Save Changes</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AdminRoute>


  );

      function OrgField({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 bg-muted/50 rounded-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

}
