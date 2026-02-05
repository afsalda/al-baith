
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-12 py-10 px-4">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h5 className="font-bold">Support</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/help" className="hover:underline cursor-pointer">Help Center</Link>
              </li>
              <li className="hover:underline cursor-pointer">Disability support</li>
              <li className="hover:underline cursor-pointer">Cancellation options</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold">Hosting</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:underline cursor-pointer">Al-Baith your home</li>
              <li className="hover:underline cursor-pointer">AirCover for Hosts</li>
              <li className="hover:underline cursor-pointer">Hosting resources</li>
              <li className="hover:underline cursor-pointer">Community forum</li>
              <li className="hover:underline cursor-pointer">Hosting responsibly</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold">Al-Baith</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:underline cursor-pointer">Newsroom</li>
              <li className="hover:underline cursor-pointer">New features</li>
              <li className="hover:underline cursor-pointer">Careers</li>
              <li className="hover:underline cursor-pointer">Investors</li>
              <li className="hover:underline cursor-pointer">Gift cards</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-bold">Social</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:underline cursor-pointer">Facebook</li>
              <li className="hover:underline cursor-pointer">Twitter</li>
              <li className="hover:underline cursor-pointer">Instagram</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div>© 2024 Al-Baith, Inc. · Privacy · Terms · Sitemap · Company details</div>
          <div className="flex gap-4 font-semibold text-gray-900">
            <span>English (US)</span>
            <span>$ USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
