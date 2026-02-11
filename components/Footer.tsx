
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
              <li>
                <Link to="/cancellation-policy" className="hover:underline cursor-pointer">Cancellation options</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:underline cursor-pointer">Admin Dashboard</Link>
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

          <div className="space-y-4">
            <h5 className="font-bold">Contact Us</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex flex-col">
                <span className="font-semibold text-xs text-gray-500">Call / WhatsApp</span>
                <a href="https://wa.me/916238304411" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-amber-800 transition-colors">6238-304411</a>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-xs text-gray-500">Call / WhatsApp</span>
                <a href="https://wa.me/918848805197" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-amber-800 transition-colors">8848805197</a>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-xs text-gray-500">Call / WhatsApp</span>
                <a href="https://wa.me/919447290936" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-amber-800 transition-colors">9447290936</a>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-xs text-gray-500">Email</span>
                <a
                  href="mailto:albaith.booking@gmail.com"
                  className="underline hover:text-amber-800 transition-colors font-medium break-all"
                  rel="noopener noreferrer"
                >
                  albaith.booking@gmail.com
                </a>
              </li>
            </ul>

          </div>

          <div className="space-y-4">
            <h5 className="font-bold">Location</h5>
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm h-64 md:h-48 w-full relative bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.1776017265493!2d76.31495617479247!3d9.919162090182168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0873f4e02b7091%3A0x14f8d912261157fd!2sAl-Baith%20Resthouse!5e0!3m2!1sen!2sin!4v1770838846090!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', inset: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Al-Baith Location"
              ></iframe>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Al-Baith+Resthouse,+Kochi,+Kerala"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 hover:text-amber-700 transition-colors mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              Get Directions
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div>© 2026 Al-Baith, Inc. · Privacy · Terms · Sitemap · Company details</div>
          <div className="flex gap-4 font-semibold text-gray-900">
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
