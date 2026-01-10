import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import axiosInstance from '../../utils/axiosInstance';
import '../../styles/main.scss';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
        try {
            const res = await axiosInstance.get('/admin/dashboard');
            if(res.data.success) {
                setData(res.data.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-5 text-center text-muted">Loading Analytics...</div>;
  if (!data) return null;

  const orderData = data.userGrowth?.map(item => ({ name: item._id, orders: item.count })) || [];
  const revenueData = orderData.map(item => ({ name: item.name, revenue: item.orders * 15 })); 

  // --- 🛠️ MAP IMAGES HERE ---
  const topBooks = data.recentActivity?.purchases?.slice(0, 5).map((p, i) => {
      const book = p.book || {};
      return {
        rank: `#${i+1}`,
        title: book.title || "Unknown Title",
        author: book.author || "Unknown Author",
        revenue: `$${p.amount}`,
        sales: '1 sales',
        
        // ⬇️ Use the real image, fallback to placeholder
        img: book.coverImage || "https://placehold.co/45x65?text=No+Img",
        
        type: book.type === 'audiobook' ? 'Audio' : 'eBook',
        icon: book.type === 'audiobook' ? 'bi-headphones' : 'bi-book',
        bg: book.type === 'audiobook' ? '#8b5cf6' : '#6366f1'
      };
  }) || [];

  return (
    <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1 text-start">Analytics</h2>
        <p className="text-muted">Detailed insights into your store performance</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-4">User Growth</h5>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#adb5bd'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#adb5bd'}} />
                  <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                  <Bar dataKey="orders" name="New Users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-4">Estimated Revenue</h5>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#adb5bd'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#adb5bd'}} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Books List */}
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
        <h5 className="fw-bold mb-4">Recent Top Sales</h5>
        <div className="d-flex flex-column gap-4">
          {topBooks.length > 0 ? topBooks.map((book, index) => (
            <div key={index} className="d-flex align-items-center justify-content-between pb-3 border-bottom last-child-border-0">
              <div className="d-flex align-items-center flex-grow-1">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-4" 
                     style={{ width: '40px', height: '40px', minWidth: '40px', color: '#3b82f6', fontWeight: 'bold' }}>
                  {book.rank}
                </div>
                {/* ⬇️ IMAGES SHOWN HERE */}
                <img src={book.img} alt={book.title} className="rounded shadow-sm me-3" style={{ width: '45px', height: '65px', objectFit: 'cover' }} />
                <div className="me-3">
                  <h6 className="fw-bold mb-0">{book.title}</h6>
                  <small className="text-muted">{book.author}</small>
                </div>
              </div>
              <div className="d-none d-md-flex align-items-center px-4">
                <span className="badge rounded-pill fw-normal d-flex align-items-center gap-2 px-3 py-2"
                  style={{ backgroundColor: book.bg, fontSize: '0.8rem', minWidth: '110px', justifyContent: 'center', color: '#fff' }}>
                  <i className={`bi ${book.icon}`}></i> {book.type}
                </span>
              </div>
              <div className="text-end" style={{ minWidth: '100px' }}>
                <div className="fw-bold text-dark">{book.revenue}</div>
                <small className="text-muted">{book.sales}</small>
              </div>
            </div>
          )) : (
              <p className="text-muted text-center">No recent sales data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;