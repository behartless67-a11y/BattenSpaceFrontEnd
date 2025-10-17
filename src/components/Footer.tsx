export function Footer() {
  return (
    <footer className="bg-uva-navy text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Frank Batten School of Leadership and Public Policy
            </p>
            <p className="text-xs text-gray-400 mt-1">University of Virginia</p>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <a
                href="mailto:battensupport@virginia.edu"
                className="hover:text-uva-orange transition-colors"
              >
                Support: battensupport@virginia.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
