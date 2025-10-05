import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { gsap } from "gsap";

interface User {
  username: string;
  password: string;
  role: "user" | "admin";
  name: string;
}

// Hardcoded credentials for demo
const USERS: User[] = [
  { username: "user", password: "password", role: "user", name: "John Doe" },
  { username: "admin", password: "admin123", role: "admin", name: "Admin User" }
];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: Omit<User, "password">) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "info">("login");

  // Handle animation when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      gsap.set(".login-modal", { scale: 0.8, opacity: 0 });
      gsap.to(".login-modal", {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => setIsAnimating(false)
      });

      // Animate form elements
      gsap.fromTo(
        ".form-element",
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.5, 
          stagger: 0.1,
          delay: 0.2,
          ease: "power2.out" 
        }
      );
    } else {
      // No need to animate when it's already closed
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    gsap.to(".login-modal", {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        onClose();
        setIsAnimating(false);
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Find user with matching credentials
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Clone user without password
      const { password, ...userWithoutPassword } = user;
      
      // Animate success
      gsap.to(".login-form", {
        y: -10,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          onLogin(userWithoutPassword);
          handleClose();
        }
      });
    } else {
      // Shake animation for error
      setError("Invalid username or password");
      
      // Use a more TypeScript-friendly approach for the shake animation
      const timeline = gsap.timeline();
      timeline.to(".login-form", { x: -10, duration: 0.1 })
              .to(".login-form", { x: 10, duration: 0.1 })
              .to(".login-form", { x: -10, duration: 0.1 })
              .to(".login-form", { x: 10, duration: 0.1 })
              .to(".login-form", { x: 0, duration: 0.1 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="login-modal relative bg-gradient-to-br from-white to-gray-100 w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-32 -z-0 overflow-hidden" style={{ background: 'linear-gradient(to right, #3B82F6, rgba(59, 130, 246, 0.8), rgba(54, 179, 126, 0.5))' }}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-20"></div>
        </div>
        
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-10 rounded-full p-1 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Modal Content */}
        <div className="relative z-10 p-6 pt-28 pb-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome to <span style={{ color: '#3B82F6' }}>Air</span>Sense</h2>
            
            {/* Tabs */}
            <div className="flex justify-center gap-4 mt-4 mb-6">
              <button 
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{ 
                  color: activeTab === 'login' ? '#3B82F6' : '#6B7280',
                }}
                onClick={() => setActiveTab('login')}
              >
                Login
                {activeTab === 'login' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: '#3B82F6' }}></span>
                )}
              </button>
              
              <button 
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{ 
                  color: activeTab === 'info' ? '#3B82F6' : '#6B7280',
                }}
                onClick={() => setActiveTab('info')}
              >
                Demo Info
                {activeTab === 'info' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: '#3B82F6' }}></span>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="login-form space-y-4">
              <div className="form-element">
                <label htmlFor="username" className=" block text-sm font-medium text-gray-700 mb-1">Username</label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-white text-black w-full px-4 py-2 border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div className="form-element">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white text-black w-full px-4 py-2 border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm py-2 form-element">{error}</div>
              )}
              
              <div className="flex justify-end pt-2 form-element">
                <Button 
                  type="submit" 
                  className="text-white px-8 py-2 rounded-lg transition-all transform hover:scale-105"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  Login
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="form-element bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium text-gray-600">Regular User:</div>
                    <div>
                      <div><span className="font-medium">Username:</span> user</div>
                      <div><span className="font-medium">Password:</span> password</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium text-gray-600">Admin User:</div>
                    <div>
                      <div><span className="font-medium">Username:</span> admin</div>
                      <div><span className="font-medium">Password:</span> admin123</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-element">
                <p className="text-sm text-gray-600">
                  This is a demo login system with hardcoded credentials for demonstration purposes. 
                  In a real application, authentication would be handled securely through the server.
                </p>
              </div>
              
              <div className="flex justify-end pt-2 form-element">
                <Button 
                  onClick={() => setActiveTab('login')} 
                  className="text-white px-6 py-2 rounded-lg transition-all"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;