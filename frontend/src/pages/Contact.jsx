import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaShippingFast,
  FaHeadset,
  FaAward,
  FaLeaf,
  FaPaperPlane
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 87654 32109'],
      subtitle: 'Mon-Sat, 9 AM - 6 PM'
    },
    {
      icon: FaEnvelope,
      title: 'Email Us',
      details: ['hello@bestea.com', 'support@bestea.com'],
      subtitle: 'We reply within 24 hours'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Visit Us',
      details: ['123 Tea Garden Road', 'Coimbatore, Tamil Nadu 641001'],
      subtitle: 'Mon-Fri, 10 AM - 5 PM'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      details: ['+91 98765 43210'],
      subtitle: 'Quick support & orders'
    }
  ];

  const supportOptions = [
    {
      icon: FaShippingFast,
      title: 'Order Support',
      description: 'Track orders, shipping queries, delivery issues',
      action: 'Track Order'
    },
    {
      icon: FaHeadset,
      title: 'Customer Care',
      description: 'General inquiries, product information, assistance',
      action: 'Get Help'
    },
    {
      icon: FaAward,
      title: 'Quality Concerns',
      description: 'Product quality, freshness, replacement requests',
      action: 'Report Issue'
    },
    {
      icon: FaLeaf,
      title: 'Tea Expertise',
      description: 'Brewing tips, tea selection, flavor recommendations',
      action: 'Ask Expert'
    }
  ];

  const faqItems = [
    {
      question: 'What makes BESTEA different from other tea brands?',
      answer: 'We source directly from Assam gardens and blend in Tamil Nadu using traditional methods passed down through three generations. Our commitment to freshness means we pack daily and use no artificial additives.'
    },
    {
      question: 'How fresh is your tea?',
      answer: 'Our tea is packed fresh daily at our Tamil Nadu facility. We maintain strict inventory rotation to ensure you receive tea that\'s been packed within the last 7-14 days.'
    },
    {
      question: 'Do you offer free shipping?',
      answer: 'Yes! We offer free shipping on all orders above ₹499. For orders below ₹499, a nominal shipping charge of ₹50 applies.'
    },
    {
      question: 'Can I return products if I\'m not satisfied?',
      answer: 'Absolutely! We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your purchase, contact us for a full refund or replacement.'
    },
    {
      question: 'How should I store BESTEA products?',
      answer: 'Store in a cool, dry place away from direct sunlight. Keep the packaging tightly sealed to maintain freshness and aroma. Avoid storing near strong-smelling items.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact BESTEA - Customer Support | Get in Touch</title>
        <meta name="description" content="Contact BESTEA for customer support, tea expertise, order assistance. Call +91 98765 43210, email hello@bestea.com, or visit our Coimbatore facility." />
        <meta name="keywords" content="BESTEA contact, customer support, tea help, order assistance, Coimbatore office" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-bestea-200/30 to-bestea-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-green-200/30 to-bestea-200/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-full mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 max-w-7xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-bestea-50 text-bestea-700 px-6 py-3 rounded-full font-semibold mb-8"
              >
                <FaHeadset className="w-5 h-5" />
                <span>24/7 Support • Always Here to Help</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
                Get in <span className="bg-gradient-to-r from-bestea-600 to-bestea-500 bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-7xl mx-auto leading-relaxed mb-12">
                Have questions about our premium teas? Need support with your order? 
                Our passionate team is here to help you discover the perfect tea experience.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              >
                <div className="flex items-center justify-center gap-3 text-slate-600">
                  <div className="w-10 h-10 bg-bestea-100 rounded-full flex items-center justify-center">
                    <FaClock className="w-5 h-5 text-bestea-600" />
                  </div>
                  <span className="font-medium">24hr Response</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-slate-600">
                  <div className="w-10 h-10 bg-bestea-100 rounded-full flex items-center justify-center">
                    <FaHeadset className="w-5 h-5 text-bestea-600" />
                  </div>
                  <span className="font-medium">Expert Guidance</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-slate-600">
                  <div className="w-10 h-10 bg-bestea-100 rounded-full flex items-center justify-center">
                    <FaAward className="w-5 h-5 text-bestea-600" />
                  </div>
                  <span className="font-medium">100% Satisfaction</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-20 px-4 bg-slate-50">
          <div className="max-w-full mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 max-w-7xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                How Can We <span className="text-bestea-600">Help</span> You?
              </h2>
              <p className="text-xl text-slate-600 max-w-6xl mx-auto">
                Choose the best way to connect with our tea experts and support team
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 max-w-7xl mx-auto">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="modern-card hover-scale text-center p-8 group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-bestea-100 to-bestea-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-bestea-500 group-hover:to-bestea-600 transition-all duration-300">
                    <info.icon className="text-bestea-600 text-2xl group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-bestea-600 transition-colors">
                    {info.title}
                  </h3>
                  <div className="space-y-1 mb-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-slate-700 font-medium">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    {info.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {supportOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="modern-card hover-scale p-8 group cursor-pointer"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-bestea-100 to-bestea-200 rounded-2xl flex items-center justify-center mr-4 group-hover:from-bestea-500 group-hover:to-bestea-600 transition-all duration-300">
                      <option.icon className="text-bestea-600 text-xl group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-bestea-600 transition-colors">
                      {option.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {option.description}
                  </p>
                  <button className="inline-flex items-center gap-2 text-bestea-600 font-semibold hover:text-bestea-700 transition-colors">
                    <span>{option.action}</span>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      →
                    </motion.div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-full mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-20">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Send Us a Message
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bestea-400 focus:border-transparent transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bestea-400 focus:border-transparent transition-all"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bestea-400 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inquiry Type
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bestea-400 focus:border-transparent transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="quality">Quality Concern</option>
                        <option value="partnership">Business Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bestea-400 focus:border-transparent transition-all"
                        placeholder="Brief subject of your message"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bestea-400 focus:border-transparent transition-all resize-none"
                        placeholder="Please describe your inquiry in detail..."
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Message...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Send Message <FaPaperPlane className="ml-2" />
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Map & Office Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Map Placeholder */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Visit Our Facility
                  </h3>
                  
                  <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center mb-6">
                    <div className="text-center text-gray-500">
                      <FaMapMarkerAlt className="text-4xl mb-2 mx-auto" />
                      <p>Interactive Map</p>
                      <p className="text-sm">Coimbatore, Tamil Nadu</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">BESTEA Head Office & Facility</h4>
                      <p className="text-gray-600">
                        123 Tea Garden Road<br />
                        Coimbatore, Tamil Nadu 641001<br />
                        India
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Visiting Hours</h4>
                      <p className="text-gray-600">
                        Monday - Friday: 10:00 AM - 5:00 PM<br />
                        Saturday: 10:00 AM - 2:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">What to Expect</h4>
                      <ul className="text-gray-600 space-y-1 text-sm">
                        <li>• Free tea tasting sessions</li>
                        <li>• Facility tours (by appointment)</li>
                        <li>• Meet our tea experts</li>
                        <li>• Bulk order consultations</li>
                      </ul>
                    </div>
                  </div>
                </div>


              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions
              </p>
            </div>
            
            <div className="max-w-7xl mx-auto space-y-6">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for?
              </p>
              <a 
                href="mailto:hello@bestea.com" 
                className="btn btn-primary"
              >
                Ask Our Experts
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
