import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/utils/api';
import { AlertTriangle, Search } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function Inventory() {
  const { user } = useAuthStore();
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, [showLowStock, search]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory', {
        params: { page: 1, limit: 50, lowStock: showLowStock, search },
      });
      setInventory(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/inventory/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and adjust stock levels</p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{alerts.length} low stock items</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          variant={showLowStock ? 'default' : 'outline'}
          onClick={() => setShowLowStock(!showLowStock)}
        >
          {showLowStock ? 'Show All' : 'Show Low Stock Only'}
        </Button>
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
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
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
                    <TableCell colSpan={canManage ? 7 : 6} className="text-center text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => {
                    const isLowStock = item.stock <= item.lowStockThreshold;
                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={isLowStock ? 'text-destructive font-medium' : ''}>
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
                            <Button variant="outline" size="sm">
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
    </div>
  );
}

