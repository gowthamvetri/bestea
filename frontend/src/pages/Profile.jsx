import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaLock,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaShieldAlt,
  FaBell
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '../store/slices/authSlice';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarUtils';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  // Initialize profile data from authenticated user
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    avatar: '/images/default-avatar.svg',
    addresses: [],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      promotionalEmails: true,
      orderUpdates: true,
      language: 'en',
      currency: 'INR'
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        avatar: user.avatar || '/images/default-avatar.svg',
        addresses: user.addresses || [],
        preferences: user.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          promotionalEmails: true,
          orderUpdates: true,
          language: 'en',
          currency: 'INR'
        }
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newAddress, setNewAddress] = useState({
    type: 'home',
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e, section = 'profile') => {
    const { name, value, type, checked } = e.target;
    
    if (section === 'profile') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setProfileData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      } else {
        setProfileData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (section === 'password') {
      setPasswordData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (section === 'address') {
      setNewAddress(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePersonalInfo = () => {
    const newErrors = {};
    
    if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profileData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) newErrors.email = 'Invalid email format';
    if (!profileData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+91 \d{10}$/.test(profileData.phone)) newErrors.phone = 'Invalid phone format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validatePersonalInfo()) return;

    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to update profile');
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to change password');
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    const addressWithId = {
      ...newAddress,
      id: Date.now()
    };

    setProfileData(prev => ({
      ...prev,
      addresses: [...prev.addresses, addressWithId]
    }));

    setNewAddress({
      type: 'home',
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });

    toast.success('Address added successfully!');
  };

  const handleDeleteAddress = (addressId) => {
    setProfileData(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== addressId)
    }));
    toast.success('Address deleted successfully!');
  };

  const handleSetDefaultAddress = (addressId) => {
    setProfileData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    }));
    toast.success('Default address updated!');
  };

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: FaUser },
    { id: 'addresses', name: 'Addresses', icon: FaMapMarkerAlt },
    { id: 'security', name: 'Security', icon: FaLock },
    { id: 'preferences', name: 'Preferences', icon: FaBell }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Profile Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={getAvatarUrl({ avatar: profileData.avatar })}
                    alt="Profile"
                    onError={handleAvatarError}
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                  />
                  <button className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors">
                    <FaCamera className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-sm text-gray-600">{profileData.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-orange-100 text-orange-700'
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
            {/* Personal Information */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
                  >
                    {isEditing ? (
                      <>
                        <FaTimes className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <FaEdit className="w-4 h-4 mr-2" />
                        Edit
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <FaSave className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Existing Addresses */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Addresses</h2>
                  
                  <div className="space-y-4">
                    {profileData.addresses.map(address => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium text-gray-900">{address.name}</h3>
                              {address.isDefault && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.address}, {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Address */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Address</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                      <select
                        name="type"
                        value={newAddress.type}
                        onChange={(e) => handleInputChange(e, 'address')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newAddress.name}
                        onChange={(e) => handleInputChange(e, 'address')}
                        placeholder="e.g., Home, Office"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                      <textarea
                        name="address"
                        value={newAddress.address}
                        onChange={(e) => handleInputChange(e, 'address')}
                        rows={2}
                        placeholder="Enter complete address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={(e) => handleInputChange(e, 'address')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        name="state"
                        value={newAddress.state}
                        onChange={(e) => handleInputChange(e, 'address')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={newAddress.pincode}
                        onChange={(e) => handleInputChange(e, 'address')}
                        maxLength="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) => handleInputChange(e, 'address')}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                    </label>

                    <button
                      onClick={handleAddAddress}
                      className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Add Address
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => handleInputChange(e, 'password')}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.current ? (
                          <FaEyeSlash className="h-4 w-4 text-gray-400" />
                        ) : (
                          <FaEye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => handleInputChange(e, 'password')}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.new ? (
                          <FaEyeSlash className="h-4 w-4 text-gray-400" />
                        ) : (
                          <FaEye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handleInputChange(e, 'password')}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.confirm ? (
                          <FaEyeSlash className="h-4 w-4 text-gray-400" />
                        ) : (
                          <FaEye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <FaShieldAlt className="w-4 h-4 mr-2" />
                      )}
                      Change Password
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Email Notifications</span>
                        <input
                          type="checkbox"
                          name="preferences.emailNotifications"
                          checked={profileData.preferences.emailNotifications}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">SMS Notifications</span>
                        <input
                          type="checkbox"
                          name="preferences.smsNotifications"
                          checked={profileData.preferences.smsNotifications}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Promotional Emails</span>
                        <input
                          type="checkbox"
                          name="preferences.promotionalEmails"
                          checked={profileData.preferences.promotionalEmails}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Order Updates</span>
                        <input
                          type="checkbox"
                          name="preferences.orderUpdates"
                          checked={profileData.preferences.orderUpdates}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          name="preferences.language"
                          value={profileData.preferences.language}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="bn">Bengali</option>
                          <option value="ta">Tamil</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          name="preferences.currency"
                          value={profileData.preferences.currency}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => toast.success('Preferences saved successfully!')}
                      className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
