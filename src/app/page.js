'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, ChartBarIcon, ShieldCheckIcon, CurrencyDollarIcon, StarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: 'Secure Investments',
      description: 'Bank-grade security protocols and multi-factor authentication to protect your investments',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Real-time Analytics',
      description: 'Track your investments and profits with advanced analytics and reporting tools',
      icon: ChartBarIcon,
    },
    {
      title: 'High Returns',
      description: 'Competitive ROI with weekly profit distributions and transparent fee structure',
      icon: CurrencyDollarIcon,
    },
  ];

  const testimonials = [
    {
      text: "This is 100% legitimate. Although I was unable to continue after withdrawing all my funds (both profit and initial investment), I'm satisfied that I earned 50% returns from my investment plan.",
      rating: 4.5,
      date: "December 3, 2024",
      avatar: "/avatars/user1.jpg",
      name: "Sarah Johnson"
    },
    {
      text: "This is far more profitable than the crypto telegram group I joined a few months ago. The support system is exceptional and very responsive.",
      rating: 5,
      date: "January 15, 2025",
      avatar: "/avatars/user2.jpg",
      name: "Michael Chen"
    },
    {
      text: "I highly recommend Hivestin to both beginners and professionals. I was fortunate to secure two spots for myself and my wife. My only regret is not opting for the VIP plan initially.",
      rating: 5,
      date: "November 28, 2024",
      avatar: "/avatars/user3.jpg",
      name: "David Williams"
    },
    {
      text: "After being on the waitlist for over 2 weeks, I finally got in. This is my first month, and I must say this platform is a game changer!",
      rating: 4.8,
      date: "February 12, 2025"
    }
  ];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      zIndex: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      zIndex: 0
    })
  };

  const TestimonialsCarousel = ({ testimonials }) => {
    const [[page, direction], setPage] = useState([0, 0]);
    const [positions, setPositions] = useState([-1, 0, 1]); // left, center, right
    
    const paginate = (newDirection) => {
      setPage([page + newDirection, newDirection]);
    };

    const handlers = useSwipeable({
      onSwipedLeft: () => paginate(1),
      onSwipedRight: () => paginate(-1),
      preventDefaultTouchmoveEvent: true,
      trackMouse: true
    });

    const currentIndex = Math.abs(page % testimonials.length);
    
    return (
      <div className="relative h-[400px] w-full overflow-hidden" {...handlers}>
        <div className="absolute w-full h-full flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="absolute w-full max-w-lg"
            >
              <div className="bg-gray-700 rounded-lg p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <UserCircleIcon className="w-12 h-12 text-gray-400 mr-4" />
                  <div>
                    <h3 className="text-white font-medium">
                      {testimonials[currentIndex].name}
                    </h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(testimonials[currentIndex].rating) ? (
                            <SolidStarIcon className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <StarIcon className="h-5 w-5 text-yellow-400" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 mb-2">{testimonials[currentIndex].text}</p>
                <p className="text-gray-400 text-sm">{testimonials[currentIndex].date}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation buttons */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full"
          onClick={() => paginate(-1)}
        >
          ←
        </button>
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full"
          onClick={() => paginate(1)}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-blue-500">Hivestin</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Get Started
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Open menu</span>
                {isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Invest in your future</span>
                  <span className="block text-blue-500">with cryptocurrency</span>
                </h1>
                <p className="mt-3 text-base text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Start your investment journey today with our secure and profitable cryptocurrency investment platform. Earn weekly returns with professional portfolio management.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                      Start Investing
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-gray-800 hover:bg-gray-700 md:py-4 md:text-lg md:px-10">
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Why Choose Us
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Industry-leading security, transparency, and returns
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-gray-900 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-white tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            What Our Investors Say
          </h2>
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start investing?</span>
            <span className="block text-blue-500">Create your account today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Get started
                <ArrowRightIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <p className="text-base text-gray-400">
                Contact: support@hivestin.com
              </p>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2024 Hivestin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
