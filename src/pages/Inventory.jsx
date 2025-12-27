import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingSpinner, LoadingSkeleton } from "@/components/ui/loading";
import api from "@/utils/api";
import { AlertTriangle, Search, Plus, Minus } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { INVENTORY_REASONS, INVENTORY_REASON_LABELS } from "@/utils/constants";

export default function Inventory() {
  const { user } = useAuthStore();
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [categories, setCategories] = useState([]);

  // Modal states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    adjustment: "",
    reason: "MANUAL_CORRECTION",
    notes: "",
  });
  const [adjustmentError, setAdjustmentError] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
    fetchCategories();
  }, [showLowStock, search, categoryFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 50, lowStock: showLowStock, search };
      if (categoryFilter) params.category = categoryFilter;

      const response = await api.get("/inventory", { params });
      setInventory(response.data.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get("/inventory/alerts");
      setAlerts(response.data.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories", {
        params: { isActive: true },
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAdjustClick = (product) => {
    setSelectedProduct(product);
    setAdjustmentData({
      adjustment: "",
      reason: "MANUAL_CORRECTION",
      notes: "",
    });
    setAdjustmentError("");
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustmentError("");

    const adjustment = parseFloat(adjustmentData.adjustment);
    if (isNaN(adjustment) || adjustment === 0) {
      setAdjustmentError("Please enter a valid non-zero adjustment amount");
      return;
    }

    const newStock = selectedProduct.stock + adjustment;
    if (newStock < 0) {
      setAdjustmentError(
        `Adjustment would result in negative stock. Current stock: ${selectedProduct.stock}`
      );
      return;
    }

    setAdjusting(true);
    setAdjustmentError("");
    try {
      await api.post("/inventory/adjust", {
        productId: selectedProduct._id,
        adjustment,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes,
      });
      toast.success(
        `Inventory adjusted by ${adjustment > 0 ? "+" : ""}${adjustment} units`
      );
      setShowAdjustModal(false);
      setAdjustmentData({
        adjustment: "",
        reason: "MANUAL_CORRECTION",
        notes: "",
      });
      fetchInventory();
      fetchAlerts();
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      const message =
        error.response?.data?.error || "Failed to adjust inventory";
      setAdjustmentError(message);
      toast.error(message);
    } finally {
      setAdjusting(false);
    }
  };

  const canManage =
    user?.role === "ADMIN" || user?.role === "INVENTORY_MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and adjust stock levels
          </p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{alerts.length} low stock items</span>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <Button
          variant={showLowStock ? "default" : "outline"}
          onClick={() => setShowLowStock(!showLowStock)}
        >
          {showLowStock ? "Show All" : "Show Low Stock Only"}
        </Button>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-[200px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <LoadingSkeleton className="w-24 h-6" />
                  <LoadingSkeleton className="flex-1 h-6" />
                  <LoadingSkeleton className="w-32 h-6" />
                  <LoadingSkeleton className="w-20 h-6" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Low Stock Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 7 : 6}
                      className="text-center text-muted-foreground"
                    >
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => {
                    const isLowStock = item.stock <= item.lowStockThreshold;
                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.category?.name || "N/A"}</TableCell>
                        <TableCell>
                          <span
                            className={
                              isLowStock ? "text-destructive font-medium" : ""
                            }
                          >
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell>{item.lowStockThreshold}</TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <span className="px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjustClick(item)}
                            >
                              Adjust Stock
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Adjust Stock Modal */}
      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent onClose={() => setShowAdjustModal(false)}>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust inventory for {selectedProduct?.name} (SKU:{" "}
              {selectedProduct?.sku})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustSubmit}>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">
                  Current Stock
                </div>
                <div className="text-2xl font-semibold">
                  {selectedProduct?.stock}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment">
                  Adjustment Amount *
                  <span className="text-xs text-muted-foreground ml-2">
                    (Use positive for increase, negative for decrease)
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="adjustment"
                    type="number"
                    step="1"
                    value={adjustmentData.adjustment}
                    onChange={(e) =>
                      setAdjustmentData({
                        ...adjustmentData,
                        adjustment: e.target.value,
                      })
                    }
                    placeholder="e.g., +10 or -5"
                    className={adjustmentError ? "border-destructive" : ""}
                  />
                </div>
                {adjustmentData.adjustment &&
                  !isNaN(parseFloat(adjustmentData.adjustment)) && (
                    <div className="text-sm text-muted-foreground">
                      New stock will be:{" "}
                      {selectedProduct?.stock +
                        parseFloat(adjustmentData.adjustment) || 0}
                    </div>
                  )}
                {adjustmentError && (
                  <p className="text-sm text-destructive">{adjustmentError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select
                  id="reason"
                  value={adjustmentData.reason}
                  onChange={(e) =>
                    setAdjustmentData({
                      ...adjustmentData,
                      reason: e.target.value,
                    })
                  }
                >
                  {Object.entries(INVENTORY_REASON_LABELS).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    )
                  )}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={adjustmentData.notes}
                  onChange={(e) =>
                    setAdjustmentData({
                      ...adjustmentData,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Optional notes about this adjustment..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdjustModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adjusting}>
                {adjusting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adjusting...
                  </>
                ) : (
                  "Adjust Stock"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
