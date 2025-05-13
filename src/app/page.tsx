import Link from 'next/link';
import { ArrowRight, Mail, Paperclip, Zap } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <header className="container mx-auto py-6 px-4">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="text-2xl font-bold text-purple-900">Autoscheduler</span>
          </div>
          
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-12 pb-20">
        <div className="relative">
          

          {/* Content */}
          <div className="text-center max-w-4xl mx-auto relative">
            <div className="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              <span className="flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                New Release
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-purple-900">Schedule and Send Bulk Emails</span>{' '}
              <span className="text-purple-600">With Ease</span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-6">
              Powerful & Privacy-Focused
            </h2>
            
            <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
              Efficiently send emails to multiple recipients via BCC with file attachments. 
              Reach up to 50 recipients at once without compromising on deliverability or privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link 
                href="/auth/login" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium text-lg flex items-center justify-center transition-colors"
              >
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-md font-medium text-lg flex items-center justify-center transition-colors"
              >
                Register
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">BCC Privacy Protection</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="flex items-center justify-center mb-2">
                <Paperclip className="h-6 w-6 text-purple-600 mr-1" />
                <span className="text-3xl font-bold text-purple-600">20MB</span>
              </div>
              <div className="text-gray-600">Attachment Capacity</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Recipients Per Send</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;