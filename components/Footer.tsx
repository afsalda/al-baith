
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
              <li>
                <Link to="/cancellation-policy" className="hover:underline cursor-pointer">Cancellation options</Link>
              </li>
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
          <div>© 2026 Al-Baith, Inc. · Privacy · Terms · Sitemap · Company details</div>
          <div className="flex gap-4 font-semibold text-gray-900">
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
