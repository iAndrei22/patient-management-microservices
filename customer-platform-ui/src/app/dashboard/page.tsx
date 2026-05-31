"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Building2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  createCustomer,
  deleteCustomer,
  formatDisplayDate,
  getCustomers,
  updateCustomer,
} from "@/lib/customers";
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerPayload,
} from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PaymentGeneratorModal } from "@/components/payment-generator";

const emptyCreateForm = (): CreateCustomerInput => ({
  name: "",
  email: "",
  address: "",
  dateOfBirth: "",
});

const emptyUpdateForm = (): UpdateCustomerPayload => ({
  name: "",
  email: "",
  address: "",
  dateOfBirth: "",
});

const navItems = [{ label: "Clients", icon: Users, active: true }] as const;

const PAGE_SIZE = 10;

type SortColumn = "name" | "email" | "address" | "dateOfBirth";
type SortDirection = "asc" | "desc";

export default function DashboardPage() {
  const router = useRouter();
  const { logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentOpenForId, setPaymentOpenForId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [updateForm, setUpdateForm] = useState(emptyUpdateForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState({
    name: "",
    email: "",
    address: "",
    dateOfBirth: "",
  });
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const loadCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    setError("");
    try {
      setCustomers(await getCustomers());
    } catch {
      setError("Failed to load customers. Is the API running on port 4004?");
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const timeoutId = window.setTimeout(() => {
      void loadCustomers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const globalSearch = searchTerm.trim().toLowerCase();
    const nameFilter = columnFilters.name.trim().toLowerCase();
    const emailFilter = columnFilters.email.trim().toLowerCase();
    const addressFilter = columnFilters.address.trim().toLowerCase();
    const dobFilter = columnFilters.dateOfBirth.trim();

    return customers.filter((customer) => {
      const name = customer.name.toLowerCase();
      const email = customer.email.toLowerCase();
      const address = customer.address.toLowerCase();
      const dob = customer.dateOfBirth ?? "";

      const matchesGlobal =
        !globalSearch ||
        name.includes(globalSearch) ||
        email.includes(globalSearch) ||
        address.includes(globalSearch) ||
        dob.includes(globalSearch);

      const matchesColumns =
        (!nameFilter || name.includes(nameFilter)) &&
        (!emailFilter || email.includes(emailFilter)) &&
        (!addressFilter || address.includes(addressFilter)) &&
        (!dobFilter || dob.includes(dobFilter));

      return matchesGlobal && matchesColumns;
    });
  }, [customers, searchTerm, columnFilters]);

  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];
    sorted.sort((a, b) => {
      const left = (a[sortColumn] ?? "").toLowerCase();
      const right = (b[sortColumn] ?? "").toLowerCase();
      const result = left.localeCompare(right);
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [filteredCustomers, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCustomers = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return sortedCustomers.slice(start, start + PAGE_SIZE);
  }, [sortedCustomers, safeCurrentPage]);

  function resetCreateForm() {
    setCreateForm(emptyCreateForm());
  }

  function openEditDialog(customer: Customer) {
    setEditingId(customer.id);
    setUpdateForm({
      name: customer.name,
      email: customer.email,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth?.slice(0, 10) ?? "",
    });
    setEditOpen(true);
  }

  function openPaymentDialog(customer: Customer) {
    setPaymentOpenForId(customer.id);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setCreateError("");
    try {
      await createCustomer(createForm);
      setAddOpen(false);
      resetCreateForm();
      await loadCustomers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create customer.";
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setIsSubmitting(true);
    setError("");
    try {
      await updateCustomer(editingId, updateForm);
      setEditOpen(false);
      setEditingId(null);
      await loadCustomers();
    } catch {
      setError("Failed to update customer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    try {
      await deleteCustomer(customer.id);
      await loadCustomers();
    } catch {
      setError("Failed to delete customer.");
    }
  }

  function setColumnFilter(
    key: keyof typeof columnFilters,
    value: string
  ): void {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }

  function clearFilters(): void {
    setSearchTerm("");
    setColumnFilters({
      name: "",
      email: "",
      address: "",
      dateOfBirth: "",
    });
    setCurrentPage(1);
  }

  function toggleSort(column: SortColumn): void {
    setCurrentPage(1);

    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  }

  function renderSortIcon(column: SortColumn) {
    if (sortColumn !== column) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground/70" />;
    }

    return sortDirection === "asc" ? (
      <ChevronUp className="size-3.5 text-primary" />
    ) : (
      <ChevronDown className="size-3.5 text-primary" />
    );
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
            <Building2 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Customer Platform
            </p>
            <p className="text-xs text-muted-foreground">Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ label, icon: Icon, active }) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70"
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              {label}
            </span>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-3.5" />
            </div>
            <span className="text-sm font-semibold">Customer Platform</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
            <LogOut className="size-3.5" />
            Log out
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="animate-enter flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Clients
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your customer records
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {isLoadingCustomers
                  ? "Loading..."
                  : `${sortedCustomers.length} of ${customers.length} ${customers.length === 1 ? "client" : "clients"}`}
              </p>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/dashboard/reports")}
              >
                <BarChart3 className="size-4" />
                View reports
              </Button>
            </header>

            {error && (
              <p
                className="animate-enter rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive stagger-1"
                role="alert"
              >
                {error}
              </p>
            )}

            <Card className="animate-enter overflow-hidden border-border/80 py-0 shadow-md shadow-zinc-900/5 ring-1 ring-border/60 stagger-2">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/30 px-6 py-5">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    Customer directory
                  </CardTitle>
                  <CardDescription>
                    Create, view, update, and delete customers.
                  </CardDescription>
                </div>
                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:min-w-md">
                  <Input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search customers (name, email, address, date)..."
                    className="bg-background"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={clearFilters}
                      disabled={!searchTerm && !Object.values(columnFilters).some(Boolean)}
                    >
                      Clear filters
                    </Button>
                    <Dialog
                      open={addOpen}
                      onOpenChange={(open) => {
                        setAddOpen(open);
                        if (!open) {
                          resetCreateForm();
                          setCreateError("");
                        }
                      }}
                    >
                      <DialogTrigger
                        render={
                          <Button className="gap-2 shadow-sm" size="default" />
                        }
                      >
                        <Plus className="size-4" />
                        Add Customer
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Customer</DialogTitle>
                          <DialogDescription>
                            Create a new customer record.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                          <CustomerFields
                            values={createForm}
                            onChange={setCreateForm}
                          />
                          {createError && (
                            <p className="text-sm text-destructive" role="alert">
                              {createError}
                            </p>
                          )}
                          <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? "Saving..." : "Create"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingCustomers ? (
                  <p className="px-6 py-10 text-sm text-muted-foreground">
                    Loading customers...
                  </p>
                ) : customers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                    <Users className="size-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No customers yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first client using the button above.
                    </p>
                  </div>
                ) : sortedCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                    <Users className="size-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No matches found</p>
                    <p className="text-sm text-muted-foreground">
                      Try changing search text or clearing the filters.
                    </p>
                    <Button variant="outline" type="button" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-b-xl">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/80 bg-muted/50 hover:bg-muted/50">
                          <TableHead>
                            <button
                              type="button"
                              className="flex items-center gap-1 text-left"
                              onClick={() => toggleSort("name")}
                            >
                              Name
                              {renderSortIcon("name")}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              type="button"
                              className="flex items-center gap-1 text-left"
                              onClick={() => toggleSort("email")}
                            >
                              Email
                              {renderSortIcon("email")}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              type="button"
                              className="flex items-center gap-1 text-left"
                              onClick={() => toggleSort("address")}
                            >
                              Address
                              {renderSortIcon("address")}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              type="button"
                              className="flex items-center gap-1 text-left"
                              onClick={() => toggleSort("dateOfBirth")}
                            >
                              Date of birth
                              {renderSortIcon("dateOfBirth")}
                            </button>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                          <TableHead>
                            <Input
                              value={columnFilters.name}
                              onChange={(e) => setColumnFilter("name", e.target.value)}
                              placeholder="Filter name"
                              className="h-8 bg-background"
                            />
                          </TableHead>
                          <TableHead>
                            <Input
                              value={columnFilters.email}
                              onChange={(e) => setColumnFilter("email", e.target.value)}
                              placeholder="Filter email"
                              className="h-8 bg-background"
                            />
                          </TableHead>
                          <TableHead>
                            <Input
                              value={columnFilters.address}
                              onChange={(e) => setColumnFilter("address", e.target.value)}
                              placeholder="Filter address"
                              className="h-8 bg-background"
                            />
                          </TableHead>
                          <TableHead>
                            <Input
                              value={columnFilters.dateOfBirth}
                              onChange={(e) =>
                                setColumnFilter("dateOfBirth", e.target.value)
                              }
                              placeholder="YYYY-MM-DD"
                              className="h-8 bg-background"
                            />
                          </TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCustomers.map((customer, index) => (
                          <TableRow
                            key={customer.id}
                            className={cn(
                              "animate-enter",
                              index < 8 && `stagger-${Math.min(index + 1, 5)}`
                            )}
                          >
                            <TableCell className="font-medium text-foreground">
                              {customer.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {customer.email}
                            </TableCell>
                            <TableCell className="max-w-50 truncate text-muted-foreground">
                              {customer.address}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDisplayDate(customer.dateOfBirth)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPaymentDialog(customer)}
                                  className="gap-1.5"
                                >
                                  Generate Payment
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(customer)}
                                  className="gap-1.5"
                                >
                                  <Pencil className="size-3.5" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(customer)}
                                  className="gap-1.5"
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex flex-col items-start justify-between gap-3 border-t border-border/70 bg-muted/30 px-4 py-3 text-sm sm:flex-row sm:items-center">
                      <p className="text-muted-foreground">
                        Page {safeCurrentPage} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={safeCurrentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          disabled={safeCurrentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update this customer&apos;s details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <CustomerFields values={updateForm} onChange={setUpdateForm} />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {paymentOpenForId && (() => {
        const paymentCustomer = customers.find(
          (customer) => customer.id === paymentOpenForId
        );
        if (!paymentCustomer) return null;
        return (
          <PaymentGeneratorModal
            customerId={paymentCustomer.id}
            customerName={paymentCustomer.name}
            open={!!paymentOpenForId}
            onOpenChange={(open) =>
              setPaymentOpenForId(open ? paymentOpenForId : null)
            }
          />
        );
      })()}
    </div>
  );
}

type CustomerFieldsProps<T extends CreateCustomerInput | UpdateCustomerPayload> =
  {
    values: T;
    onChange: (values: T) => void;
  };

function CustomerFields<T extends CreateCustomerInput | UpdateCustomerPayload>({
  values,
  onChange,
}: CustomerFieldsProps<T>) {
  function updateField<K extends keyof T>(key: K, value: T[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value as T["name"])}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => updateField("email", e.target.value as T["email"])}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={values.address}
          onChange={(e) =>
            updateField("address", e.target.value as T["address"])
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={values.dateOfBirth}
          onChange={(e) =>
            updateField("dateOfBirth", e.target.value as T["dateOfBirth"])
          }
          required
        />
      </div>
    </>
  );
}
