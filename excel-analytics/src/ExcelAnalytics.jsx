import React, { useState } from 'react';
import { LogOut, Upload, BarChart3, Settings, Home, Trash2, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

// Mock user data
const mockUsers = [
  { id: 1, email: 'admin@example.com', role: 'admin', password: 'admin123' },
  { id: 2, email: 'user@example.com', role: 'user', password: 'user123' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function ExcelAnalyticsPlatform() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // Main app state
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [uploadedData, setUploadedData] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [xAxis, setXAxis] = useState(null);
  const [yAxis, setYAxis] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);

  // Handle login
  const handleLogin = () => {
    const user = mockUsers.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setIsLoggedIn(true);
      setUserRole(user.role);
      setCurrentUser(user);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      alert('Invalid credentials');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setUploadedData(null);
    setChartData(null);
  };

  // Parse CSV/Excel data
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          const values = lines[i].split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = isNaN(values[idx]) ? values[idx] : parseFloat(values[idx]);
          });
          data.push(row);
        }

        setUploadedData({ headers, data, fileName: file.name });
        setXAxis(headers[0]);
        setYAxis(headers[1]);
        
        // Add to history
        setUploadHistory([
          ...uploadHistory,
          {
            id: Date.now(),
            fileName: file.name,
            uploadDate: new Date().toLocaleDateString(),
            rowCount: data.length
          }
        ]);

        alert('File uploaded successfully!');
      } catch (error) {
        alert('Error parsing file. Please ensure it is a valid CSV file.');
      }
    };
    reader.readAsText(file);
  };

  // Generate chart
  const generateChart = () => {
    if (!uploadedData || !xAxis || !yAxis) {
      alert('Please select data and axes');
      return;
    }

    const data = uploadedData.data.map(row => ({
      name: row[xAxis],
      value: row[yAxis],
      ...row
    }));

    setChartData({ data, xAxis, yAxis, type: chartType });
  };

  // Download chart as PNG
  const downloadChart = () => {
    alert('Chart download feature: In production, this would use html2canvas or similar library to export the chart as PNG/PDF');
  };

  // Delete upload history
  const deleteHistory = (id) => {
    setUploadHistory(uploadHistory.filter(item => item.id !== id));
  };

  // Render chart
  const renderChart = () => {
    if (!chartData) return null;

    const { data, type } = chartData;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="value" />
              <YAxis type="number" dataKey="value" />
              <Tooltip />
              <Scatter name={chartData.yAxis} data={data} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Excel Analytics</h1>
          <p className="text-gray-600 mb-8">Platform</p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin123"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Login
            </button>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-2 font-semibold">Demo Credentials:</p>
            <p className="text-xs text-gray-600 mb-1"><strong>Admin:</strong> admin@example.com / admin123</p>
            <p className="text-xs text-gray-600"><strong>User:</strong> user@example.com / user123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Excel Analytics Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{currentUser?.email} ({userRole})</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`py-4 px-4 font-medium transition ${
              currentPage === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="inline mr-2" size={18} /> Dashboard
          </button>
          
          <button
            onClick={() => setCurrentPage('upload')}
            className={`py-4 px-4 font-medium transition ${
              currentPage === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="inline mr-2" size={18} /> Upload
          </button>

          <button
            onClick={() => setCurrentPage('analytics')}
            className={`py-4 px-4 font-medium transition ${
              currentPage === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="inline mr-2" size={18} /> Analytics
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setCurrentPage('admin')}
              className={`py-4 px-4 font-medium transition ${
                currentPage === 'admin'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="inline mr-2" size={18} /> Admin
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Uploads</p>
                <p className="text-3xl font-bold text-blue-600">{uploadHistory.length}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Current File</p>
                <p className="text-lg font-semibold text-gray-900">{uploadedData?.fileName || 'None'}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Data Points</p>
                <p className="text-3xl font-bold text-blue-600">{uploadedData?.data.length || 0}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Upload History</h3>
              {uploadHistory.length === 0 ? (
                <p className="text-gray-500">No uploads yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-sm font-semibold">File Name</th>
                        <th className="px-4 py-2 text-sm font-semibold">Upload Date</th>
                        <th className="px-4 py-2 text-sm font-semibold">Rows</th>
                        <th className="px-4 py-2 text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadHistory.map(item => (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">{item.fileName}</td>
                          <td className="px-4 py-3">{item.uploadDate}</td>
                          <td className="px-4 py-3">{item.rowCount}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => deleteHistory(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Page */}
        {currentPage === 'upload' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Upload Excel File</h2>
            
            <div className="bg-white rounded-lg shadow p-8">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center">
                <Upload size={48} className="mx-auto text-blue-400 mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Upload your Excel file</p>
                <p className="text-gray-600 mb-6">Supported formats: CSV, XLSX, XLS</p>
                
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg cursor-pointer transition inline-block">
                    Choose File
                  </span>
                </label>
              </div>

              {uploadedData && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-4">✓ File Loaded: {uploadedData.fileName}</h3>
                  <p className="text-green-800 mb-4">Rows: {uploadedData.data.length}</p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-green-100">
                        <tr>
                          {uploadedData.headers.map(header => (
                            <th key={header} className="px-4 py-2 font-semibold">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedData.data.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="border-t">
                            {uploadedData.headers.map(header => (
                              <td key={header} className="px-4 py-2">{row[header]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {uploadedData.data.length > 5 && (
                    <p className="text-gray-600 text-sm mt-2">Showing 5 of {uploadedData.data.length} rows</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Page */}
        {currentPage === 'analytics' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Charts</h2>
            
            {!uploadedData ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-900">Please upload a file first to generate charts</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                      <select
                        value={xAxis || ''}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select column</option>
                        {uploadedData.headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                      <select
                        value={yAxis || ''}
                        onChange={(e) => setYAxis(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select column</option>
                        {uploadedData.headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="scatter">Scatter Plot</option>
                      </select>
                    </div>

                    <button
                      onClick={generateChart}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Generate Chart
                    </button>

                    {chartData && (
                      <button
                        onClick={downloadChart}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                      >
                        <Download size={18} /> Download Chart
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow p-6">
                    {chartData ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
                        </h3>
                        {renderChart()}
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-500">
                        Configure axes and click "Generate Chart" to visualize your data
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Page */}
        {currentPage === 'admin' && userRole === 'admin' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">User Management</h3>
                <div className="space-y-4">
                  {mockUsers.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        <p className="text-sm text-gray-600">Role: {user.role}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Platform Statistics</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{mockUsers.length}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm text-gray-600">Total Uploads</p>
                    <p className="text-2xl font-bold text-green-600">{uploadHistory.length}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <p className="text-sm text-gray-600">Total Data Points</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {uploadHistory.reduce((sum, item) => sum + item.rowCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Data Usage Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 font-semibold">File Name</th>
                      <th className="px-4 py-2 font-semibold">Uploaded</th>
                      <th className="px-4 py-2 font-semibold">Data Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadHistory.map(item => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{item.fileName}</td>
                        <td className="px-4 py-3">{item.uploadDate}</td>
                        <td className="px-4 py-3">{item.rowCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}




