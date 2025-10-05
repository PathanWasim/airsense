import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="text-white py-12" style={{ backgroundColor: '#111827' }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-bold font-montserrat mb-4">
              <span style={{ color: '#36B37E' }}>Air</span>Sense
            </div>
            <p className="mb-6" style={{ color: '#9CA3AF' }}>
              Revolutionizing air quality monitoring with IoT and AI technology for a healthier environment.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" style={{ color: '#9CA3AF', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = '#36B37E'} onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}>Home</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-accent transition-colors">About</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-accent transition-colors">Features</a></li>
              <li><a href="#tech" className="text-gray-400 hover:text-accent transition-colors">Technology</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-accent transition-colors">How It Works</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">API Reference</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Support Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for updates on air quality trends and technology.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 rounded-l-lg focus:outline-none text-dark flex-grow" 
              />
              <button 
                type="submit" 
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-r-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} AirSense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
