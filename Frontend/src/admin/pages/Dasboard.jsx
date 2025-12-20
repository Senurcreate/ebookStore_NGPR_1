import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
  const revenueData = [
    { name: 'Jan', revenue: 12500 },
    { name: 'Feb', revenue: 16000 },
    { name: 'Mar', revenue: 19000 },
    { name: 'Apr', revenue: 21500 },
    { name: 'May', revenue: 25000 },
    { name: 'Jun', revenue: 30000 },
  ];

  const categoryData = [
    { name: 'Fiction', value: 400, color: '#3b82f6' },
    { name: 'Non-Fiction', value: 300, color: '#10b981' },
    { name: 'Science', value: 300, color: '#8b5cf6' },
    { name: 'Self-Help', value: 200, color: '#f59e0b' },
    { name: 'Mystery', value: 200, color: '#ef4444' },
  ];

  // Updated stats to match the provided image exactly
  const stats = [
    { title: "Total Revenue", value: "$45,231", trend: "+ 20.1%", icon: "bi-currency-dollar", color: "#fff", bg: "#00d25b" },
    { title: "Premium Sales", value: "2,845", trend: "+ 15.3%", icon: "bi-cart3", color: "#fff", bg: "#2d7ff9" },
    { title: "Free Downloads", value: "12,432", trend: "+ 32.5%", icon: "bi-download", color: "#fff", bg: "#a855f7" },
    { title: "Active Users", value: "8,492", trend: "+ 12.3%", icon: "bi-people", color: "#fff", bg: "#ff6d00" },
    { title: "eBook Sales", value: "1,658", trend: "+ 8.2%", icon: "bi-book", color: "#fff", bg: "#6366f1" },
    { title: "Audiobook Sales", value: "1,187", trend: "+ 23.7%", icon: "bi-headphones", color: "#fff", bg: "#f43f5e" },
  ];

  const orders = [
    { id: "#ORD-2024-1234", name: "Sarah Johnson", items: 3, total: "$47.97", status: "completed", date: "2024-12-10", bg: "#000", icon: "bi-check-circle" },
    { id: "#ORD-2024-1233", name: "Michael Chen", items: 1, total: "$16.99", status: "processing", date: "2024-12-10", bg: "#6c757d", icon: "bi-clock" },
    { id: "#ORD-2024-1232", name: "Emma Davis", items: 2, total: "$32.98", status: "completed", date: "2024-12-09", bg: "#000", icon: "bi-check-circle" },
    { id: "#ORD-2024-1231", name: "James Wilson", items: 5, total: "$79.95", status: "pending", date: "2024-12-09", bg: "#6c757d", icon: "bi-record-circle" },
    { id: "#ORD-2024-1230", name: "Olivia Brown", items: 1, total: "$14.99", status: "cancelled", date: "2024-12-08", bg: "#dc3545", icon: "bi-x-circle" }
  ];

  return (
    <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold" style={{ color: '#333' }}>Dashboard Overview</h2>
        <p className="text-muted">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards - Updated Layout */}
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
            <h5 className="fw-bold mb-4">Sales by Category</h5>
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
            <h5 className="fw-bold mb-0">Recent Orders</h5>
            <button className="btn btn-light rounded-pill px-4 fw-medium text-muted border shadow-sm" style={{ fontSize: '14px' }}>View All</button>
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
                {orders.map((order, i) => (
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
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;