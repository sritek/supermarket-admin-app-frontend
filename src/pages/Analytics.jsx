import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes, categoryRes] = await Promise.all([
        api.get('/analytics/sales', { params: { groupBy: 'day', startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } }),
        api.get('/analytics/top-products', { params: { limit: 10 } }),
        api.get('/analytics/category-sales'),
      ]);
      setSalesData(salesRes.data.data.map(item => ({
        date: `${item._id.month}/${item._id.day}`,
        revenue: item.totalRevenue,
        orders: item.orderCount,
      })));
      setTopProducts(productsRes.data.data);
      setCategorySales(categoryRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1">Sales and performance insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
              <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.product?.name || 'Unknown Product'}
                    </TableCell>
                    <TableCell>{item.totalQuantity}</TableCell>
                    <TableCell>${item.totalRevenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalRevenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

