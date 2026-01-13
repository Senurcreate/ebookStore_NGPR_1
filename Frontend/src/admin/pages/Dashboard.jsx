import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { fetchDashboardStats, fetchSalesAnalytics } from '../../services/adminService'; 

const Dashboard = () => {
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(true);
  
  // State for dynamic data
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState([]);

  
  const formatCurrency = (amount) => {
    return `Rs ${new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(amount || 0)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardRes, salesRes] = await Promise.all([
            fetchDashboardStats(),
            fetchSalesAnalytics('year')
        ]);

        const dbStats = dashboardRes.stats;
        const salesStats = salesRes.analytics;

        const newStats = [
            { 
                title: "Total Revenue", 
                value: formatCurrency(dbStats.financial.totalRevenue), 
                trend: "+ 20.1%", 
                icon: "bi-currency-dollar", color: "#fff", bg: "#00d25b" 
            },
            { 
                title: "Total Sales", 
                value: dbStats.overview.totalPurchases.toLocaleString(), 
                trend: "+ 15.3%", 
                icon: "bi-cart3", color: "#fff", bg: "#2d7ff9" 
            },
            { 
                title: "Total Downloads", 
                value: dbStats.overview.totalDownloads.toLocaleString(), 
                trend: "+ 32.5%", 
                icon: "bi-download", color: "#fff", bg: "#a855f7" 
            },
            { 
                title: "Active Users", 
                value: dbStats.recentActivity.activeUsers.length.toLocaleString(), 
                trend: "+ 12.3%", 
                icon: "bi-people", color: "#fff", bg: "#ff6d00" 
            },
            { 
                title: "eBook Revenue", 
                value: formatCurrency(salesStats.revenueByType.find(t => t._id === 'ebook')?.revenue), 
                trend: "+ 8.2%", 
                icon: "bi-book", color: "#fff", bg: "#6366f1" 
            },
            { 
                title: "Audio Revenue", 
                value: formatCurrency(salesStats.revenueByType.find(t => t._id === 'audiobook')?.revenue), 
                trend: "+ 23.7%", 
                icon: "bi-headphones", color: "#fff", bg: "#f43f5e" 
            },
        ];
        setStats(newStats);

        const chartData = salesStats.salesOverTime.map(item => ({
            name: new Date(item._id).toLocaleDateString('en-US', { month: 'short' }),
            revenue: item.revenue
        })).slice(-6);
        setRevenueData(chartData);

        const pieColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
        const pieData = salesStats.revenueByType.map((item, index) => ({
            name: item._id === 'ebook' ? 'eBooks' : 'Audiobooks',
            value: item.count,
            color: pieColors[index % pieColors.length]
        }));
        setCategoryData(pieData.length > 0 ? pieData : [{name: 'No Data', value: 100, color: '#e5e7eb'}]);

        const processedOrders = dbStats.recentActivity.purchases.map(order => ({
            id: `#ORD-${order._id.slice(-6).toUpperCase()}`,
            name: order.user ? (order.user.displayName || order.user.email) : 'Unknown User',
            items: 1,
            total: formatCurrency(order.amount),
            status: order.status,
            date: formatDate(order.purchasedAt),
            bg: order.status === 'completed' ? '#00d25b' : (order.status === 'cancelled' ? '#dc3545' : '#6c757d'),
            icon: order.status === 'completed' ? 'bi-check-circle' : (order.status === 'cancelled' ? 'bi-x-circle' : 'bi-clock')
        }));
        setRecentOrders(processedOrders);

        setLoading(false);
      } catch (error) {
        console.error("Dashboard data load failed:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', backgroundColor: '#f8f9fa'}}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-start" style={{ color: '#333' }}>Dashboard</h2>
        <p className="text-muted">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        {stats.map((stat, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between">
                <div className="flex-grow-1">
                  <p className="text-muted small mb-3 fw-medium">{stat.title}</p>
                  <h3 className="fw-bold mb-2" style={{ fontSize: '1.75rem' }}>{stat.value}</h3>
                  <div className="d-flex align-items-center text-success fw-bold small">
                    <i className="bi bi-arrow-up-short fs-5"></i>
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div className="rounded-4 d-flex align-items-center justify-content-center" 
                      style={{ backgroundColor: stat.bg, width: '54px', height: '54px', color: stat.color, minWidth: '54px' }}>
                  <i className={`bi ${stat.icon} fs-3`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-5">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-4">Revenue Overview</h5>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#adb5bd', fontSize: 13}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#adb5bd', fontSize: 13}} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-4">Sales by Type</h5>
            <div style={{ width: '100%', height: 320 }} className="d-flex flex-column align-items-center">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
                {categoryData.map((cat, i) => (
                  <div key={i} className="d-flex align-items-center">
                    <div style={{ width: '10px', height: '10px', backgroundColor: cat.color, borderRadius: '50%', marginRight: '6px' }}></div>
                    <span style={{ fontSize: '13px', color: '#666' }}>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
        <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Recent Purchases</h5>
            <button 
                className="btn btn-light rounded-pill px-4 fw-medium text-muted border shadow-sm" 
                style={{ fontSize: '14px' }}
                onClick={() => navigate('/admin/purchases')} 
            >
                View All
            </button>
        </div>
        <div className="table-responsive">
            <table className="table align-middle mb-0 custom-admin-table">
            <thead>
                <tr>
                <th className="ps-4">ORDER ID</th>
                <th>CUSTOMER</th>
                <th className="text-center">ITEMS</th>
                <th>TOTAL</th>
                <th className="text-center">STATUS</th>
                <th className="pe-4 text-end">DATE</th>
                </tr>
            </thead>
            <tbody>
                {recentOrders.length > 0 ? (
                    recentOrders.map((order, i) => (
                    <tr key={i}>
                        <td className="ps-4 text-muted">{order.id}</td>
                        <td className="fw-bold text-dark">{order.name}</td>
                        <td className="text-center">{order.items}</td>
                        <td className="fw-bold text-dark">{order.total}</td>
                        <td>
                        <div className="d-flex justify-content-center align-items-center">
                            <span className="status-badge" style={{ backgroundColor: order.bg, color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '12px' }}>
                            <i className={`bi ${order.icon} me-1`}></i>
                            {order.status}
                            </span>
                        </div>
                        </td>
                        <td className="pe-4 text-muted text-end">{order.date}</td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">No recent orders found</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;