export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center md:justify-start space-x-6 mb-4 md:mb-0">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">About</span>
            <span className="material-icons">info</span>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Contact</span>
            <span className="material-icons">email</span>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <span className="material-icons">chat</span>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">GitHub</span>
            <span className="material-icons">code</span>
          </a>
        </div>
        <div className="mt-8 md:mt-0">
          <p className="text-center md:text-right text-sm text-gray-400">
            © 2023 AirSense. Developed by Adesh's Team. All rights reserved.
          </p>
          <p className="text-center md:text-right text-xs text-gray-400 mt-1">
            Disclaimer: Data provided is for informational purposes only and may not be 100% accurate.
          </p>
        </div>
      </div>
    </footer>
  );
}
