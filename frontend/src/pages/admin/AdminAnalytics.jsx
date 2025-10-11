import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaDownload,
  FaFilter
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data from API
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Default data structure in case API fails
  const salesData = analyticsData?.salesData || [];
  const categoryData = analyticsData?.categoryData || [];
  const recentOrdersData = analyticsData?.recentOrdersData || [];
  const topProducts = analyticsData?.topProducts || [];
  const stats = analyticsData?.stats || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <FaDownload className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(stats) && stats.length > 0 ? (
          stats.map((stat, index) => {
            const Icon = stat.icon || FaChartLine;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor || 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${stat.color || 'text-gray-600'}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      {stat.change && (
                        <span className={`ml-2 text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.changeType === 'increase' ? (
                            <FaArrowUp className="inline w-3 h-3 mr-1" />
                          ) : (
                            <FaArrowDown className="inline w-3 h-3 mr-1" />
                          )}
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-4 bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
            <FaChartLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Analytics Data Available</p>
            <p className="text-sm">Start making sales to see your analytics dashboard</p>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
            <button className="text-sm text-gray-600 hover:text-gray-800">
              <FaFilter className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#f59e0b"
                fill="#fef3c7"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={recentOrdersData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
            <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" name="Revenue (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {Array.isArray(topProducts) && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{(product.revenue || 0).toLocaleString()}</p>
                    {product.trendPercentage && (
                      <div className={`flex items-center text-sm ${
                        product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.trend === 'up' ? (
                          <FaArrowUp className="w-3 h-3 mr-1" />
                        ) : (
                          <FaArrowDown className="w-3 h-3 mr-1" />
                        )}
                        {product.trend === 'up' ? '+' : '-'}
                        {product.trendPercentage}%
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No products data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h2>
          <div className="space-y-4">
            {analyticsData?.customerInsights ? (
              <>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Customer Retention</h3>
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.customerInsights.retention}%</p>
                  <p className="text-sm text-blue-700">{analyticsData.customerInsights.retentionChange} from last month</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">Average Order Frequency</h3>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.customerInsights.orderFrequency}x</p>
                  <p className="text-sm text-green-700">Orders per customer/month</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900">Customer Lifetime Value</h3>
                  <p className="text-2xl font-bold text-purple-600">₹{analyticsData.customerInsights.lifetimeValue.toLocaleString()}</p>
                  <p className="text-sm text-purple-700">{analyticsData.customerInsights.lifetimeValueChange} from last quarter</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No customer insights data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals and Targets */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyticsData?.goals ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Revenue Target</span>
                  <span className="text-sm text-gray-600">{analyticsData.goals.revenue.percentage}% achieved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.goals.revenue.percentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">₹{analyticsData.goals.revenue.current.toLocaleString()} / ₹{analyticsData.goals.revenue.target.toLocaleString()}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Orders Target</span>
                  <span className="text-sm text-gray-600">{analyticsData.goals.orders.percentage}% achieved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analyticsData.goals.orders.percentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{analyticsData.goals.orders.current} / {analyticsData.goals.orders.target} orders</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">New Customers</span>
                  <span className="text-sm text-gray-600">{analyticsData.goals.customers.percentage}% achieved</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${analyticsData.goals.customers.percentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{analyticsData.goals.customers.current} / {analyticsData.goals.customers.target} customers</p>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              <p>No goals data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
