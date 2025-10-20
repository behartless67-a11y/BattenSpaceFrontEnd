import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-uva-navy text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center">
          {/* Left side - Logo */}
          <div>
            <Image
              src="/bat_rgb_ko.png"
              alt="Frank Batten School of Leadership and Public Policy"
              width={250}
              height={75}
              className="h-16 w-auto"
            />
          </div>

          {/* Right side - Contact Info */}
          <div className="text-right">
            <p className="text-sm text-gray-300 mb-1">
              Frank Batten School of Leadership and Public Policy<br />
              235 McCormick Rd, Charlottesville, VA 22904
            </p>
            <p className="text-sm">
              <a
                href="mailto:battensupport@virginia.edu"
                className="hover:text-uva-orange transition-colors"
              >
                battensupport@virginia.edu
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
