import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLeaf, FaTruck, FaAward, FaClock, FaShieldAlt, FaQuoteLeft, FaStar, FaUserTie, FaCogs, FaMapMarkerAlt, FaCertificate, FaUsers, FaHeart, FaArrowRight } from 'react-icons/fa';

const About = () => {
  const team = [
    {
      name: 'Rajesh Sharma',
      role: 'Founder & Master Blender',
      description: 'Third-generation tea expert with 40+ years of experience in Assam tea cultivation and blending.',
      icon: FaUserTie
    },
    {
      name: 'Priya Sharma',
      role: 'Quality Control Head',
      description: 'Ensures every batch meets our strict quality standards with her expertise in tea tasting and quality assurance.',
      icon: FaAward
    },
    {
      name: 'Arun Kumar',
      role: 'Operations Manager',
      description: 'Oversees our Tamil Nadu facility and ensures seamless operations from garden to cup.',
      icon: FaCogs
    }
  ];

  const milestones = [
    {
      year: '1985',
      title: 'The Beginning',
      description: 'Started as a small family business with a passion for authentic Assam tea',
      icon: FaLeaf
    },
    {
      year: '1995',
      title: 'Tamil Nadu Expansion',
      description: 'Established our blending facility in Tamil Nadu, combining tradition with innovation',
      icon: FaMapMarkerAlt
    },
    {
      year: '2005',
      title: 'Quality Certification',
      description: 'Received ISO certification and established quality control standards',
      icon: FaCertificate
    },
    {
      year: '2015',
      title: 'Digital Growth',
      description: 'Launched online platform, reaching tea lovers across India',
      icon: FaUsers
    },
    {
      year: '2024',
      title: 'BESTEA Today',
      description: 'Serving 50,000+ customers with premium tea experiences daily',
      icon: FaAward
    }
  ];

  const values = [
    {
      icon: FaLeaf,
      title: 'Authenticity',
      description: 'We source directly from Assam gardens, ensuring every leaf meets our quality standards. No compromises on authenticity.'
    },
    {
      icon: FaHeart,
      title: 'Family Heritage',
      description: 'Three generations of tea expertise guide every blend we create. Our recipes are treasured family secrets.'
    },
    {
      icon: FaShieldAlt,
      title: 'Quality Promise',
      description: 'Every batch undergoes rigorous testing for flavor, aroma, and purity. Your satisfaction is our guarantee.'
    },
    {
      icon: FaClock,
      title: 'Fresh Tradition',
      description: 'Traditional methods meet modern freshness. We pack daily to preserve the authentic tea experience.'
    }
  ];

  const testimonials = [
    {
      name: 'Meera Patel',
      role: 'Tea Connoisseur',
      comment: 'BESTEA has been our family\'s choice for over 15 years. The consistency in quality and flavor is remarkable.',
      rating: 5
    },
    {
      name: 'Dr. Suresh Reddy',
      role: 'Regular Customer',
      comment: 'As someone who has tried teas from across India, BESTEA\'s Strong Assam blend is unmatched in its authenticity.',
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>About BESTEA | Premium Assam Tea Heritage</title>
        <meta name="description" content="Discover BESTEA's story - three generations of tea expertise from Assam, India. Learn about our commitment to quality, authenticity, and bringing you the finest tea experience." />
        <meta name="keywords" content="BESTEA story, Assam tea heritage, tea company history, premium tea makers, authentic Indian tea, family tea business" />
        <link rel="canonical" href="/about" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-24 px-8 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-bestea-200/30 to-bestea-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-green-200/30 to-bestea-200/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative w-full mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-bestea-50 text-bestea-700 px-6 py-3 rounded-full font-semibold mb-8"
              >
                <FaLeaf className="w-5 h-5" />
                <span>Est. 1985 • Three Generations of Excellence</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight">
                Our <span className="bg-gradient-to-r from-bestea-600 to-bestea-500 bg-clip-text text-transparent">Tea</span> Journey
              </h1>
              <p className="text-xl text-slate-600 max-w-full mx-auto leading-relaxed">
                From the misty hills of Assam to your cherished moments - discover our legacy 
                of crafting exceptional tea experiences with passion, tradition, and innovation.
              </p>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-full mx-auto mb-12"
            >
              {[
                { number: '40+', label: 'Years of Heritage' },
                { number: '50K+', label: 'Happy Customers' },
                { number: '100%', label: 'Natural & Pure' },
                { number: '24/7', label: 'Fresh Blending' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-bestea-600 mb-2">{stat.number}</div>
                  <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/shop" className="modern-btn-primary">
                <span>Explore Our Teas</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <a href="#story" className="modern-btn-secondary">
                <span>Our Story</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section id="story" className="py-20 px-4 bg-slate-50">
          <div className="w-full mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Our <span className="text-bestea-600">Story</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-full mx-auto">
                A journey that began in the tea gardens of Assam and continues in the hearts of Tamil Nadu
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="modern-card p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">From Assam Gardens to Your Cup</h3>
                  <div className="space-y-6">
                    <p className="text-slate-600 leading-relaxed">
                      Founded in 1985 by tea enthusiast Rajesh Sharma, BESTEA began as a small family venture 
                      in the lush tea gardens of Assam. With a deep understanding of tea cultivation and 
                      an unwavering commitment to quality, we set out to share authentic Assam tea with the world.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Our expansion to Tamil Nadu in 1995 marked a new chapter, where we established our 
                      state-of-the-art blending facility. This strategic move allowed us to combine the 
                      authentic flavors of Assam with innovative blending techniques, creating unique 
                      tea experiences that honor tradition while embracing modernity.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Today, three generations later, BESTEA continues to be a family-owned business 
                      dedicated to bringing you the finest tea experiences. Every cup tells our story 
                      of passion, quality, and the timeless joy of sharing exceptional tea.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-bestea-100 rounded-xl flex items-center justify-center">
                      <milestone.icon className="w-6 h-6 text-bestea-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-bestea-600 bg-bestea-50 px-3 py-1 rounded-full">
                          {milestone.year}
                        </span>
                        <h4 className="text-lg font-semibold text-slate-900">{milestone.title}</h4>
                      </div>
                      <p className="text-slate-600">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Our <span className="text-bestea-600">Values</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                The principles that guide everything we do, from sourcing to serving
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="modern-card hover-scale text-center p-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-bestea-100 to-bestea-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-bestea-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Meet Our <span className="text-bestea-600">Team</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                The passionate individuals who bring you exceptional tea experiences every day
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="modern-card hover-scale text-center p-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-bestea-100 to-bestea-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <member.icon className="w-10 h-10 text-bestea-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-bestea-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-slate-600 leading-relaxed">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                What Our <span className="text-bestea-600">Customers</span> Say
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Hear from tea lovers who have made BESTEA part of their daily ritual
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="modern-card p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <FaQuoteLeft className="w-8 h-8 text-bestea-200" />
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="w-5 h-5 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                    "{testimonial.comment}"
                  </p>
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-slate-600">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-8 bg-gradient-to-r from-bestea-500 to-bestea-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Experience BESTEA?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of tea lovers who have made BESTEA their daily choice. 
                Discover the authentic taste of Assam in every cup.
              </p>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-3 bg-white text-bestea-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <span>Shop Now</span>
                <FaArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
