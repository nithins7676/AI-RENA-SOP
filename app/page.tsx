"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaCheckCircle, FaFileAlt, FaRobot, FaShieldAlt, FaChartLine, FaClock,
  FaRegLightbulb, FaRegChartBar, FaRegFileAlt, FaRegClock, FaRegUser,
  FaRegBuilding, FaRegComments, FaRegBell, FaRegBookmark, FaChartPie
} from 'react-icons/fa';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.png"
                alt="PharmaComply AI"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">PharmaComply AI</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-16">
        <div className="relative overflow-hidden">
          {/* Background Illustration */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
            <div className="absolute inset-0 bg-[url('/brain-pattern.svg')] bg-center opacity-5" />
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                AI-Driven Compliance for Pharma Documentation
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
                Effortlessly align pharmaceutical documents with global regulatory guidelines using our intelligent document comparison platform.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
                >
                  Get Started
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200 text-lg"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Statement Section */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-black">The Challenge</h2>
              <p className="mt-4 text-xl text-black">Pharmaceutical compliance is complex and time-consuming</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-black">Regulatory Complexity</h3>
                <p className="text-black">Navigating through multiple regulatory frameworks (FDA, EMA, ICH, etc.) requires extensive expertise and time.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-black">Document Volume</h3>
                <p className="text-black">Managing and reviewing thousands of pages of documentation manually is prone to human error.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-black">Compliance Risks</h3>
                <p className="text-black">Missing critical compliance requirements can lead to regulatory actions, delays, and financial penalties.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Overview */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-black">Our Solution</h2>
              <p className="mt-4 text-xl text-black">AI-powered compliance analysis platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start">
                  <FaRegLightbulb className="text-blue-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">Intelligent Document Analysis</h3>
                    <p className="text-black">Advanced NLP and machine learning algorithms analyze documents for compliance requirements, identifying potential issues and discrepancies.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaRegChartBar className="text-blue-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">Comprehensive Coverage</h3>
                    <p className="text-black">Supports multiple regulatory frameworks including FDA 21 CFR, EU GMP, ICH guidelines, and more.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaRegFileAlt className="text-blue-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">Automated Reporting</h3>
                    <p className="text-black">Generate detailed compliance reports with actionable insights and recommendations.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <FaRegClock className="text-blue-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                    <p className="text-gray-600">Stay current with the latest regulatory changes and requirements through our continuously updated database.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaRegUser className="text-blue-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                    <p className="text-gray-600">Access to regulatory experts and compliance specialists for guidance and consultation.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaRegBuilding className="text-blue-600 w-6 h-6 mt-1 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Enterprise Ready</h3>
                    <p className="text-gray-600">Scalable solution for organizations of all sizes, with enterprise-grade security and compliance features.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Features */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-black">Technical Features</h2>
              <p className="mt-4 text-xl text-black">Advanced technology for superior compliance analysis</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-blue-600 mb-4">
                  <FaRobot className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">AI-Powered Analysis</h3>
                <ul className="space-y-2 text-black">
                  <li>• Natural Language Processing (NLP)</li>
                  <li>• Machine Learning Algorithms</li>
                  <li>• Deep Learning Models</li>
                  <li>• Contextual Understanding</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-blue-600 mb-4">
                  <FaChartPie className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Advanced Analytics</h3>
                <ul className="space-y-2 text-black">
                  <li>• Risk Assessment Scoring</li>
                  <li>• Trend Analysis</li>
                  <li>• Compliance Metrics</li>
                  <li>• Performance Tracking</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-blue-600 mb-4">
                  <FaRegComments className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">Collaboration Tools</h3>
                <ul className="space-y-2 text-black">
                  <li>• Team Workspaces</li>
                  <li>• Comment & Review</li>
                  <li>• Version Control</li>
                  <li>• Audit Trails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-black">Use Cases</h2>
              <p className="mt-4 text-xl text-black">Applications across the pharmaceutical industry</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-black">Regulatory Submissions</h3>
                <p className="text-black mb-4">Ensure compliance of IND, NDA, ANDA, and other regulatory submissions with agency requirements.</p>
                <ul className="space-y-2 text-black">
                  <li>• Clinical Trial Documentation</li>
                  <li>• Manufacturing Process Descriptions</li>
                  <li>• Quality Control Procedures</li>
                  <li>• Safety and Efficacy Data</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-black">Quality Management</h3>
                <p className="text-black mb-4">Maintain and verify compliance of quality management systems and procedures.</p>
                <ul className="space-y-2 text-black">
                  <li>• SOP Review and Updates</li>
                  <li>• Change Control Documentation</li>
                  <li>• CAPA Management</li>
                  <li>• Training Documentation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-black">Benefits</h2>
              <p className="mt-4 text-xl text-black">Why choose our platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 w-6 h-6 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Time Savings</h3>
                  <p className="text-black">Reduce manual review time by up to 80% with automated analysis.</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaChartLine className="text-blue-500 w-6 h-6 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Improved Accuracy</h3>
                  <p className="text-black">AI-powered analysis ensures comprehensive compliance checking.</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaClock className="text-purple-500 w-6 h-6 mt-1 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">Real-time Updates</h3>
                  <p className="text-black">Stay current with the latest regulatory requirements and changes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-24 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-black mb-6">Ready to Transform Your Compliance Process?</h2>
            <p className="text-xl text-blue-100 mb-8">Join leading pharmaceutical companies using our AI-powered compliance platform.</p>
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition-colors duration-200 text-lg"
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="#" className="text-gray-500 hover:text-gray-900">About</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900">Contact</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900">Privacy Policy</Link>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">
                © 2024 PharmaComply AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}