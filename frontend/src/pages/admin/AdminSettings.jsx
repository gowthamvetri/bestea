import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCog, 
  FaSave, 
  FaEdit,
  FaUpload,
  FaTrash,
  FaPlus,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState({});
  const [showPassword, setShowPassword] = useState({});

  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    },
    shipping: {
      freeShippingThreshold: 0,
      standardShippingCost: 0,
      expressShippingCost: 0,
      shippingZones: []
    },
    payment: {
      enableCOD: false,
      enableOnlinePayment: false,
      enableWalletPayment: false,
      codCharges: 0,
      paymentGateways: [
        { name: 'Razorpay', enabled: false, apiKey: '' },
        { name: 'PayU', enabled: false, apiKey: '' },
        { name: 'Paytm', enabled: false, apiKey: '' }
      ]
    },
    notifications: {
      emailNotifications: false,
      smsNotifications: false,
      orderConfirmation: false,
      shipmentUpdates: false,
      promotionalEmails: false,
      lowStockAlerts: false
    },
    security: {
      adminPassword: '',
      newPassword: '',
      confirmPassword: '',
      sessionTimeout: 60,
      enableTwoFactor: false,
      allowedIPs: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      googleAnalyticsId: '',
      facebookPixelId: ''
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access admin panel');
        return;
      }

      const response = await axios.get(`${API_URL}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Settings load error:', error);
      // Set default settings if API fails
      setSettings({
        general: {
          siteName: 'BESTEA',
          siteDescription: 'Premium Tea Collection',
          adminEmail: 'admin@bestea.com',
          timezone: 'Asia/Kolkata'
        },
        shipping: {
          freeShippingThreshold: 499,
          standardShippingRate: 50,
          expressShippingRate: 100
        },
        payment: {
          razorpayEnabled: true,
          codEnabled: true,
          upiEnabled: true
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          orderUpdates: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30
        },
        seo: {
          metaTitle: 'BESTEA - Premium Tea Collection',
          metaDescription: 'Discover premium quality teas from Assam\'s finest gardens',
          metaKeywords: 'tea, premium tea, assam tea, online tea store'
        }
      });
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: FaCog },
    { id: 'shipping', name: 'Shipping', icon: FaCog },
    { id: 'payment', name: 'Payment', icon: FaCog },
    { id: 'notifications', name: 'Notifications', icon: FaCog },
    { id: 'security', name: 'Security', icon: FaCog },
    { id: 'seo', name: 'SEO', icon: FaCog }
  ];

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async (section) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access admin panel');
        return;
      }

      await axios.put(`${API_URL}/admin/settings`, {
        section,
        data: settings[section]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success(`${section} settings saved successfully!`);
      setIsEditing(prev => ({ ...prev, [section]: false }));
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error(`Failed to save ${section} settings`);
    }
  };

  const toggleEdit = (section) => {
    setIsEditing(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your application settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                <button
                  onClick={() => toggleEdit('general')}
                  className="flex items-center px-4 py-2 text-green-600 hover:text-green-800"
                >
                  <FaEdit className="w-4 h-4 mr-2" />
                  {isEditing.general ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                    disabled={!isEditing.general}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                    disabled={!isEditing.general}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                    disabled={!isEditing.general}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={settings.general.contactPhone}
                    onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                    disabled={!isEditing.general}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                    disabled={!isEditing.general}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={settings.general.address}
                    onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                    disabled={!isEditing.general}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {isEditing.general && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => handleSave('general')}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Payment Settings</h2>
                <button
                  onClick={() => toggleEdit('payment')}
                  className="flex items-center px-4 py-2 text-green-600 hover:text-green-800"
                >
                  <FaEdit className="w-4 h-4 mr-2" />
                  {isEditing.payment ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.payment.enableCOD}
                        onChange={(e) => handleInputChange('payment', 'enableCOD', e.target.checked)}
                        disabled={!isEditing.payment}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Cash on Delivery (COD)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.payment.enableOnlinePayment}
                        onChange={(e) => handleInputChange('payment', 'enableOnlinePayment', e.target.checked)}
                        disabled={!isEditing.payment}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Online Payment</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.payment.enableWalletPayment}
                        onChange={(e) => handleInputChange('payment', 'enableWalletPayment', e.target.checked)}
                        disabled={!isEditing.payment}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Wallet Payment</span>
                    </label>
                  </div>
                </div>

                {/* COD Charges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">COD Charges (₹)</label>
                  <input
                    type="number"
                    value={settings.payment.codCharges}
                    onChange={(e) => handleInputChange('payment', 'codCharges', parseInt(e.target.value))}
                    disabled={!isEditing.payment}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Payment Gateways */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Gateways</h3>
                  <div className="space-y-4">
                    {settings.payment.paymentGateways.map((gateway, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{gateway.name}</h4>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={gateway.enabled}
                              disabled={!isEditing.payment}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Enabled</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                          <input
                            type="text"
                            value={gateway.apiKey}
                            disabled={!isEditing.payment}
                            placeholder="Enter API key"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isEditing.payment && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => handleSave('payment')}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Password Change */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Admin Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          value={settings.security.adminPassword}
                          onChange={(e) => handleInputChange('security', 'adminPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.current ? (
                            <FaEyeSlash className="h-4 w-4 text-gray-400" />
                          ) : (
                            <FaEye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          value={settings.security.newPassword}
                          onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.new ? (
                            <FaEyeSlash className="h-4 w-4 text-gray-400" />
                          ) : (
                            <FaEye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSave('security')}
                    className="mt-4 flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    Update Password
                  </button>
                </div>

                {/* Security Options */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.enableTwoFactor}
                        onChange={(e) => handleInputChange('security', 'enableTwoFactor', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-gray-700">Enable Two-Factor Authentication</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add other tabs (shipping, notifications, seo) with similar structure */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Email Test Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                      📧 Email Configuration Test
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Test your email configuration to ensure order confirmations and notifications are being sent correctly.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Current Configuration:</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• Host: {import.meta.env.VITE_EMAIL_HOST || 'smtp.gmail.com'}</p>
                        <p>• Port: {import.meta.env.VITE_EMAIL_PORT || '587'}</p>
                        <p>• From: {import.meta.env.VITE_EMAIL_USER || 'your-email@gmail.com'}</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const loadingToast = toast.loading('Sending test email...');
                        try {
                          const token = localStorage.getItem('token');
                          const response = await axios.post(
                            `${API_URL}/admin/test-email`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          
                          if (response.data.success) {
                            toast.success(
                              'Test email sent successfully! Check your inbox (and spam folder).',
                              { id: loadingToast, duration: 5000 }
                            );
                          }
                        } catch (error) {
                          toast.error(
                            error.response?.data?.message || 'Failed to send test email. Check your email configuration in .env file.',
                            { id: loadingToast, duration: 6000 }
                          );
                        }
                      }}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <FaUpload className="w-4 h-4 mr-2" />
                      Send Test Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">SMS Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Order Confirmation</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderConfirmation}
                      onChange={(e) => handleInputChange('notifications', 'orderConfirmation', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Low Stock Alerts</span>
                    <input
                      type="checkbox"
                    checked={settings.notifications.lowStockAlerts}
                      onChange={(e) => handleInputChange('notifications', 'lowStockAlerts', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </label>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => handleSave('notifications')}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
